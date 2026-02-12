from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.empleado import Departamento, TipoContrato


class EmpleadoCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido_paterno: str = Field(..., min_length=1, max_length=100)
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    rfc: Optional[str] = None
    curp: Optional[str] = None
    nss: Optional[str] = None

    email: str = Field(..., min_length=1)
    telefono: Optional[str] = None

    telefono_emergencia: Optional[str] = None
    contacto_emergencia_nombre: Optional[str] = None
    contacto_emergencia_relacion: Optional[str] = None

    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None

    puesto: str = Field(..., min_length=1, max_length=100)
    departamento: Departamento
    fecha_ingreso: Optional[date] = None
    tipo_contrato: Optional[TipoContrato] = None
    salario_diario: Optional[float] = None

    tipo_sangre: Optional[str] = None
    alergias: Optional[str] = None
    enfermedades: Optional[str] = None


class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    rfc: Optional[str] = None
    curp: Optional[str] = None
    nss: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    contacto_emergencia_nombre: Optional[str] = None
    contacto_emergencia_relacion: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    puesto: Optional[str] = None
    departamento: Optional[Departamento] = None
    fecha_ingreso: Optional[date] = None
    fecha_baja: Optional[date] = None
    tipo_contrato: Optional[TipoContrato] = None
    salario_diario: Optional[float] = None
    tipo_sangre: Optional[str] = None
    alergias: Optional[str] = None
    enfermedades: Optional[str] = None


class EmpleadoResponse(BaseModel):
    id: str
    numero_empleado: str
    nombre: str
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    rfc: Optional[str] = None
    curp: Optional[str] = None
    nss: Optional[str] = None
    email: str
    telefono: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    contacto_emergencia_nombre: Optional[str] = None
    contacto_emergencia_relacion: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado_geo: Optional[str] = None
    codigo_postal: Optional[str] = None
    puesto: str
    departamento: Departamento
    fecha_ingreso: Optional[date] = None
    fecha_baja: Optional[date] = None
    tipo_contrato: Optional[TipoContrato] = None
    salario_diario: Optional[float] = None
    tipo_sangre: Optional[str] = None
    alergias: Optional[str] = None
    enfermedades: Optional[str] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmpleadoListResponse(BaseModel):
    items: list[EmpleadoResponse]
    total: int
    skip: int
    limit: int
