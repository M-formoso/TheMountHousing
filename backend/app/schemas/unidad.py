from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


# ============ ETAPA SCHEMAS ============
class EtapaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    orden: int = 0
    completada: bool = False
    porcentaje: int = 0
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    notas: Optional[str] = None


class EtapaCreate(EtapaBase):
    unidad_id: str


class EtapaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    orden: Optional[int] = None
    completada: Optional[bool] = None
    porcentaje: Optional[int] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    notas: Optional[str] = None


class EtapaResponse(EtapaBase):
    id: str
    unidad_id: str
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ============ IMAGEN SCHEMAS ============
class ImagenBase(BaseModel):
    url: str
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: str = "avance"  # avance, render, plano
    orden: int = 0


class ImagenCreate(ImagenBase):
    unidad_id: str


class ImagenResponse(ImagenBase):
    id: str
    unidad_id: str
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ============ UNIDAD SCHEMAS ============
class UnidadBase(BaseModel):
    numero_unidad: str = Field(..., max_length=20)
    nombre: Optional[str] = None
    tipo_casa: Optional[str] = None
    metros_cuadrados: Decimal = Field(..., gt=0)
    precio_por_m2: Optional[Decimal] = None
    precio_total: Optional[Decimal] = None
    estado: str = "disponible"
    avance_porcentaje: int = 0
    etapa_actual: Optional[str] = "planos"
    descripcion: Optional[str] = None
    caracteristicas: Optional[str] = None
    habitaciones: Optional[int] = None
    banos: Optional[Decimal] = None
    estacionamientos: Optional[int] = None
    render_url: Optional[str] = None
    plano_url: Optional[str] = None
    notas: Optional[str] = None


class UnidadCreate(UnidadBase):
    pass


class UnidadUpdate(BaseModel):
    numero_unidad: Optional[str] = None
    nombre: Optional[str] = None
    tipo_casa: Optional[str] = None
    metros_cuadrados: Optional[Decimal] = None
    precio_por_m2: Optional[Decimal] = None
    precio_total: Optional[Decimal] = None
    estado: Optional[str] = None
    cliente_id: Optional[str] = None
    usuario_id: Optional[str] = None
    avance_porcentaje: Optional[int] = None
    etapa_actual: Optional[str] = None
    descripcion: Optional[str] = None
    caracteristicas: Optional[str] = None
    habitaciones: Optional[int] = None
    banos: Optional[Decimal] = None
    estacionamientos: Optional[int] = None
    render_url: Optional[str] = None
    plano_url: Optional[str] = None
    notas: Optional[str] = None


class ClienteSimple(BaseModel):
    id: str
    nombre: str
    apellido_paterno: str
    email: Optional[str] = None

    model_config = {"from_attributes": True}


class UnidadResponse(UnidadBase):
    id: str
    cliente_id: Optional[str] = None
    usuario_id: Optional[str] = None
    fecha_venta: Optional[datetime] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UnidadDetalleResponse(UnidadResponse):
    """Respuesta con detalles completos incluyendo imágenes y etapas"""
    cliente: Optional[ClienteSimple] = None
    imagenes: List[ImagenResponse] = []
    etapas: List[EtapaResponse] = []


class AsignarClienteRequest(BaseModel):
    cliente_id: str
    crear_usuario: bool = True  # Si crear usuario automáticamente
    email_usuario: Optional[str] = None
    password_usuario: Optional[str] = None


class VenderUnidadRequest(BaseModel):
    cliente_id: str
    crear_usuario: bool = True
    email_usuario: Optional[str] = None
    password_usuario: Optional[str] = None
