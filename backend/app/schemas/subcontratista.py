from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.subcontratista import EspecialidadSubcontratista, RangoPrecio


class SubcontratistaCreate(BaseModel):
    razon_social: str = Field(..., min_length=1, max_length=255)
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None

    contacto_principal: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1)
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None

    especialidad: EspecialidadSubcontratista

    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None

    banco: Optional[str] = None
    cuenta_bancaria: Optional[str] = None
    clabe: Optional[str] = None

    calificacion: int = Field(0, ge=0, le=5)
    precio_rango: Optional[RangoPrecio] = None

    seguro_responsabilidad_civil: bool = False
    seguro_vigencia: Optional[date] = None

    notas: Optional[str] = None


class SubcontratistaUpdate(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None
    contacto_principal: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None
    especialidad: Optional[EspecialidadSubcontratista] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    banco: Optional[str] = None
    cuenta_bancaria: Optional[str] = None
    clabe: Optional[str] = None
    calificacion: Optional[int] = Field(None, ge=0, le=5)
    precio_rango: Optional[RangoPrecio] = None
    seguro_responsabilidad_civil: Optional[bool] = None
    seguro_vigencia: Optional[date] = None
    en_lista_negra: Optional[bool] = None
    razon_lista_negra: Optional[str] = None
    notas: Optional[str] = None


class SubcontratistaResponse(BaseModel):
    id: str
    razon_social: str
    nombre_comercial: Optional[str] = None
    rfc: Optional[str] = None
    contacto_principal: str
    email: str
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None
    especialidad: EspecialidadSubcontratista
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    banco: Optional[str] = None
    cuenta_bancaria: Optional[str] = None
    clabe: Optional[str] = None
    calificacion: int
    precio_rango: Optional[RangoPrecio] = None
    seguro_responsabilidad_civil: bool
    seguro_vigencia: Optional[date] = None
    en_lista_negra: bool
    razon_lista_negra: Optional[str] = None
    notas: Optional[str] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SubcontratistaListResponse(BaseModel):
    items: list[SubcontratistaResponse]
    total: int
    skip: int
    limit: int
