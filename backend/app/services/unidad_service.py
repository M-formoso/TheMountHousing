from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
from typing import List, Optional
from app.models.unidad import Unidad
from app.schemas.unidad import UnidadCreate, UnidadUpdate


class UnidadService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100, proyecto_id: Optional[str] = None) -> List[Unidad]:
        query = self.db.query(Unidad).filter(Unidad.activo.is_(True))
        if proyecto_id:
            query = query.filter(Unidad.proyecto_id == proyecto_id)
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, unidad_id: str) -> Optional[Unidad]:
        return self.db.query(Unidad).filter(
            Unidad.id == unidad_id,
            Unidad.activo.is_(True)
        ).first()

    def get_by_cliente(self, cliente_id: str) -> List[Unidad]:
        """Obtiene todas las unidades de un cliente"""
        return self.db.query(Unidad).filter(
            Unidad.cliente_id == cliente_id,
            Unidad.activo.is_(True)
        ).all()

    def get_disponibles(self, proyecto_id: Optional[str] = None) -> List[Unidad]:
        """Obtiene unidades disponibles"""
        query = self.db.query(Unidad).filter(
            Unidad.estado == "disponible",
            Unidad.activo.is_(True)
        )
        if proyecto_id:
            query = query.filter(Unidad.proyecto_id == proyecto_id)
        return query.all()

    def create(self, data: UnidadCreate) -> Unidad:
        unidad = Unidad(
            id=str(uuid4()),
            **data.model_dump()
        )
        self.db.add(unidad)
        self.db.commit()
        self.db.refresh(unidad)
        return unidad

    def update(self, unidad_id: str, data: UnidadUpdate) -> Optional[Unidad]:
        unidad = self.get_by_id(unidad_id)
        if not unidad:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(unidad, key, value)

        unidad.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(unidad)
        return unidad

    def delete(self, unidad_id: str) -> bool:
        """Soft delete"""
        unidad = self.get_by_id(unidad_id)
        if not unidad:
            return False

        unidad.activo = False
        unidad.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def asignar_cliente(self, unidad_id: str, cliente_id: str) -> Optional[Unidad]:
        """Asigna una unidad a un cliente (venta)"""
        unidad = self.get_by_id(unidad_id)
        if not unidad:
            return None

        unidad.cliente_id = cliente_id
        unidad.estado = "vendida"
        unidad.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(unidad)
        return unidad

    def liberar_unidad(self, unidad_id: str) -> Optional[Unidad]:
        """Libera una unidad (cancelar venta)"""
        unidad = self.get_by_id(unidad_id)
        if not unidad:
            return None

        unidad.cliente_id = None
        unidad.estado = "disponible"
        unidad.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(unidad)
        return unidad
