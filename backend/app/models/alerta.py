import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum, ForeignKey
from app.models.base import BaseModel


class TipoAlerta(str, enum.Enum):
    PROYECTO_RETRASO = "proyecto_retraso"
    PROYECTO_SOBRECOSTO = "proyecto_sobrecosto"
    STOCK_BAJO = "stock_bajo"
    MANTENIMIENTO_MAQUINARIA = "mantenimiento_maquinaria"
    VENCIMIENTO_SEGURO = "vencimiento_seguro"
    PAGO_PROVEEDOR_VENCE = "pago_proveedor_vence"
    CUENTA_COBRAR_VENCIDA = "cuenta_cobrar_vencida"
    COTIZACION_VENCE = "cotizacion_vence"
    INSPECCION_CALIDAD = "inspeccion_calidad"
    CERTIFICACION_EMPLEADO = "certificacion_empleado"
    CONTRATO_FINALIZA = "contrato_finaliza"


class Prioridad(str, enum.Enum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class Alerta(BaseModel):
    __tablename__ = "alertas"

    tipo = Column(SAEnum(TipoAlerta), nullable=False)
    prioridad = Column(SAEnum(Prioridad), default=Prioridad.MEDIA)
    titulo = Column(String(255), nullable=False)
    mensaje = Column(String, nullable=False)

    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=True)
    rol_destinatario = Column(String(30), nullable=True)  # Rol enum como string

    entidad_tipo = Column(String(50), nullable=True)  # proyecto, material, maquinaria, etc.
    entidad_id = Column(String(36), nullable=True)

    leida = Column(Boolean, default=False)
    fecha_lectura = Column(DateTime, nullable=True)

    accion_url = Column(String(500), nullable=True)
    accion_texto = Column(String(100), nullable=True)

    expira_en = Column(DateTime, nullable=True)
