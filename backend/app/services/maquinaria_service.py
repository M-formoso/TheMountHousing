from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from app.models.maquinaria import Maquinaria, MantenimientoMaquinaria
from app.schemas.maquinaria import MaquinariaCreate, MaquinariaUpdate, MantenimientoCreate


class MaquinariaService:
    def __init__(self, db: Session):
        self.db = db

    def _generar_codigo(self) -> str:
        ultimo = self.db.query(Maquinaria).order_by(Maquinaria.codigo.desc()).first()
        if ultimo:
            try:
                num = int(ultimo.codigo.split("-")[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f"MAQ-{num:04d}"

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        tipo: str | None = None,
        estado: str | None = None,
    ) -> tuple[list[Maquinaria], int]:
        query = self.db.query(Maquinaria).filter(Maquinaria.activo == activo)
        if buscar:
            query = query.filter(
                Maquinaria.nombre.ilike(f"%{buscar}%")
                | Maquinaria.codigo.ilike(f"%{buscar}%")
                | Maquinaria.placas.ilike(f"%{buscar}%")
            )
        if tipo:
            query = query.filter(Maquinaria.tipo == tipo)
        if estado:
            query = query.filter(Maquinaria.estado == estado)
        total = query.count()
        items = query.order_by(Maquinaria.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Maquinaria | None:
        return self.db.query(Maquinaria).filter(
            Maquinaria.id == id, Maquinaria.activo.is_(True)
        ).first()

    def crear(self, data: MaquinariaCreate) -> Maquinaria:
        maquinaria = Maquinaria(
            id=str(uuid4()),
            codigo=self._generar_codigo(),
            estado="operativa",
            **data.model_dump(),
        )
        self.db.add(maquinaria)
        self.db.commit()
        self.db.refresh(maquinaria)
        return maquinaria

    def actualizar(self, id: str, data: MaquinariaUpdate) -> Maquinaria | None:
        maquinaria = self.obtener(id)
        if not maquinaria:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(maquinaria, key, value)
        maquinaria.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(maquinaria)
        return maquinaria

    def eliminar(self, id: str) -> bool:
        maquinaria = self.obtener(id)
        if not maquinaria:
            return False
        maquinaria.activo = False
        maquinaria.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    # --- Mantenimientos ---
    def crear_mantenimiento(self, maquinaria_id: str, data: MantenimientoCreate) -> MantenimientoMaquinaria | None:
        maquinaria = self.obtener(maquinaria_id)
        if not maquinaria:
            return None
        mant = MantenimientoMaquinaria(
            id=str(uuid4()),
            maquinaria_id=maquinaria_id,
            tipo=data.tipo,
            descripcion=data.descripcion,
            fecha=data.fecha,
            costo=data.costo,
            proveedor=data.proveedor,
            realizado_por=data.realizado_por,
            notas=data.notas,
        )
        self.db.add(mant)
        maquinaria.fecha_ultimo_mantenimiento = data.fecha
        maquinaria.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(mant)
        return mant

    def listar_mantenimientos(self, maquinaria_id: str, skip: int = 0, limit: int = 20) -> tuple[list[MantenimientoMaquinaria], int]:
        query = self.db.query(MantenimientoMaquinaria).filter(MantenimientoMaquinaria.maquinaria_id == maquinaria_id)
        total = query.count()
        items = query.order_by(MantenimientoMaquinaria.fecha.desc()).offset(skip).limit(limit).all()
        return items, total
