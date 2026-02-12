from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.material import CategoriaMaterial, UnidadMedida, TipoMovimiento


class MaterialCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    categoria: CategoriaMaterial
    subcategoria: Optional[str] = None
    unidad_medida: UnidadMedida
    precio_unitario_actual: float = Field(0, ge=0)
    stock_minimo: float = Field(0, ge=0)
    stock_maximo: float = Field(0, ge=0)
    ubicacion_almacen: Optional[str] = None
    proveedor_principal_id: Optional[str] = None


class MaterialUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[CategoriaMaterial] = None
    subcategoria: Optional[str] = None
    unidad_medida: Optional[UnidadMedida] = None
    precio_unitario_actual: Optional[float] = None
    stock_actual: Optional[float] = None
    stock_minimo: Optional[float] = None
    stock_maximo: Optional[float] = None
    ubicacion_almacen: Optional[str] = None
    proveedor_principal_id: Optional[str] = None


class MaterialResponse(BaseModel):
    id: str
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    categoria: CategoriaMaterial
    subcategoria: Optional[str] = None
    unidad_medida: UnidadMedida
    precio_unitario_actual: float
    stock_actual: float
    stock_minimo: float
    stock_maximo: float
    ubicacion_almacen: Optional[str] = None
    proveedor_principal_id: Optional[str] = None
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MaterialListResponse(BaseModel):
    items: list[MaterialResponse]
    total: int
    skip: int
    limit: int


# --- Movimientos ---
class MovimientoCreate(BaseModel):
    material_id: str
    tipo: TipoMovimiento
    cantidad: float = Field(..., gt=0)
    proyecto_id: Optional[str] = None
    fecha: date
    costo_unitario: float = Field(0, ge=0)
    notas: Optional[str] = None


class MovimientoResponse(BaseModel):
    id: str
    material_id: str
    tipo: TipoMovimiento
    cantidad: float
    proyecto_id: Optional[str] = None
    fecha: date
    costo_unitario: float
    costo_total: float
    notas: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Solicitudes de Compra ---
class ItemSolicitudCreate(BaseModel):
    material_id: str
    cantidad: float = Field(..., gt=0)
    precio_estimado: Optional[float] = None
    notas: Optional[str] = None


class ItemSolicitudResponse(BaseModel):
    id: str
    material_id: str
    cantidad: float
    precio_estimado: Optional[float] = None
    notas: Optional[str] = None

    model_config = {"from_attributes": True}


class SolicitudCompraCreate(BaseModel):
    proyecto_id: Optional[str] = None
    fecha_solicitud: date
    fecha_requerida: Optional[date] = None
    prioridad: str = "media"
    notas: Optional[str] = None
    items: list[ItemSolicitudCreate] = []


class SolicitudCompraUpdate(BaseModel):
    estado: Optional[str] = None
    fecha_requerida: Optional[date] = None
    prioridad: Optional[str] = None
    notas: Optional[str] = None


class SolicitudCompraResponse(BaseModel):
    id: str
    numero: str
    proyecto_id: Optional[str] = None
    fecha_solicitud: date
    fecha_requerida: Optional[date] = None
    estado: str
    prioridad: str
    total_estimado: float
    notas: Optional[str] = None
    items: list[ItemSolicitudResponse] = []
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudCompraListResponse(BaseModel):
    items: list[SolicitudCompraResponse]
    total: int
    skip: int
    limit: int


# --- Órdenes de Compra ---
class ItemOrdenCreate(BaseModel):
    material_id: str
    cantidad: float = Field(..., gt=0)
    precio_unitario: float = Field(..., ge=0)


class ItemOrdenResponse(BaseModel):
    id: str
    material_id: str
    cantidad: float
    precio_unitario: float
    importe: float

    model_config = {"from_attributes": True}


class OrdenCompraCreate(BaseModel):
    proveedor_id: str
    solicitud_compra_id: Optional[str] = None
    fecha_orden: date
    fecha_entrega_esperada: Optional[date] = None
    condiciones_pago: Optional[str] = None
    notas: Optional[str] = None
    items: list[ItemOrdenCreate] = []


class OrdenCompraUpdate(BaseModel):
    estado: Optional[str] = None
    fecha_entrega_esperada: Optional[date] = None
    condiciones_pago: Optional[str] = None
    notas: Optional[str] = None


class OrdenCompraResponse(BaseModel):
    id: str
    numero: str
    solicitud_compra_id: Optional[str] = None
    proveedor_id: str
    fecha_orden: date
    fecha_entrega_esperada: Optional[date] = None
    estado: str
    subtotal: float
    iva: float
    total: float
    condiciones_pago: Optional[str] = None
    notas: Optional[str] = None
    items: list[ItemOrdenResponse] = []
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class OrdenCompraListResponse(BaseModel):
    items: list[OrdenCompraResponse]
    total: int
    skip: int
    limit: int
