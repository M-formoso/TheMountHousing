import enum
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Enum as SAEnum, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CategoriaProveedor(str, enum.Enum):
    MATERIALES = "materiales"
    MANO_DE_OBRA = "mano_de_obra"
    SERVICIOS = "servicios"
    EQUIPAMIENTO = "equipamiento"
    OTROS = "otros"


class EstadoProveedor(str, enum.Enum):
    ACTIVO = "activo"
    INACTIVO = "inactivo"
    SUSPENDIDO = "suspendido"


class EspecialidadContratista(str, enum.Enum):
    ALBANILERIA = "albanileria"
    PLOMERIA = "plomeria"
    ELECTRICIDAD = "electricidad"
    ACABADOS = "acabados"
    CARPINTERIA = "carpinteria"
    PINTURA = "pintura"
    SOLDADURA = "soldadura"
    VIDRIERIA = "vidrieria"
    JARDINERIA = "jardineria"
    IMPERMEABILIZACION = "impermeabilizacion"
    HERRERIA = "herreria"
    GENERAL = "general"
    OTRO = "otro"


class TipoAccion(str, enum.Enum):
    COMPUTO = "computo"
    ACOPIO = "acopio"
    CUENTA_CORRIENTE = "cuenta_corriente"
    PEDIDO = "pedido"
    ENTREGA = "entrega"
    PAGO = "pago"
    AJUSTE = "ajuste"
    OTRO = "otro"


class EstadoAccion(str, enum.Enum):
    PENDIENTE = "pendiente"
    EN_PROCESO = "en_proceso"
    COMPLETADO = "completado"
    CANCELADO = "cancelado"


class Proveedor(BaseModel):
    __tablename__ = "proveedores"

    razon_social = Column(String(255), nullable=False, index=True)
    nombre_comercial = Column(String(255), nullable=True)
    rfc = Column(String(13), nullable=True, index=True)

    categoria = Column(SAEnum(CategoriaProveedor), nullable=False, default=CategoriaProveedor.MATERIALES)
    estado = Column(SAEnum(EstadoProveedor), nullable=False, default=EstadoProveedor.ACTIVO)

    # Para contratistas (mano de obra)
    especialidad = Column(SAEnum(EspecialidadContratista), nullable=True)

    contacto_principal = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)
    telefono_alternativo = Column(String(20), nullable=True)

    direccion = Column(String(500), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado_geo = Column(String(100), nullable=True)
    codigo_postal = Column(String(10), nullable=True)
    sitio_web = Column(String(255), nullable=True)

    # Datos bancarios
    banco = Column(String(100), nullable=True)
    cuenta_bancaria = Column(String(50), nullable=True)
    clabe = Column(String(18), nullable=True)

    # Licencia y seguros (importante para contratistas)
    numero_licencia = Column(String(50), nullable=True)
    tiene_seguro = Column(Boolean, default=False)
    aseguradora = Column(String(100), nullable=True)
    numero_poliza = Column(String(50), nullable=True)
    vigencia_seguro = Column(Date, nullable=True)

    # Condiciones comerciales
    condiciones_pago = Column(String, nullable=True)
    dias_credito = Column(Integer, default=30)
    descuento_pronto_pago = Column(Numeric(5, 2), default=0)
    tiempo_entrega_dias = Column(Integer, nullable=True)

    # Calificación simple (1-5 estrellas)
    calificacion = Column(Integer, default=0)

    # Totales financieros
    total_pagado = Column(Numeric(15, 2), default=0)
    total_pendiente = Column(Numeric(15, 2), default=0)

    # Historial
    trabajos_completados = Column(Integer, default=0)
    ultima_actividad = Column(Date, nullable=True)

    preferido = Column(Boolean, default=False)
    notas = Column(String, nullable=True)

    # Relación con acciones
    acciones = relationship("AccionProveedor", back_populates="proveedor", cascade="all, delete-orphan")


class AccionProveedor(BaseModel):
    __tablename__ = "acciones_proveedores"

    proveedor_id = Column(String(36), ForeignKey("proveedores.id"), nullable=False, index=True)

    tipo = Column(SAEnum(TipoAccion), nullable=False)
    descripcion = Column(String(500), nullable=False)
    monto = Column(Numeric(15, 2), nullable=True)
    fecha = Column(Date, nullable=False)
    estado = Column(SAEnum(EstadoAccion), nullable=False, default=EstadoAccion.PENDIENTE)
    referencia = Column(String(100), nullable=True)
    notas = Column(String, nullable=True)

    # Relaciones
    proveedor = relationship("Proveedor", back_populates="acciones")
    adjuntos = relationship("AdjuntoAccion", back_populates="accion", cascade="all, delete-orphan")


class AdjuntoAccion(BaseModel):
    __tablename__ = "adjuntos_acciones"

    accion_id = Column(String(36), ForeignKey("acciones_proveedores.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    tipo_archivo = Column(String(50), nullable=True)

    # Relación
    accion = relationship("AccionProveedor", back_populates="adjuntos")
