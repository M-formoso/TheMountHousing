import enum
from sqlalchemy import Column, String, Numeric, ForeignKey, Boolean, Integer, Text, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class EstadoUnidad(str, enum.Enum):
    DISPONIBLE = "disponible"
    RESERVADA = "reservada"
    VENDIDA = "vendida"
    EN_CONSTRUCCION = "en_construccion"


class EtapaObra(str, enum.Enum):
    PLANOS = "planos"
    CIMIENTOS = "cimientos"
    ESTRUCTURA = "estructura"
    CERRAMIENTOS = "cerramientos"
    INSTALACIONES = "instalaciones"
    TERMINACIONES = "terminaciones"
    ENTREGA = "entrega"


class Unidad(BaseModel):
    """Modelo para unidades habitacionales (PH)"""
    __tablename__ = "unidades"

    # Identificación
    numero_unidad = Column(String(20), nullable=False, index=True)  # PH 1, PH 2, etc.
    nombre = Column(String(100), nullable=True)  # Nombre descriptivo (ej: "Casa Pietra")

    # Información de la unidad
    tipo_casa = Column(String(50), nullable=True)  # Pietra, Ether, Estándar
    metros_cuadrados = Column(Numeric(10, 2), nullable=False)
    precio_por_m2 = Column(Numeric(10, 2), nullable=True)  # USD por m²
    precio_total = Column(Numeric(15, 2), nullable=True)  # USD total

    # Estado y venta
    estado = Column(String(20), nullable=False, default="disponible")
    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=True, index=True)
    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=True)  # Usuario del cliente
    fecha_venta = Column(DateTime, nullable=True)

    # Progreso de obra
    avance_porcentaje = Column(Integer, nullable=False, default=0)  # 0-100
    etapa_actual = Column(String(30), nullable=True, default="planos")

    # Descripción y características
    descripcion = Column(Text, nullable=True)
    caracteristicas = Column(Text, nullable=True)  # JSON string con features
    habitaciones = Column(Integer, nullable=True)
    banos = Column(Numeric(5, 1), nullable=True)
    estacionamientos = Column(Integer, nullable=True)

    # Imágenes
    render_url = Column(String(500), nullable=True)  # Render principal
    plano_url = Column(String(500), nullable=True)

    # Extras
    notas = Column(Text, nullable=True)

    # Relaciones
    cliente = relationship("Cliente", back_populates="unidades")
    imagenes = relationship("ImagenUnidad", back_populates="unidad", cascade="all, delete-orphan")
    etapas = relationship("EtapaUnidad", back_populates="unidad", cascade="all, delete-orphan", order_by="EtapaUnidad.orden")
    egresos = relationship("Egreso", back_populates="unidad")
    ordenes_compra = relationship("OrdenCompra", back_populates="unidad")
    movimientos_material = relationship("MovimientoInventario", back_populates="unidad")


class ImagenUnidad(BaseModel):
    """Imágenes de una unidad (galería de fotos de avance)"""
    __tablename__ = "imagenes_unidad"

    unidad_id = Column(String(36), ForeignKey("unidades.id"), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    titulo = Column(String(100), nullable=True)
    descripcion = Column(String(255), nullable=True)
    tipo = Column(String(30), nullable=True, default="avance")  # avance, render, plano
    orden = Column(Integer, default=0)

    # Relación
    unidad = relationship("Unidad", back_populates="imagenes")


class EtapaUnidad(BaseModel):
    """Etapas de construcción de una unidad"""
    __tablename__ = "etapas_unidad"

    unidad_id = Column(String(36), ForeignKey("unidades.id"), nullable=False, index=True)
    nombre = Column(String(50), nullable=False)  # Cimientos, Estructura, etc.
    descripcion = Column(Text, nullable=True)
    orden = Column(Integer, nullable=False, default=0)
    completada = Column(Boolean, default=False)
    porcentaje = Column(Integer, default=0)  # 0-100
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    notas = Column(Text, nullable=True)

    # Relación
    unidad = relationship("Unidad", back_populates="etapas")
