import enum
from sqlalchemy import Column, String, Integer, Numeric, Float, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CategoriaMaterial(str, enum.Enum):
    CEMENTO = "cemento"
    ARENA = "arena"
    VARILLA = "varilla"
    BLOCK = "block"
    LADRILLO = "ladrillo"
    ACERO = "acero"
    MADERA = "madera"
    TUBERIA = "tuberia"
    CABLE = "cable"
    ACABADOS = "acabados"
    PINTURA = "pintura"
    OTRO = "otro"


class UnidadMedida(str, enum.Enum):
    M2 = "m2"
    M3 = "m3"
    KG = "kg"
    TON = "ton"
    PIEZA = "pieza"
    METRO = "metro"
    CAJA = "caja"
    LITRO = "litro"
    OTRO = "otro"


class TipoMovimiento(str, enum.Enum):
    ENTRADA = "entrada"
    SALIDA = "salida"
    AJUSTE = "ajuste"
    MERMA = "merma"


class Material(BaseModel):
    __tablename__ = "materiales"

    codigo = Column(String(30), unique=True, nullable=False, index=True)  # SKU
    nombre = Column(String(255), nullable=False, index=True)
    descripcion = Column(String, nullable=True)
    categoria = Column(SAEnum(CategoriaMaterial), nullable=False)
    subcategoria = Column(String(100), nullable=True)

    unidad_medida = Column(SAEnum(UnidadMedida), nullable=False)
    precio_unitario_actual = Column(Numeric(15, 2), default=0)

    # Inventario
    stock_actual = Column(Float, default=0)
    stock_minimo = Column(Float, default=0)
    stock_maximo = Column(Float, default=0)
    ubicacion_almacen = Column(String(100), nullable=True)

    # Proveedor principal
    proveedor_principal_id = Column(String(36), ForeignKey("proveedores.id"), nullable=True)

    # Relaciones
    movimientos = relationship("MovimientoInventario", back_populates="material")
    precios_historicos = relationship("PrecioMaterial", back_populates="material")


class MovimientoInventario(BaseModel):
    __tablename__ = "movimientos_inventario"

    material_id = Column(String(36), ForeignKey("materiales.id"), nullable=False)
    tipo = Column(SAEnum(TipoMovimiento), nullable=False)
    cantidad = Column(Float, nullable=False)
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    unidad_id = Column(String(36), ForeignKey("unidades.id"), nullable=True)  # PH asignado
    orden_compra_id = Column(String(36), ForeignKey("ordenes_compra.id"), nullable=True)
    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    costo_unitario = Column(Numeric(15, 2), default=0)
    costo_total = Column(Numeric(15, 2), default=0)
    notas = Column(String, nullable=True)

    # Relaciones
    material = relationship("Material", back_populates="movimientos")
    unidad = relationship("Unidad", back_populates="movimientos_material")


class PrecioMaterial(BaseModel):
    __tablename__ = "precios_material_historico"

    material_id = Column(String(36), ForeignKey("materiales.id"), nullable=False)
    precio = Column(Numeric(15, 2), nullable=False)
    proveedor_id = Column(String(36), ForeignKey("proveedores.id"), nullable=True)
    fecha = Column(Date, nullable=False)

    # Relación
    material = relationship("Material", back_populates="precios_historicos")


class SolicitudCompra(BaseModel):
    __tablename__ = "solicitudes_compra"

    numero = Column(String(30), unique=True, nullable=False, index=True)
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    solicitante_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    fecha_solicitud = Column(Date, nullable=False)
    fecha_requerida = Column(Date, nullable=True)
    estado = Column(String(30), default="pendiente")  # pendiente, aprobada, rechazada, completada
    prioridad = Column(String(10), default="media")  # baja, media, alta
    total_estimado = Column(Numeric(15, 2), default=0)
    notas = Column(String, nullable=True)

    # Relaciones
    items = relationship("ItemSolicitudCompra", back_populates="solicitud", cascade="all, delete-orphan")


class ItemSolicitudCompra(BaseModel):
    __tablename__ = "items_solicitud_compra"

    solicitud_id = Column(String(36), ForeignKey("solicitudes_compra.id"), nullable=False)
    material_id = Column(String(36), ForeignKey("materiales.id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    precio_estimado = Column(Numeric(15, 2), nullable=True)
    notas = Column(String, nullable=True)

    # Relación
    solicitud = relationship("SolicitudCompra", back_populates="items")


class OrdenCompra(BaseModel):
    __tablename__ = "ordenes_compra"

    numero = Column(String(30), unique=True, nullable=False, index=True)
    solicitud_compra_id = Column(String(36), ForeignKey("solicitudes_compra.id"), nullable=True)
    proveedor_id = Column(String(36), ForeignKey("proveedores.id"), nullable=False)
    unidad_id = Column(String(36), ForeignKey("unidades.id"), nullable=True)  # PH asignado
    fecha_orden = Column(Date, nullable=False)
    fecha_entrega_esperada = Column(Date, nullable=True)
    estado = Column(String(30), default="pendiente")  # pendiente, confirmada, recibida, cancelada

    subtotal = Column(Numeric(15, 2), default=0)
    iva = Column(Numeric(15, 2), default=0)
    total = Column(Numeric(15, 2), default=0)

    condiciones_pago = Column(String, nullable=True)
    notas = Column(String, nullable=True)

    # Relaciones
    items = relationship("ItemOrdenCompra", back_populates="orden", cascade="all, delete-orphan")
    unidad = relationship("Unidad", back_populates="ordenes_compra")


class ItemOrdenCompra(BaseModel):
    __tablename__ = "items_orden_compra"

    orden_id = Column(String(36), ForeignKey("ordenes_compra.id"), nullable=False)
    material_id = Column(String(36), ForeignKey("materiales.id"), nullable=False)
    cantidad = Column(Float, nullable=False)
    precio_unitario = Column(Numeric(15, 2), nullable=False)
    importe = Column(Numeric(15, 2), nullable=False)

    # Relación
    orden = relationship("OrdenCompra", back_populates="items")
