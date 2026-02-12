from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.cotizacion import EstadoCotizacion


class PartidaCreate(BaseModel):
    numero_partida: int
    concepto: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    unidad: str = Field(..., max_length=30)
    cantidad: float = Field(..., gt=0)
    precio_unitario: float = Field(..., ge=0)

    incluye_material: bool = False
    incluye_mano_obra: bool = False
    incluye_maquinaria: bool = False

    mano_obra_horas: Optional[float] = None
    costo_mano_obra: Optional[float] = None


class PartidaResponse(BaseModel):
    id: str
    numero_partida: int
    concepto: str
    descripcion: Optional[str] = None
    unidad: str
    cantidad: float
    precio_unitario: float
    importe: float
    incluye_material: bool
    incluye_mano_obra: bool
    incluye_maquinaria: bool
    mano_obra_horas: Optional[float] = None
    costo_mano_obra: Optional[float] = None

    model_config = {"from_attributes": True}


class CotizacionCreate(BaseModel):
    cliente_id: str
    fecha_emision: date
    fecha_vigencia: Optional[date] = None

    proyecto_nombre: Optional[str] = None
    proyecto_descripcion: Optional[str] = None
    proyecto_ubicacion: Optional[str] = None

    margen_utilidad: float = Field(0, ge=0)
    condiciones_pago: Optional[str] = None
    tiempo_ejecucion_dias: Optional[int] = None
    garantia: Optional[str] = None
    notas: Optional[str] = None

    partidas: list[PartidaCreate] = []


class CotizacionUpdate(BaseModel):
    estado: Optional[EstadoCotizacion] = None
    fecha_vigencia: Optional[date] = None
    proyecto_nombre: Optional[str] = None
    proyecto_descripcion: Optional[str] = None
    proyecto_ubicacion: Optional[str] = None
    margen_utilidad: Optional[float] = None
    condiciones_pago: Optional[str] = None
    tiempo_ejecucion_dias: Optional[int] = None
    garantia: Optional[str] = None
    notas: Optional[str] = None


class CotizacionResponse(BaseModel):
    id: str
    numero: str
    version: int
    fecha_emision: date
    fecha_vigencia: Optional[date] = None
    estado: EstadoCotizacion
    cliente_id: str
    proyecto_nombre: Optional[str] = None
    proyecto_descripcion: Optional[str] = None
    proyecto_ubicacion: Optional[str] = None
    subtotal: float
    iva: float
    total: float
    margen_utilidad: float
    condiciones_pago: Optional[str] = None
    tiempo_ejecucion_dias: Optional[int] = None
    garantia: Optional[str] = None
    notas: Optional[str] = None
    elaborada_por_id: str
    aprobada_por_id: Optional[str] = None
    fecha_aprobacion: Optional[datetime] = None
    firma_cliente_url: Optional[str] = None
    fecha_firma: Optional[datetime] = None
    proyecto_id: Optional[str] = None
    partidas: list[PartidaResponse] = []
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CotizacionListResponse(BaseModel):
    items: list[CotizacionResponse]
    total: int
    skip: int
    limit: int
