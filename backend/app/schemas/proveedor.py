from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.proveedor import TipoProveedor


class ProveedorCreate(BaseModel):
    razon_social: str = Field(..., min_length=1, max_length=255)
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None

    tipo: TipoProveedor

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

    condiciones_pago: Optional[str] = None
    dias_credito: int = 30
    descuento_pronto_pago: float = 0
    tiempo_entrega_dias: Optional[int] = None

    preferido: bool = False
    notas: Optional[str] = None


class ProveedorUpdate(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None
    tipo: Optional[TipoProveedor] = None
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
    condiciones_pago: Optional[str] = None
    dias_credito: Optional[int] = None
    descuento_pronto_pago: Optional[float] = None
    tiempo_entrega_dias: Optional[int] = None
    calificacion_calidad: Optional[int] = Field(None, ge=0, le=5)
    calificacion_precio: Optional[int] = Field(None, ge=0, le=5)
    calificacion_servicio: Optional[int] = Field(None, ge=0, le=5)
    preferido: Optional[bool] = None
    notas: Optional[str] = None


class ProveedorResponse(BaseModel):
    id: str
    razon_social: str
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None
    tipo: TipoProveedor
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
    condiciones_pago: Optional[str] = None
    dias_credito: int
    descuento_pronto_pago: float
    tiempo_entrega_dias: Optional[int] = None
    calificacion_calidad: int
    calificacion_precio: int
    calificacion_servicio: int
    calificacion_general: float
    volumen_compra_anual: float
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
