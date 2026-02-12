from sqlalchemy.orm import Session
from datetime import datetime, date
from uuid import uuid4
from app.models.proyecto import Proyecto, FaseProyecto, EntradaBitacora
from app.schemas.proyecto import ProyectoCreate, ProyectoUpdate, FaseProyectoCreate, FaseProyectoUpdate, EntradaBitacoraCreate


def _generar_codigo_proyecto(db: Session) -> str:
    """Genera código único tipo OBRA-2024-001."""
    anio = date.today().year
    prefijo = f"OBRA-{anio}-"
    ultimo = db.query(Proyecto).filter(
        Proyecto.codigo.like(f"{prefijo}%")
    ).order_by(Proyecto.codigo.desc()).first()

    if ultimo:
        numero = int(ultimo.codigo.split("-")[-1]) + 1
    else:
        numero = 1
    return f"{prefijo}{numero:03d}"


class ProyectoService:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        estado: str | None = None,
        tipo: str | None = None,
        cliente_id: str | None = None,
    ) -> tuple[list[Proyecto], int]:
        query = self.db.query(Proyecto).filter(Proyecto.activo == activo)

        if buscar:
            query = query.filter(Proyecto.nombre.ilike(f"%{buscar}%"))
        if estado:
            query = query.filter(Proyecto.estado == estado)
        if tipo:
            query = query.filter(Proyecto.tipo == tipo)
        if cliente_id:
            query = query.filter(Proyecto.cliente_id == cliente_id)

        total = query.count()
        items = query.order_by(Proyecto.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Proyecto | None:
        return self.db.query(Proyecto).filter(
            Proyecto.id == id,
            Proyecto.activo.is_(True),
        ).first()

    def crear(self, data: ProyectoCreate) -> Proyecto:
        codigo = _generar_codigo_proyecto(self.db)
        proyecto = Proyecto(
            id=str(uuid4()),
            codigo=codigo,
            **data.model_dump(),
        )
        self.db.add(proyecto)
        self.db.commit()
        self.db.refresh(proyecto)
        return proyecto

    def actualizar(self, id: str, data: ProyectoUpdate) -> Proyecto | None:
        proyecto = self.obtener(id)
        if not proyecto:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(proyecto, key, value)
        proyecto.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(proyecto)
        return proyecto

    def eliminar(self, id: str) -> bool:
        proyecto = self.obtener(id)
        if not proyecto:
            return False
        proyecto.activo = False
        proyecto.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    # --- Fases ---
    def crear_fase(self, proyecto_id: str, data: FaseProyectoCreate) -> FaseProyecto | None:
        proyecto = self.obtener(proyecto_id)
        if not proyecto:
            return None
        fase = FaseProyecto(
            id=str(uuid4()),
            proyecto_id=proyecto_id,
            **data.model_dump(),
        )
        self.db.add(fase)
        self.db.commit()
        self.db.refresh(fase)
        return fase

    def obtener_fase(self, proyecto_id: str, fase_id: str) -> FaseProyecto | None:
        return self.db.query(FaseProyecto).filter(
            FaseProyecto.id == fase_id,
            FaseProyecto.proyecto_id == proyecto_id,
            FaseProyecto.activo.is_(True),
        ).first()

    def actualizar_fase(self, proyecto_id: str, fase_id: str, data: FaseProyectoUpdate) -> FaseProyecto | None:
        fase = self.obtener_fase(proyecto_id, fase_id)
        if not fase:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(fase, key, value)
        fase.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(fase)

        # Recalcular progreso general del proyecto
        self._recalcular_progreso(proyecto_id)
        return fase

    def listar_fases(self, proyecto_id: str) -> list[FaseProyecto]:
        return self.db.query(FaseProyecto).filter(
            FaseProyecto.proyecto_id == proyecto_id,
            FaseProyecto.activo.is_(True),
        ).order_by(FaseProyecto.numero_fase).all()

    def _recalcular_progreso(self, proyecto_id: str):
        fases = self.listar_fases(proyecto_id)
        if not fases:
            return
        progreso = sum(f.progreso for f in fases) // len(fases)
        proyecto = self.obtener(proyecto_id)
        if proyecto:
            proyecto.progreso_general = progreso
            self.db.commit()

    # --- Bitácora ---
    def crear_entrada_bitacora(self, proyecto_id: str, data: EntradaBitacoraCreate, autor_id: str) -> EntradaBitacora | None:
        proyecto = self.obtener(proyecto_id)
        if not proyecto:
            return None
        entrada = EntradaBitacora(
            id=str(uuid4()),
            proyecto_id=proyecto_id,
            autor_id=autor_id,
            **data.model_dump(),
        )
        self.db.add(entrada)
        self.db.commit()
        self.db.refresh(entrada)
        return entrada

    def listar_bitacora(self, proyecto_id: str, skip: int = 0, limit: int = 20) -> tuple[list[EntradaBitacora], int]:
        query = self.db.query(EntradaBitacora).filter(
            EntradaBitacora.proyecto_id == proyecto_id,
        ).order_by(EntradaBitacora.created_at.desc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total
