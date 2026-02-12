import enum
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Enum as SAEnum
from app.models.base import BaseModel


class TipoProveedor(str, enum.Enum):
    MATERIALES = "materiales"
    SERVICIOS = "servicios"
    AMBOS = "ambos"


class Proveedor(BaseModel):
    __tablename__ = "proveedores"

    razon_social = Column(String(255), nullable=False, index=True)
    nombre_comercial = Column(String(255), nullable=True)
    rfc = Column(String(13), nullable=True, index=True)

    tipo = Column(SAEnum(TipoProveedor), nullable=False)

    contacto_principal = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)
    telefono_alternativo = Column(String(20), nullable=True)

    direccion = Column(String(500), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado_geo = Column(String(100), nullable=True)
    codigo_postal = Column(String(10), nullable=True)
    sitio_web = Column(String(255), nullable=True)

    # Datos bancarios (encriptar en producción)
    banco = Column(String(100), nullable=True)
    cuenta_bancaria = Column(String(50), nullable=True)
    clabe = Column(String(18), nullable=True)

    # Condiciones comerciales
    condiciones_pago = Column(String, nullable=True)
    dias_credito = Column(Integer, default=30)
    descuento_pronto_pago = Column(Numeric(5, 2), default=0)
    tiempo_entrega_dias = Column(Integer, nullable=True)

    # Calificaciones
    calificacion_calidad = Column(Integer, default=0)   # 1-5
    calificacion_precio = Column(Integer, default=0)    # 1-5
    calificacion_servicio = Column(Integer, default=0)  # 1-5
    calificacion_general = Column(Numeric(3, 1), default=0)  # Promedio

    volumen_compra_anual = Column(Numeric(15, 2), default=0)

    preferido = Column(Boolean, default=False)
    notas = Column(String, nullable=True)
