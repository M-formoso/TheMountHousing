from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from app.models.subcontratista import Subcontratista
from app.schemas.subcontratista import SubcontratistaCreate, SubcontratistaUpdate


class SubcontratistaService:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        especialidad: str | None = None,
    ) -> tuple[list[Subcontratista], int]:
        query = self.db.query(Subcontratista).filter(Subcontratista.activo == activo)
        if buscar:
            query = query.filter(
                Subcontratista.razon_social.ilike(f"%{buscar}%")
                | Subcontratista.contacto_principal.ilike(f"%{buscar}%")
            )
        if especialidad:
            query = query.filter(Subcontratista.especialidad == especialidad)
        total = query.count()
        items = query.order_by(Subcontratista.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Subcontratista | None:
        return self.db.query(Subcontratista).filter(
            Subcontratista.id == id, Subcontratista.activo.is_(True)
        ).first()

    def crear(self, data: SubcontratistaCreate) -> Subcontratista:
        sub = Subcontratista(id=str(uuid4()), **data.model_dump())
        self.db.add(sub)
        self.db.commit()
        self.db.refresh(sub)
        return sub

    def actualizar(self, id: str, data: SubcontratistaUpdate) -> Subcontratista | None:
        sub = self.obtener(id)
        if not sub:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(sub, key, value)
        sub.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(sub)
        return sub

    def eliminar(self, id: str) -> bool:
        sub = self.obtener(id)
        if not sub:
            return False
        sub.activo = False
        sub.updated_at = datetime.utcnow()
        self.db.commit()
        return True
