from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from app.models.material import Material, MovimientoInventario, SolicitudCompra, ItemSolicitudCompra, OrdenCompra, ItemOrdenCompra
from app.schemas.material import MaterialCreate, MaterialUpdate, MovimientoCreate, SolicitudCompraCreate, SolicitudCompraUpdate, OrdenCompraCreate, OrdenCompraUpdate


class MaterialService:
    def __init__(self, db: Session):
        self.db = db

    def _generar_codigo(self) -> str:
        ultimo = self.db.query(Material).order_by(Material.codigo.desc()).first()
        if ultimo:
            try:
                num = int(ultimo.codigo.split("-")[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f"MAT-{num:05d}"

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        categoria: str | None = None,
    ) -> tuple[list[Material], int]:
        query = self.db.query(Material).filter(Material.activo == activo)
        if buscar:
            query = query.filter(
                Material.nombre.ilike(f"%{buscar}%")
                | Material.codigo.ilike(f"%{buscar}%")
            )
        if categoria:
            query = query.filter(Material.categoria == categoria)
        total = query.count()
        items = query.order_by(Material.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Material | None:
        return self.db.query(Material).filter(
            Material.id == id, Material.activo.is_(True)
        ).first()

    def crear(self, data: MaterialCreate) -> Material:
        material = Material(
            id=str(uuid4()),
            codigo=self._generar_codigo(),
            stock_actual=0,
            **data.model_dump(),
        )
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def actualizar(self, id: str, data: MaterialUpdate) -> Material | None:
        material = self.obtener(id)
        if not material:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(material, key, value)
        material.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(material)
        return material

    def eliminar(self, id: str) -> bool:
        material = self.obtener(id)
        if not material:
            return False
        material.activo = False
        material.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    # --- Movimientos de inventario ---
    def crear_movimiento(self, data: MovimientoCreate, usuario_id: str) -> MovimientoInventario:
        material = self.obtener(data.material_id)
        if not material:
            raise ValueError("Material no encontrado")

        costo_total = data.costo_total if data.costo_total else round(data.cantidad * data.costo_unitario, 2)

        movimiento = MovimientoInventario(
            id=str(uuid4()),
            material_id=data.material_id,
            tipo=data.tipo,
            cantidad=data.cantidad,
            proyecto_id=data.proyecto_id,
            unidad_id=data.unidad_id,  # PH asignado
            usuario_id=usuario_id,
            fecha=data.fecha,
            costo_unitario=data.costo_unitario,
            costo_total=costo_total,
            notas=data.notas,
        )
        self.db.add(movimiento)

        # Actualizar stock
        if data.tipo in ("entrada", "ajuste"):
            material.stock_actual += data.cantidad
        elif data.tipo in ("salida", "merma"):
            material.stock_actual -= data.cantidad

        material.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(movimiento)
        return movimiento

    def listar_movimientos(self, material_id: str, skip: int = 0, limit: int = 20) -> tuple[list[MovimientoInventario], int]:
        query = self.db.query(MovimientoInventario).filter(MovimientoInventario.material_id == material_id)
        total = query.count()
        items = query.order_by(MovimientoInventario.fecha.desc()).offset(skip).limit(limit).all()
        return items, total

    # --- Solicitudes de compra ---
    def _generar_numero_solicitud(self) -> str:
        año = datetime.utcnow().year
        ultimo = (
            self.db.query(SolicitudCompra)
            .filter(SolicitudCompra.numero.like(f"SC-{año}-%"))
            .order_by(SolicitudCompra.numero.desc())
            .first()
        )
        num = 1
        if ultimo:
            try:
                num = int(ultimo.numero.split("-")[-1]) + 1
            except (ValueError, IndexError):
                pass
        return f"SC-{año}-{num:04d}"

    def crear_solicitud(self, data: SolicitudCompraCreate, solicitante_id: str) -> SolicitudCompra:
        solicitud = SolicitudCompra(
            id=str(uuid4()),
            numero=self._generar_numero_solicitud(),
            proyecto_id=data.proyecto_id,
            solicitante_id=solicitante_id,
            fecha_solicitud=data.fecha_solicitud,
            fecha_requerida=data.fecha_requerida,
            prioridad=data.prioridad,
            notas=data.notas,
        )
        self.db.add(solicitud)
        self.db.flush()

        total_estimado = 0.0
        for item_data in data.items:
            item = ItemSolicitudCompra(
                id=str(uuid4()),
                solicitud_id=solicitud.id,
                material_id=item_data.material_id,
                cantidad=item_data.cantidad,
                precio_estimado=item_data.precio_estimado,
                notas=item_data.notas,
            )
            self.db.add(item)
            if item_data.precio_estimado:
                total_estimado += item_data.cantidad * item_data.precio_estimado

        solicitud.total_estimado = round(total_estimado, 2)
        self.db.commit()
        self.db.refresh(solicitud)
        return solicitud

    def listar_solicitudes(
        self, skip: int = 0, limit: int = 20, estado: str | None = None
    ) -> tuple[list[SolicitudCompra], int]:
        query = self.db.query(SolicitudCompra).filter(SolicitudCompra.activo.is_(True))
        if estado:
            query = query.filter(SolicitudCompra.estado == estado)
        total = query.count()
        items = query.order_by(SolicitudCompra.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener_solicitud(self, id: str) -> SolicitudCompra | None:
        return self.db.query(SolicitudCompra).filter(
            SolicitudCompra.id == id, SolicitudCompra.activo.is_(True)
        ).first()

    def actualizar_solicitud(self, id: str, data: SolicitudCompraUpdate) -> SolicitudCompra | None:
        solicitud = self.obtener_solicitud(id)
        if not solicitud:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(solicitud, key, value)
        self.db.commit()
        self.db.refresh(solicitud)
        return solicitud

    # --- Órdenes de compra ---
    def _generar_numero_orden(self) -> str:
        año = datetime.utcnow().year
        ultimo = (
            self.db.query(OrdenCompra)
            .filter(OrdenCompra.numero.like(f"OC-{año}-%"))
            .order_by(OrdenCompra.numero.desc())
            .first()
        )
        num = 1
        if ultimo:
            try:
                num = int(ultimo.numero.split("-")[-1]) + 1
            except (ValueError, IndexError):
                pass
        return f"OC-{año}-{num:04d}"

    def crear_orden(self, data: OrdenCompraCreate) -> OrdenCompra:
        orden = OrdenCompra(
            id=str(uuid4()),
            numero=self._generar_numero_orden(),
            proveedor_id=data.proveedor_id,
            solicitud_compra_id=data.solicitud_compra_id,
            fecha_orden=data.fecha_orden,
            fecha_entrega_esperada=data.fecha_entrega_esperada,
            condiciones_pago=data.condiciones_pago,
            notas=data.notas,
        )
        self.db.add(orden)
        self.db.flush()

        subtotal = 0.0
        for item_data in data.items:
            importe = round(item_data.cantidad * item_data.precio_unitario, 2)
            subtotal += importe
            item = ItemOrdenCompra(
                id=str(uuid4()),
                orden_id=orden.id,
                material_id=item_data.material_id,
                cantidad=item_data.cantidad,
                precio_unitario=item_data.precio_unitario,
                importe=importe,
            )
            self.db.add(item)

        iva = round(subtotal * 0.16, 2)
        orden.subtotal = round(subtotal, 2)
        orden.iva = iva
        orden.total = round(subtotal + iva, 2)
        self.db.commit()
        self.db.refresh(orden)
        return orden

    def listar_ordenes(
        self, skip: int = 0, limit: int = 20, estado: str | None = None
    ) -> tuple[list[OrdenCompra], int]:
        query = self.db.query(OrdenCompra).filter(OrdenCompra.activo.is_(True))
        if estado:
            query = query.filter(OrdenCompra.estado == estado)
        total = query.count()
        items = query.order_by(OrdenCompra.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener_orden(self, id: str) -> OrdenCompra | None:
        return self.db.query(OrdenCompra).filter(
            OrdenCompra.id == id, OrdenCompra.activo.is_(True)
        ).first()

    def actualizar_orden(self, id: str, data: OrdenCompraUpdate) -> OrdenCompra | None:
        orden = self.obtener_orden(id)
        if not orden:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(orden, key, value)
        self.db.commit()
        self.db.refresh(orden)
        return orden
