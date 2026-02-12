from sqlalchemy.orm import Session
from datetime import datetime, date
from uuid import uuid4
from app.models.cotizacion import Cotizacion, PartidaCotizacion
from app.schemas.cotizacion import CotizacionCreate, CotizacionUpdate


class CotizacionService:
    def __init__(self, db: Session):
        self.db = db

    def _generar_numero(self) -> str:
        año = datetime.utcnow().year
        ultimo = (
            self.db.query(Cotizacion)
            .filter(Cotizacion.numero.like(f"COT-{año}-%"))
            .order_by(Cotizacion.numero.desc())
            .first()
        )
        if ultimo:
            try:
                num = int(ultimo.numero.split("-")[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f"COT-{año}-{num:03d}"

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        estado: str | None = None,
        cliente_id: str | None = None,
    ) -> tuple[list[Cotizacion], int]:
        query = self.db.query(Cotizacion).filter(Cotizacion.activo == activo)
        if buscar:
            query = query.filter(
                Cotizacion.numero.ilike(f"%{buscar}%")
                | Cotizacion.proyecto_nombre.ilike(f"%{buscar}%")
            )
        if estado:
            query = query.filter(Cotizacion.estado == estado)
        if cliente_id:
            query = query.filter(Cotizacion.cliente_id == cliente_id)
        total = query.count()
        items = query.order_by(Cotizacion.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Cotizacion | None:
        return self.db.query(Cotizacion).filter(
            Cotizacion.id == id, Cotizacion.activo.is_(True)
        ).first()

    def crear(self, data: CotizacionCreate, usuario_id: str) -> Cotizacion:
        cotizacion = Cotizacion(
            id=str(uuid4()),
            numero=self._generar_numero(),
            version=1,
            fecha_emision=data.fecha_emision,
            fecha_vigencia=data.fecha_vigencia,
            cliente_id=data.cliente_id,
            proyecto_nombre=data.proyecto_nombre,
            proyecto_descripcion=data.proyecto_descripcion,
            proyecto_ubicacion=data.proyecto_ubicacion,
            margen_utilidad=data.margen_utilidad,
            condiciones_pago=data.condiciones_pago,
            tiempo_ejecucion_dias=data.tiempo_ejecucion_dias,
            garantia=data.garantia,
            notas=data.notas,
            elaborada_por_id=usuario_id,
        )
        self.db.add(cotizacion)
        self.db.flush()

        subtotal = 0.0
        for i, partida_data in enumerate(data.partidas, start=1):
            importe = partida_data.cantidad * partida_data.precio_unitario
            subtotal += importe
            partida = PartidaCotizacion(
                id=str(uuid4()),
                cotizacion_id=cotizacion.id,
                numero_partida=partida_data.numero_partida or i,
                concepto=partida_data.concepto,
                descripcion=partida_data.descripcion,
                unidad=partida_data.unidad,
                cantidad=partida_data.cantidad,
                precio_unitario=partida_data.precio_unitario,
                importe=importe,
                incluye_material=partida_data.incluye_material,
                incluye_mano_obra=partida_data.incluye_mano_obra,
                incluye_maquinaria=partida_data.incluye_maquinaria,
                mano_obra_horas=partida_data.mano_obra_horas,
                costo_mano_obra=partida_data.costo_mano_obra,
            )
            self.db.add(partida)

        iva = round(subtotal * 0.16, 2)
        cotizacion.subtotal = round(subtotal, 2)
        cotizacion.iva = iva
        cotizacion.total = round(subtotal + iva, 2)

        self.db.commit()
        self.db.refresh(cotizacion)
        return cotizacion

    def actualizar(self, id: str, data: CotizacionUpdate) -> Cotizacion | None:
        cotizacion = self.obtener(id)
        if not cotizacion:
            return None
        update_data = data.model_dump(exclude_unset=True)
        if "estado" in update_data and update_data["estado"] == "aceptada":
            update_data["aprobada_por_id"] = cotizacion.elaborada_por_id
            update_data["fecha_aprobacion"] = datetime.utcnow()
        for key, value in update_data.items():
            setattr(cotizacion, key, value)
        cotizacion.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(cotizacion)
        return cotizacion

    def eliminar(self, id: str) -> bool:
        cotizacion = self.obtener(id)
        if not cotizacion:
            return False
        cotizacion.activo = False
        cotizacion.updated_at = datetime.utcnow()
        self.db.commit()
        return True
