from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.maquinaria import TipoMaquinaria, TipoPropiedad, EstadoMaquinaria, TipoCombustible


class MaquinariaCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    tipo: TipoMaquinaria
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None

    tipo_propiedad: TipoPropiedad

    numero_serie: Optional[str] = None
    numero_economico: Optional[str] = None
    placas: Optional[str] = None

    ubicacion_actual: Optional[str] = None
    proyecto_asignado_id: Optional[str] = None

    costo_adquisicion: Optional[float] = None
    costo_renta_dia: Optional[float] = None
    costo_operacion_hora: Optional[float] = None

    poliza_seguro: Optional[str] = None
    vigencia_seguro: Optional[date] = None

    horometro_actual: int = 0
    odometro_actual: Optional[int] = None
    capacidad: Optional[str] = None
    combustible: Optional[TipoCombustible] = None


class MaquinariaUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[TipoMaquinaria] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    tipo_propiedad: Optional[TipoPropiedad] = None
    numero_serie: Optional[str] = None
    numero_economico: Optional[str] = None
    placas: Optional[str] = None
    estado: Optional[EstadoMaquinaria] = None
    ubicacion_actual: Optional[str] = None
    proyecto_asignado_id: Optional[str] = None
    costo_adquisicion: Optional[float] = None
    costo_renta_dia: Optional[float] = None
    costo_operacion_hora: Optional[float] = None
    poliza_seguro: Optional[str] = None
    vigencia_seguro: Optional[date] = None
    horometro_actual: Optional[int] = None
    odometro_actual: Optional[int] = None
    capacidad: Optional[str] = None
    combustible: Optional[TipoCombustible] = None
    fecha_ultimo_mantenimiento: Optional[date] = None
    proxima_mantenimiento: Optional[date] = None


class MaquinariaResponse(BaseModel):
    id: str
    codigo: str
    nombre: str
    tipo: TipoMaquinaria
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    tipo_propiedad: TipoPropiedad
    numero_serie: Optional[str] = None
    numero_economico: Optional[str] = None
    placas: Optional[str] = None
    estado: EstadoMaquinaria
    ubicacion_actual: Optional[str] = None
    proyecto_asignado_id: Optional[str] = None
    costo_adquisicion: Optional[float] = None
    costo_renta_dia: Optional[float] = None
    costo_operacion_hora: Optional[float] = None
    poliza_seguro: Optional[str] = None
    vigencia_seguro: Optional[date] = None
    horometro_actual: int
    odometro_actual: Optional[int] = None
    capacidad: Optional[str] = None
    combustible: Optional[TipoCombustible] = None
    fecha_ultimo_mantenimiento: Optional[date] = None
    proxima_mantenimiento: Optional[date] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MaquinariaListResponse(BaseModel):
    items: list[MaquinariaResponse]
    total: int
    skip: int
    limit: int


# --- Mantenimientos ---
class MantenimientoCreate(BaseModel):
    tipo: str  # preventivo, correctivo
    descripcion: str = Field(..., min_length=1)
    fecha: date
    costo: float = Field(0, ge=0)
    proveedor: Optional[str] = None
    realizado_por: Optional[str] = None
    notas: Optional[str] = None


class MantenimientoResponse(BaseModel):
    id: str
    maquinaria_id: str
    tipo: str
    descripcion: str
    fecha: date
    costo: float
    proveedor: Optional[str] = None
    realizado_por: Optional[str] = None
    notas: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
