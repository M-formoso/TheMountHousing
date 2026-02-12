from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from app.models.finanzas import Ingreso, Egreso, CuentaPorCobrar, PagoCuentaCobrar, CuentaPorPagar, PagoCuentaPagar
from app.schemas.finanzas import (
    IngresoCreate, EgresoCreate, EgresoUpdate,
    CuentaCobrarCreate, PagoCobrarCreate,
    CuentaPagearCreate, PagoPagearCreate,
)


class FinanzasService:
    def __init__(self, db: Session):
        self.db = db

    # --- Ingresos ---
    def crear_ingreso(self, data: IngresoCreate, usuario_id: str) -> Ingreso:
        ingreso = Ingreso(
            id=str(uuid4()),
            registrado_por_id=usuario_id,
            **data.model_dump(),
        )
        self.db.add(ingreso)
        self.db.commit()
        self.db.refresh(ingreso)
        return ingreso

    def listar_ingresos(
        self, skip: int = 0, limit: int = 20,
        proyecto_id: str | None = None,
        tipo: str | None = None,
    ) -> tuple[list[Ingreso], int]:
        query = self.db.query(Ingreso).filter(Ingreso.activo.is_(True))
        if proyecto_id:
            query = query.filter(Ingreso.proyecto_id == proyecto_id)
        if tipo:
            query = query.filter(Ingreso.tipo == tipo)
        total = query.count()
        items = query.order_by(Ingreso.fecha.desc()).offset(skip).limit(limit).all()
        return items, total

    def eliminar_ingreso(self, id: str) -> bool:
        ingreso = self.db.query(Ingreso).filter(Ingreso.id == id, Ingreso.activo.is_(True)).first()
        if not ingreso:
            return False
        ingreso.activo = False
        self.db.commit()
        return True

    # --- Egresos ---
    def crear_egreso(self, data: EgresoCreate) -> Egreso:
        egreso = Egreso(id=str(uuid4()), **data.model_dump())
        self.db.add(egreso)
        self.db.commit()
        self.db.refresh(egreso)
        return egreso

    def listar_egresos(
        self, skip: int = 0, limit: int = 20,
        proyecto_id: str | None = None,
        categoria: str | None = None,
        estado_pago: str | None = None,
    ) -> tuple[list[Egreso], int]:
        query = self.db.query(Egreso).filter(Egreso.activo.is_(True))
        if proyecto_id:
            query = query.filter(Egreso.proyecto_id == proyecto_id)
        if categoria:
            query = query.filter(Egreso.categoria == categoria)
        if estado_pago:
            query = query.filter(Egreso.estado_pago == estado_pago)
        total = query.count()
        items = query.order_by(Egreso.fecha.desc()).offset(skip).limit(limit).all()
        return items, total

    def actualizar_egreso(self, id: str, data: EgresoUpdate) -> Egreso | None:
        egreso = self.db.query(Egreso).filter(Egreso.id == id, Egreso.activo.is_(True)).first()
        if not egreso:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(egreso, key, value)
        self.db.commit()
        self.db.refresh(egreso)
        return egreso

    def eliminar_egreso(self, id: str) -> bool:
        egreso = self.db.query(Egreso).filter(Egreso.id == id, Egreso.activo.is_(True)).first()
        if not egreso:
            return False
        egreso.activo = False
        self.db.commit()
        return True

    # --- Cuentas por Cobrar ---
    def crear_cuenta_cobrar(self, data: CuentaCobrarCreate) -> CuentaPorCobrar:
        cuenta = CuentaPorCobrar(
            id=str(uuid4()),
            saldo=data.monto_total,
            **data.model_dump(),
        )
        self.db.add(cuenta)
        self.db.commit()
        self.db.refresh(cuenta)
        return cuenta

    def listar_cuentas_cobrar(
        self, skip: int = 0, limit: int = 20, estado: str | None = None
    ) -> tuple[list[CuentaPorCobrar], int]:
        query = self.db.query(CuentaPorCobrar).filter(CuentaPorCobrar.activo.is_(True))
        if estado:
            query = query.filter(CuentaPorCobrar.estado == estado)
        total = query.count()
        items = query.order_by(CuentaPorCobrar.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener_cuenta_cobrar(self, id: str) -> CuentaPorCobrar | None:
        return self.db.query(CuentaPorCobrar).filter(
            CuentaPorCobrar.id == id, CuentaPorCobrar.activo.is_(True)
        ).first()

    def agregar_pago_cobrar(self, cuenta_id: str, data: PagoCobrarCreate) -> PagoCuentaCobrar | None:
        cuenta = self.obtener_cuenta_cobrar(cuenta_id)
        if not cuenta:
            return None
        pago = PagoCuentaCobrar(
            id=str(uuid4()),
            cuenta_id=cuenta_id,
            **data.model_dump(),
        )
        self.db.add(pago)
        cuenta.monto_pagado += data.monto
        cuenta.saldo = cuenta.monto_total - cuenta.monto_pagado
        if cuenta.saldo <= 0:
            cuenta.estado = "pagada"
        elif cuenta.monto_pagado > 0:
            cuenta.estado = "parcial"
        self.db.commit()
        self.db.refresh(pago)
        return pago

    # --- Cuentas por Pagar ---
    def crear_cuenta_pagar(self, data: CuentaPagearCreate) -> CuentaPorPagar:
        cuenta = CuentaPorPagar(
            id=str(uuid4()),
            saldo=data.monto_total,
            **data.model_dump(),
        )
        self.db.add(cuenta)
        self.db.commit()
        self.db.refresh(cuenta)
        return cuenta

    def listar_cuentas_pagar(
        self, skip: int = 0, limit: int = 20, estado: str | None = None
    ) -> tuple[list[CuentaPorPagar], int]:
        query = self.db.query(CuentaPorPagar).filter(CuentaPorPagar.activo.is_(True))
        if estado:
            query = query.filter(CuentaPorPagar.estado == estado)
        total = query.count()
        items = query.order_by(CuentaPorPagar.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener_cuenta_pagar(self, id: str) -> CuentaPorPagar | None:
        return self.db.query(CuentaPorPagar).filter(
            CuentaPorPagar.id == id, CuentaPorPagar.activo.is_(True)
        ).first()

    def agregar_pago_pagar(self, cuenta_id: str, data: PagoPagearCreate) -> PagoCuentaPagar | None:
        cuenta = self.obtener_cuenta_pagar(cuenta_id)
        if not cuenta:
            return None
        pago = PagoCuentaPagar(
            id=str(uuid4()),
            cuenta_id=cuenta_id,
            **data.model_dump(),
        )
        self.db.add(pago)
        cuenta.monto_pagado += data.monto
        cuenta.saldo = cuenta.monto_total - cuenta.monto_pagado
        if cuenta.saldo <= 0:
            cuenta.estado = "pagada"
        elif cuenta.monto_pagado > 0:
            cuenta.estado = "parcial"
        self.db.commit()
        self.db.refresh(pago)
        return pago
