from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class ClienteCreate(BaseModel):
    numero_cliente: str = Field(..., max_length=20)
    tipo: str = Field(..., max_length=10)
    nombre: str = Field(..., min_length=1, max_length=255)
    apellido_paterno: Optional[str] = Field(None, max_length=100)
    apellido_materno: Optional[str] = Field(None, max_length=100)
    razon_social: Optional[str] = Field(None, max_length=255)
    rfc: Optional[str] = Field(None, max_length=13)
    email: EmailStr
    telefono: Optional[str] = Field(None, max_length=20)
    telefono_alternativo: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    notas: Optional[str] = None


class ClienteUpdate(BaseModel):
    tipo: Optional[str] = None
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    razon_social: Optional[str] = None
    rfc: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    notas: Optional[str] = None


class ContactoClienteCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    puesto: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    es_principal: bool = False


class ContactoClienteResponse(BaseModel):
    id: str
    nombre: str
    puesto: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    es_principal: int
    activo: bool

    model_config = {"from_attributes": True}


class ClienteResponse(BaseModel):
    id: str
    numero_cliente: str
    tipo: str
    nombre: str
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    razon_social: Optional[str] = None
    rfc: Optional[str] = None
    email: str
    telefono: Optional[str] = None
    telefono_alternativo: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    notas: Optional[str] = None
    activo: bool
    created_at: datetime
    updated_at: datetime
    contactos: list[ContactoClienteResponse] = []

    model_config = {"from_attributes": True}


class ClienteListResponse(BaseModel):
    items: list[ClienteResponse]
    total: int
    skip: int
    limit: int
