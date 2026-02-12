import enum
from sqlalchemy import Column, String, Integer, Numeric, Float, Date, DateTime, ForeignKey, Boolean, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class EstadoCotizacion(str, enum.Enum):
    PENDIENTE = "pendiente"
    ENVIADA = "enviada"
    EN_REVISION = "en_revision"
    ACEPTADA = "aceptada"
    RECHAZADA = "rechazada"
    VENCIDA = "vencida"


class Cotizacion(BaseModel):
    __tablename__ = "cotizaciones"

    numero = Column(String(30), unique=True, nullable=False, index=True)  # COT-2024-001
    version = Column(Integer, default=1)
    fecha_emision = Column(Date, nullable=False)
    fecha_vigencia = Column(Date, nullable=True)
    estado = Column(SAEnum(EstadoCotizacion), default=EstadoCotizacion.PENDIENTE)

    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False)
    proyecto_nombre = Column(String(255), nullable=True)
    proyecto_descripcion = Column(String, nullable=True)
    proyecto_ubicacion = Column(String(500), nullable=True)

    # Totales
    subtotal = Column(Numeric(15, 2), default=0)
    iva = Column(Numeric(15, 2), default=0)
    total = Column(Numeric(15, 2), default=0)
    margen_utilidad = Column(Numeric(5, 2), default=0)  # %

    condiciones_pago = Column(String, nullable=True)
    tiempo_ejecucion_dias = Column(Integer, nullable=True)
    garantia = Column(String, nullable=True)
    notas = Column(String, nullable=True)

    elaborada_por_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    aprobada_por_id = Column(String(36), ForeignKey("usuarios.id"), nullable=True)
    fecha_aprobacion = Column(DateTime, nullable=True)

    # Firma digital del cliente
    firma_cliente_url = Column(String(500), nullable=True)
    fecha_firma = Column(DateTime, nullable=True)

    # Si fue convertida a proyecto
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True, unique=True)

    # Relaciones
    cliente = relationship("Cliente")
    partidas = relationship("PartidaCotizacion", back_populates="cotizacion", order_by="PartidaCotizacion.numero_partida")
    proyecto = relationship("Proyecto", back_populates="cotizacion")


class PartidaCotizacion(BaseModel):
    __tablename__ = "partidas_cotizacion"

    cotizacion_id = Column(String(36), ForeignKey("cotizaciones.id"), nullable=False)
    numero_partida = Column(Integer, nullable=False)
    concepto = Column(String(255), nullable=False)
    descripcion = Column(String, nullable=True)
    unidad = Column(String(30), nullable=False)
    cantidad = Column(Float, nullable=False)
    precio_unitario = Column(Numeric(15, 2), nullable=False)
    importe = Column(Numeric(15, 2), nullable=False)

    incluye_material = Column(Boolean, default=False)
    incluye_mano_obra = Column(Boolean, default=False)
    incluye_maquinaria = Column(Boolean, default=False)

    # Desglose mano obra
    mano_obra_horas = Column(Float, nullable=True)
    costo_mano_obra = Column(Numeric(15, 2), nullable=True)

    # Relación
    cotizacion = relationship("Cotizacion", back_populates="partidas")
