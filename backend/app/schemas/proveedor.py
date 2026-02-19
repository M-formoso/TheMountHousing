from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from app.models.proveedor import CategoriaProveedor, TipoAccion, EstadoAccion, EstadoProveedor, EspecialidadContratista


# ==================== PROVEEDOR ====================

class ProveedorCreate(BaseModel):
    razon_social: str = Field(..., min_length=1, max_length=255)
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None

    categoria: CategoriaProveedor = CategoriaProveedor.MATERIALES
    estado: EstadoProveedor = EstadoProveedor.ACTIVO
    especialidad: Optional[EspecialidadContratista] = None

    contacto_principal: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1)
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None

    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    sitio_web: Optional[str] = None

    banco: Optional[str] = None
    cuenta_bancaria: Optional[str] = None
    clabe: Optional[str] = None

    # Licencia y seguros
    numero_licencia: Optional[str] = None
    tiene_seguro: bool = False
    aseguradora: Optional[str] = None
    numero_poliza: Optional[str] = None
    vigencia_seguro: Optional[date] = None

    condiciones_pago: Optional[str] = None
    dias_credito: int = 30
    descuento_pronto_pago: float = 0
    tiempo_entrega_dias: Optional[int] = None

    calificacion: int = Field(default=0, ge=0, le=5)

    preferido: bool = False
    notas: Optional[str] = None


class ProveedorUpdate(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None
    categoria: Optional[CategoriaProveedor] = None
    estado: Optional[EstadoProveedor] = None
    especialidad: Optional[EspecialidadContratista] = None
    contacto_principal: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    sitio_web: Optional[str] = None
    banco: Optional[str] = None
    cuenta_bancaria: Optional[str] = None
    clabe: Optional[str] = None
    numero_licencia: Optional[str] = None
    tiene_seguro: Optional[bool] = None
    aseguradora: Optional[str] = None
    numero_poliza: Optional[str] = None
    vigencia_seguro: Optional[date] = None
    condiciones_pago: Optional[str] = None
    dias_credito: Optional[int] = None
    descuento_pronto_pago: Optional[float] = None
    tiempo_entrega_dias: Optional[int] = None
    calificacion: Optional[int] = Field(None, ge=0, le=5)
    total_pagado: Optional[float] = None
    total_pendiente: Optional[float] = None
    trabajos_completados: Optional[int] = None
    ultima_actividad: Optional[date] = None
    preferido: Optional[bool] = None
    notas: Optional[str] = None


class ProveedorResponse(BaseModel):
    id: str
    razon_social: str
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None
    categoria: CategoriaProveedor
    estado: EstadoProveedor
    especialidad: Optional[EspecialidadContratista] = None
    contacto_principal: str
    email: str
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    sitio_web: Optional[str] = None
    banco: Optional[str] = None
    cuenta_bancaria: Optional[str] = None
    clabe: Optional[str] = None
    numero_licencia: Optional[str] = None
    tiene_seguro: bool
    aseguradora: Optional[str] = None
    numero_poliza: Optional[str] = None
    vigencia_seguro: Optional[date] = None
    condiciones_pago: Optional[str] = None
    dias_credito: int
    descuento_pronto_pago: float
    tiempo_entrega_dias: Optional[int] = None
    calificacion: int
    total_pagado: float
    total_pendiente: float
    trabajos_completados: int
    ultima_actividad: Optional[date] = None
    preferido: bool
    notas: Optional[str] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProveedorListResponse(BaseModel):
    items: list[ProveedorResponse]
    total: int
    skip: int
    limit: int


# ==================== ADJUNTO ====================

class AdjuntoCreate(BaseModel):
    nombre: str
    url: str
    tipo_archivo: Optional[str] = None


class AdjuntoResponse(BaseModel):
    id: str
    nombre: str
    url: str
    tipo_archivo: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ==================== ACCION PROVEEDOR ====================

class AccionProveedorCreate(BaseModel):
    tipo: TipoAccion
    descripcion: str = Field(..., min_length=1, max_length=500)
    monto: Optional[float] = None
    fecha: date
    estado: EstadoAccion = EstadoAccion.PENDIENTE
    referencia: Optional[str] = None
    notas: Optional[str] = None


class AccionProveedorUpdate(BaseModel):
    tipo: Optional[TipoAccion] = None
    descripcion: Optional[str] = None
    monto: Optional[float] = None
    fecha: Optional[date] = None
    estado: Optional[EstadoAccion] = None
    referencia: Optional[str] = None
    notas: Optional[str] = None


class AccionProveedorResponse(BaseModel):
    id: str
    proveedor_id: str
    tipo: TipoAccion
    descripcion: str
    monto: Optional[float] = None
    fecha: date
    estado: EstadoAccion
    referencia: Optional[str] = None
    notas: Optional[str] = None
    adjuntos: list[AdjuntoResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AccionProveedorListResponse(BaseModel):
    items: list[AccionProveedorResponse]
    total: int
    skip: int
    limit: int
