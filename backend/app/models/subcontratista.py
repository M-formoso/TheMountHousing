import enum
from sqlalchemy import Column, String, Numeric
from app.models.base import BaseModel


class EspecialidadSubcontratista(str, enum.Enum):
    PLOMERIA = "plomeria"
    ELECTRICIDAD = "electricidad"
    ACABADOS = "acabados"
    CARPINTERIA = "carpinteria"
    ALBANILEO = "albanileo"
    PINTURA = "pintura"
    JARDINERIA = "jardineria"
    VIDRIERIA = "vidrieria"
    SOLDADURA = "soldadura"
    OTRO = "otro"


class RangoPrecio(str, enum.Enum):
    ECONOMICO = "economico"
    MEDIO = "medio"
    PREMIUM = "premium"


class Subcontratista(BaseModel):
    __tablename__ = "subcontratistas"

    codigo = Column(String(20), nullable=False, unique=True, index=True)
    nombre_empresa = Column(String(255), nullable=False, index=True)
    nombre_contacto = Column(String(255), nullable=True)
    especialidad = Column(String(30), nullable=False)
    rfc = Column(String(13), nullable=True)
    email = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=False)
    telefono_alternativo = Column(String(20), nullable=True)
    direccion = Column(String(500), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado = Column(String(100), nullable=True)
    rango_precio = Column(String(10), nullable=True)
    calificacion = Column(Numeric, nullable=True)
    notas = Column(String, nullable=True)
