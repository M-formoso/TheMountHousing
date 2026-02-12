from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from app.models.proveedor import Proveedor
from app.schemas.proveedor import ProveedorCreate, ProveedorUpdate


class ProveedorService:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        tipo: str | None = None,
    ) -> tuple[list[Proveedor], int]:
        query = self.db.query(Proveedor).filter(Proveedor.activo == activo)
        if buscar:
            query = query.filter(
                Proveedor.razon_social.ilike(f"%{buscar}%")
                | Proveedor.contacto_principal.ilike(f"%{buscar}%")
            )
        if tipo:
            query = query.filter(Proveedor.tipo == tipo)
        total = query.count()
        items = query.order_by(Proveedor.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Proveedor | None:
        return self.db.query(Proveedor).filter(
            Proveedor.id == id, Proveedor.activo.is_(True)
        ).first()

    def crear(self, data: ProveedorCreate) -> Proveedor:
        proveedor = Proveedor(id=str(uuid4()), **data.model_dump())
        self.db.add(proveedor)
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def actualizar(self, id: str, data: ProveedorUpdate) -> Proveedor | None:
        proveedor = self.obtener(id)
        if not proveedor:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(proveedor, key, value)
        # Recalcular calificacion_general si se actualizó alguna calificación
        if any(k in update_data for k in ("calificacion_calidad", "calificacion_precio", "calificacion_servicio")):
            cal = (proveedor.calificacion_calidad + proveedor.calificacion_precio + proveedor.calificacion_servicio) / 3
            proveedor.calificacion_general = round(cal, 1)
        proveedor.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def eliminar(self, id: str) -> bool:
        proveedor = self.obtener(id)
        if not proveedor:
            return False
        proveedor.activo = False
        proveedor.updated_at = datetime.utcnow()
        self.db.commit()
        return True
