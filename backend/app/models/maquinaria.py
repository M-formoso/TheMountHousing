import enum
from sqlalchemy import Column, String, Integer, Numeric, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class TipoMaquinaria(str, enum.Enum):
    EXCAVADORA = "excavadora"
    RETROEXCAVADORA = "retroexcavadora"
    CAMION = "camion"
    REVOLVEDORA = "revolvedora"
    GRU = "gru"
    TRACTOR = "tractor"
    COMPACTADOR = "compactador"
    HERRAMIENTA = "herramienta"
    OTRO = "otro"


class TipoPropiedad(str, enum.Enum):
    PROPIA = "propia"
    RENTADA = "rentada"
    SUBCONTRATISTA = "subcontratista"


class EstadoMaquinaria(str, enum.Enum):
    OPERATIVA = "operativa"
    MANTENIMIENTO = "mantenimiento"
    DESCOMPUESTA = "descompuesta"
    BAJA = "baja"


class TipoCombustible(str, enum.Enum):
    DIESEL = "diesel"
    GASOLINA = "gasolina"
    ELECTRICO = "electrico"
    GAS = "gas"


class Maquinaria(BaseModel):
    __tablename__ = "maquinaria"

    codigo = Column(String(30), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False, index=True)
    tipo = Column(SAEnum(TipoMaquinaria), nullable=False)
    marca = Column(String(100), nullable=True)
    modelo = Column(String(100), nullable=True)
    anio = Column(Integer, nullable=True)

    tipo_propiedad = Column(SAEnum(TipoPropiedad), nullable=False)

    numero_serie = Column(String(100), nullable=True)
    numero_economico = Column(String(50), nullable=True)
    placas = Column(String(20), nullable=True)

    estado = Column(SAEnum(EstadoMaquinaria), default=EstadoMaquinaria.OPERATIVA)
    ubicacion_actual = Column(String(255), nullable=True)
    proyecto_asignado_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)

    # Costos
    costo_adquisicion = Column(Numeric(15, 2), nullable=True)
    costo_renta_dia = Column(Numeric(10, 2), nullable=True)
    costo_operacion_hora = Column(Numeric(10, 2), nullable=True)

    # Seguros
    poliza_seguro = Column(String(100), nullable=True)
    vigencia_seguro = Column(Date, nullable=True)

    # Operación
    horometro_actual = Column(Integer, default=0)
    odometro_actual = Column(Integer, nullable=True)
    capacidad = Column(String(50), nullable=True)
    combustible = Column(SAEnum(TipoCombustible), nullable=True)

    # Mantenimiento
    fecha_ultimo_mantenimiento = Column(Date, nullable=True)
    proxima_mantenimiento = Column(Date, nullable=True)

    # Relaciones
    mantenimientos = relationship("MantenimientoMaquinaria", back_populates="maquinaria")


class MantenimientoMaquinaria(BaseModel):
    __tablename__ = "mantenimientos_maquinaria"

    maquinaria_id = Column(String(36), ForeignKey("maquinaria.id"), nullable=False)
    tipo = Column(String(30), nullable=False)  # preventivo, correctivo
    descripcion = Column(String, nullable=False)
    fecha = Column(Date, nullable=False)
    costo = Column(Numeric(15, 2), default=0)
    proveedor = Column(String(100), nullable=True)
    realizado_por = Column(String(100), nullable=True)
    notas = Column(String, nullable=True)

    # Relación
    maquinaria = relationship("Maquinaria", back_populates="mantenimientos")
