from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.finanzas import TipoIngreso, CategoriaEgreso, MetodoPago, EstadoPago


# --- Ingresos ---
class IngresoCreate(BaseModel):
    tipo: TipoIngreso
    concepto: str = Field(..., min_length=1, max_length=255)
    monto: float = Field(..., gt=0)
    fecha: date
    proyecto_id: Optional[str] = None
    cliente_id: Optional[str] = None
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    factura: Optional[str] = None
    notas: Optional[str] = None


class IngresoResponse(BaseModel):
    id: str
    tipo: TipoIngreso
    concepto: str
    monto: float
    fecha: date
    proyecto_id: Optional[str] = None
    cliente_id: Optional[str] = None
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    factura: Optional[str] = None
    notas: Optional[str] = None
    registrado_por_id: str
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class IngresoListResponse(BaseModel):
    items: list[IngresoResponse]
    total: int
    skip: int
    limit: int


# --- Egresos ---
class EgresoCreate(BaseModel):
    categoria: CategoriaEgreso
    subcategoria: Optional[str] = None
    concepto: str = Field(..., min_length=1, max_length=255)
    monto: float = Field(..., gt=0)
    fecha: date
    proyecto_id: Optional[str] = None
    proveedor_id: Optional[str] = None
    subcontratista_id: Optional[str] = None
    empleado_id: Optional[str] = None
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    factura: Optional[str] = None
    notas: Optional[str] = None


class EgresoUpdate(BaseModel):
    estado_pago: Optional[EstadoPago] = None
    autorizado_por_id: Optional[str] = None
    notas: Optional[str] = None


class EgresoResponse(BaseModel):
    id: str
    categoria: CategoriaEgreso
    subcategoria: Optional[str] = None
    concepto: str
    monto: float
    fecha: date
    proyecto_id: Optional[str] = None
    proveedor_id: Optional[str] = None
    subcontratista_id: Optional[str] = None
    empleado_id: Optional[str] = None
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    factura: Optional[str] = None
    autorizado_por_id: Optional[str] = None
    estado_pago: EstadoPago
    notas: Optional[str] = None
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class EgresoListResponse(BaseModel):
    items: list[EgresoResponse]
    total: int
    skip: int
    limit: int


# --- Cuentas por Cobrar ---
class CuentaCobrarCreate(BaseModel):
    cliente_id: str
    proyecto_id: Optional[str] = None
    concepto: str = Field(..., min_length=1, max_length=255)
    monto_total: float = Field(..., gt=0)
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None


class PagoCobrarCreate(BaseModel):
    monto: float = Field(..., gt=0)
    fecha: date
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    notas: Optional[str] = None


class PagoCobrarResponse(BaseModel):
    id: str
    monto: float
    fecha: date
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    notas: Optional[str] = None

    model_config = {"from_attributes": True}


class CuentaCobrarResponse(BaseModel):
    id: str
    cliente_id: str
    proyecto_id: Optional[str] = None
    concepto: str
    monto_total: float
    monto_pagado: float
    saldo: float
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None
    estado: str
    pagos: list[PagoCobrarResponse] = []
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CuentaCobrarListResponse(BaseModel):
    items: list[CuentaCobrarResponse]
    total: int
    skip: int
    limit: int


# --- Cuentas por Pagar ---
class CuentaPagearCreate(BaseModel):
    proveedor_id: Optional[str] = None
    subcontratista_id: Optional[str] = None
    proyecto_id: Optional[str] = None
    concepto: str = Field(..., min_length=1, max_length=255)
    monto_total: float = Field(..., gt=0)
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None
    prioridad: str = "media"


class PagoPagearCreate(BaseModel):
    monto: float = Field(..., gt=0)
    fecha: date
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    notas: Optional[str] = None


class PagoPagearResponse(BaseModel):
    id: str
    monto: float
    fecha: date
    metodo_pago: Optional[MetodoPago] = None
    referencia: Optional[str] = None
    notas: Optional[str] = None

    model_config = {"from_attributes": True}


class CuentaPagearResponse(BaseModel):
    id: str
    proveedor_id: Optional[str] = None
    subcontratista_id: Optional[str] = None
    proyecto_id: Optional[str] = None
    concepto: str
    monto_total: float
    monto_pagado: float
    saldo: float
    fecha_emision: date
    fecha_vencimiento: Optional[date] = None
    estado: str
    prioridad: str
    pagos: list[PagoPagearResponse] = []
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CuentaPagearListResponse(BaseModel):
    items: list[CuentaPagearResponse]
    total: int
    skip: int
    limit: int
