from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


class UnidadBase(BaseModel):
    numero_unidad: str = Field(..., max_length=20)
    proyecto_id: str
    tipo_casa: Optional[str] = None
    metros_cuadrados: Decimal = Field(..., gt=0)
    precio_por_m2: Optional[Decimal] = None
    precio_total: Optional[Decimal] = None
    estado: str = "disponible"
    cliente_id: Optional[str] = None
    descripcion: Optional[str] = None
    caracteristicas: Optional[str] = None
    nivel: Optional[str] = None
    habitaciones: Optional[int] = None
    banos: Optional[Decimal] = None
    estacionamientos: Optional[int] = None
    notas: Optional[str] = None
    imagen_url: Optional[str] = None
    plano_url: Optional[str] = None


class UnidadCreate(UnidadBase):
    pass


class UnidadUpdate(BaseModel):
    numero_unidad: Optional[str] = None
    tipo_casa: Optional[str] = None
    metros_cuadrados: Optional[Decimal] = None
    precio_por_m2: Optional[Decimal] = None
    precio_total: Optional[Decimal] = None
    estado: Optional[str] = None
    cliente_id: Optional[str] = None
    descripcion: Optional[str] = None
    caracteristicas: Optional[str] = None
    nivel: Optional[str] = None
    habitaciones: Optional[int] = None
    banos: Optional[Decimal] = None
    estacionamientos: Optional[int] = None
    notas: Optional[str] = None
    imagen_url: Optional[str] = None
    plano_url: Optional[str] = None


class UnidadResponse(UnidadBase):
    id: str
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AsignarClienteRequest(BaseModel):
    cliente_id: str
