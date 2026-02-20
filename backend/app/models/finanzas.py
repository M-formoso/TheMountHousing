import enum
from sqlalchemy import Column, String, Integer, Numeric, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class TipoIngreso(str, enum.Enum):
    PAGO_CLIENTE = "pago_cliente"
    ANTICIPO = "anticipo"
    FINIQUITO = "finiquito"
    OTROS = "otros"


class CategoriaEgreso(str, enum.Enum):
    MATERIALES = "materiales"
    MANO_OBRA = "mano_obra"
    SUBCONTRATISTAS = "subcontratistas"
    MAQUINARIA = "maquinaria"
    GASTOS_GENERALES = "gastos_generales"
    IMPUESTOS = "impuestos"
    OTROS = "otros"


class MetodoPago(str, enum.Enum):
    TRANSFERENCIA = "transferencia"
    CHEQUE = "cheque"
    EFECTIVO = "efectivo"
    TARJETA = "tarjeta"


class EstadoPago(str, enum.Enum):
    PENDIENTE = "pendiente"
    PAGADO = "pagado"
    PARCIAL = "parcial"


class Ingreso(BaseModel):
    __tablename__ = "ingresos"

    tipo = Column(SAEnum(TipoIngreso), nullable=False)
    concepto = Column(String(255), nullable=False)
    monto = Column(Numeric(15, 2), nullable=False)
    fecha = Column(Date, nullable=False)

    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=True)

    metodo_pago = Column(SAEnum(MetodoPago), nullable=True)
    referencia = Column(String(100), nullable=True)
    factura = Column(String(100), nullable=True)
    comprobante_url = Column(String(500), nullable=True)

    notas = Column(String, nullable=True)
    registrado_por_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)


class Egreso(BaseModel):
    __tablename__ = "egresos"

    categoria = Column(SAEnum(CategoriaEgreso), nullable=False)
    subcategoria = Column(String(100), nullable=True)
    concepto = Column(String(255), nullable=False)
    monto = Column(Numeric(15, 2), nullable=False)
    fecha = Column(Date, nullable=False)

    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    unidad_id = Column(String(36), ForeignKey("unidades.id"), nullable=True)  # PH asignado
    proveedor_id = Column(String(36), ForeignKey("proveedores.id"), nullable=True)
    subcontratista_id = Column(String(36), ForeignKey("subcontratistas.id"), nullable=True)
    empleado_id = Column(String(36), ForeignKey("empleados.id"), nullable=True)

    metodo_pago = Column(SAEnum(MetodoPago), nullable=True)
    referencia = Column(String(100), nullable=True)
    factura = Column(String(100), nullable=True)
    comprobante_url = Column(String(500), nullable=True)

    autorizado_por_id = Column(String(36), ForeignKey("usuarios.id"), nullable=True)
    estado_pago = Column(SAEnum(EstadoPago), default=EstadoPago.PENDIENTE)

    notas = Column(String, nullable=True)

    # Relación con unidad
    unidad = relationship("Unidad", back_populates="egresos")


class CuentaPorCobrar(BaseModel):
    __tablename__ = "cuentas_por_cobrar"

    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False)
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    concepto = Column(String(255), nullable=False)
    monto_total = Column(Numeric(15, 2), nullable=False)
    monto_pagado = Column(Numeric(15, 2), default=0)
    saldo = Column(Numeric(15, 2), nullable=False)
    fecha_emision = Column(Date, nullable=False)
    fecha_vencimiento = Column(Date, nullable=True)
    estado = Column(String(30), default="pendiente")  # pendiente, parcial, pagada, vencida

    # Relaciones
    pagos = relationship("PagoCuentaCobrar", back_populates="cuenta", cascade="all, delete-orphan")


class PagoCuentaCobrar(BaseModel):
    __tablename__ = "pagos_cuenta_cobrar"

    cuenta_id = Column(String(36), ForeignKey("cuentas_por_cobrar.id"), nullable=False)
    monto = Column(Numeric(15, 2), nullable=False)
    fecha = Column(Date, nullable=False)
    metodo_pago = Column(SAEnum(MetodoPago), nullable=True)
    referencia = Column(String(100), nullable=True)
    notas = Column(String, nullable=True)

    # Relación
    cuenta = relationship("CuentaPorCobrar", back_populates="pagos")


class CuentaPorPagar(BaseModel):
    __tablename__ = "cuentas_por_pagar"

    proveedor_id = Column(String(36), ForeignKey("proveedores.id"), nullable=True)
    subcontratista_id = Column(String(36), ForeignKey("subcontratistas.id"), nullable=True)
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    concepto = Column(String(255), nullable=False)
    monto_total = Column(Numeric(15, 2), nullable=False)
    monto_pagado = Column(Numeric(15, 2), default=0)
    saldo = Column(Numeric(15, 2), nullable=False)
    fecha_emision = Column(Date, nullable=False)
    fecha_vencimiento = Column(Date, nullable=True)
    estado = Column(String(30), default="pendiente")  # pendiente, parcial, pagada, vencida
    prioridad = Column(String(10), default="media")  # baja, media, alta

    # Relaciones
    pagos = relationship("PagoCuentaPagar", back_populates="cuenta", cascade="all, delete-orphan")


class PagoCuentaPagar(BaseModel):
    __tablename__ = "pagos_cuenta_pagar"

    cuenta_id = Column(String(36), ForeignKey("cuentas_por_pagar.id"), nullable=False)
    monto = Column(Numeric(15, 2), nullable=False)
    fecha = Column(Date, nullable=False)
    metodo_pago = Column(SAEnum(MetodoPago), nullable=True)
    referencia = Column(String(100), nullable=True)
    notas = Column(String, nullable=True)

    # Relación
    cuenta = relationship("CuentaPorPagar", back_populates="pagos")
