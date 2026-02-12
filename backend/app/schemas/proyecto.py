from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.proyecto import TipoProyecto, EstadoProyecto


class ProyectoCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    tipo: TipoProyecto
    cliente_id: str
    gerente_proyecto_id: Optional[str] = None

    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None

    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None

    presupuesto_total: float = 0
    margen_ganancia_esperado: float = 0
    area_construccion_m2: Optional[float] = None

    notas: Optional[str] = None


class ProyectoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: Optional[TipoProyecto] = None
    estado: Optional[EstadoProyecto] = None
    cliente_id: Optional[str] = None
    gerente_proyecto_id: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_fin_real: Optional[date] = None
    presupuesto_total: Optional[float] = None
    costo_real: Optional[float] = None
    margen_ganancia_esperado: Optional[float] = None
    area_construccion_m2: Optional[float] = None
    progreso_general: Optional[int] = Field(None, ge=0, le=100)
    notas: Optional[str] = None


class FaseProyectoCreate(BaseModel):
    numero_fase: int
    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None


class FaseProyectoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_fin_real: Optional[date] = None
    progreso: Optional[int] = Field(None, ge=0, le=100)
    estado: Optional[str] = None


class FaseProyectoResponse(BaseModel):
    id: str
    numero_fase: int
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_fin_real: Optional[date] = None
    progreso: int
    estado: str
    activo: bool

    model_config = {"from_attributes": True}


class EntradaBitacoraCreate(BaseModel):
    contenido: str = Field(..., min_length=1)
    clima: Optional[str] = None
    temperatura: Optional[float] = None
    trabajadores_presentes: Optional[int] = None
    notas: Optional[str] = None


class EntradaBitacoraResponse(BaseModel):
    id: str
    contenido: str
    clima: Optional[str] = None
    temperatura: Optional[float] = None
    trabajadores_presentes: Optional[int] = None
    notas: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProyectoResponse(BaseModel):
    id: str
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    tipo: TipoProyecto
    estado: EstadoProyecto
    cliente_id: str
    gerente_proyecto_id: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    fecha_inicio: Optional[date] = None
    fecha_fin_estimada: Optional[date] = None
    fecha_fin_real: Optional[date] = None
    presupuesto_total: float
    costo_real: float
    margen_ganancia_esperado: float
    area_construccion_m2: Optional[float] = None
    progreso_general: int
    notas: Optional[str] = None
    activo: bool
    created_at: datetime
    updated_at: datetime
    fases: list[FaseProyectoResponse] = []

    model_config = {"from_attributes": True}


class ProyectoListResponse(BaseModel):
    items: list[ProyectoResponse]
    total: int
    skip: int
    limit: int
