from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from app.models.empleado import Empleado
from app.schemas.empleado import EmpleadoCreate, EmpleadoUpdate


class EmpleadoService:
    def __init__(self, db: Session):
        self.db = db

    def _generar_numero(self) -> str:
        ultimo = (
            self.db.query(Empleado)
            .order_by(Empleado.numero_empleado.desc())
            .first()
        )
        if ultimo:
            try:
                num = int(ultimo.numero_empleado.split("-")[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f"EMP-{num:05d}"

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        departamento: str | None = None,
    ) -> tuple[list[Empleado], int]:
        query = self.db.query(Empleado).filter(Empleado.activo == activo)
        if buscar:
            query = query.filter(
                Empleado.nombre.ilike(f"%{buscar}%")
                | Empleado.apellido_paterno.ilike(f"%{buscar}%")
                | Empleado.numero_empleado.ilike(f"%{buscar}%")
            )
        if departamento:
            query = query.filter(Empleado.departamento == departamento)
        total = query.count()
        items = query.order_by(Empleado.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Empleado | None:
        return self.db.query(Empleado).filter(
            Empleado.id == id, Empleado.activo.is_(True)
        ).first()

    def crear(self, data: EmpleadoCreate) -> Empleado:
        empleado = Empleado(
            id=str(uuid4()),
            numero_empleado=self._generar_numero(),
            **data.model_dump(),
        )
        self.db.add(empleado)
        self.db.commit()
        self.db.refresh(empleado)
        return empleado

    def actualizar(self, id: str, data: EmpleadoUpdate) -> Empleado | None:
        empleado = self.obtener(id)
        if not empleado:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(empleado, key, value)
        empleado.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(empleado)
        return empleado

    def eliminar(self, id: str) -> bool:
        empleado = self.obtener(id)
        if not empleado:
            return False
        empleado.activo = False
        empleado.updated_at = datetime.utcnow()
        self.db.commit()
        return True
