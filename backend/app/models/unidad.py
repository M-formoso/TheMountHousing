import enum
from sqlalchemy import Column, String, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class EstadoUnidad(str, enum.Enum):
    DISPONIBLE = "disponible"
    RESERVADA = "reservada"
    VENDIDA = "vendida"
    EN_CONSTRUCCION = "en_construccion"


class TipoCasa(str, enum.Enum):
    PIETRA = "pietra"
    ETHER = "ether"
    ESTANDAR = "estandar"
    OTRO = "otro"


class Unidad(BaseModel):
    """Modelo para unidades habitacionales (PH, casas, departamentos)"""
    __tablename__ = "unidades"

    # Identificación
    numero_unidad = Column(String(20), nullable=False, index=True)  # PH 1, PH 2, etc.
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=False, index=True)

    # Información de la unidad
    tipo_casa = Column(String(50), nullable=True)  # Pietra, Ether, etc.
    metros_cuadrados = Column(Numeric(10, 2), nullable=False)
    precio_por_m2 = Column(Numeric(10, 2), nullable=True)  # USD por m²
    precio_total = Column(Numeric(15, 2), nullable=True)  # USD total

    # Estado y venta
    estado = Column(String(20), nullable=False, default="disponible")
    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=True, index=True)

    # Descripción y características
    descripcion = Column(String, nullable=True)
    caracteristicas = Column(String, nullable=True)  # JSON string con features
    nivel = Column(String(20), nullable=True)  # Planta baja, Piso 1, etc.
    habitaciones = Column(Numeric(5, 0), nullable=True)
    banos = Column(Numeric(5, 1), nullable=True)
    estacionamientos = Column(Numeric(5, 0), nullable=True)

    # Extras
    notas = Column(String, nullable=True)
    imagen_url = Column(String(500), nullable=True)
    plano_url = Column(String(500), nullable=True)

    # Relaciones
    proyecto = relationship("Proyecto", back_populates="unidades")
    cliente = relationship("Cliente", back_populates="unidades")
