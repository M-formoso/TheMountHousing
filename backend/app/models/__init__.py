# -*- coding: utf-8 -*-
"""
Modelos de base de datos.
Importar todos los modelos aqui para que Alembic los detecte.
"""

from app.models.base import Base
from app.models.usuario import Usuario
from app.models.cliente import Cliente
from app.models.proyecto import Proyecto, FaseProyecto, DocumentoProyecto, FotoProyecto, EntradaBitacora
from app.models.empleado import Empleado
from app.models.subcontratista import Subcontratista
from app.models.proveedor import Proveedor
from app.models.cotizacion import Cotizacion, PartidaCotizacion
from app.models.material import Material, MovimientoInventario, PrecioMaterial, SolicitudCompra, ItemSolicitudCompra, OrdenCompra, ItemOrdenCompra
from app.models.maquinaria import Maquinaria, MantenimientoMaquinaria
from app.models.finanzas import Ingreso, Egreso, CuentaPorCobrar, PagoCuentaCobrar, CuentaPorPagar, PagoCuentaPagar
from app.models.alerta import Alerta
from app.models.unidad import Unidad

__all__ = [
    "Base",
    "Usuario",
    "Cliente",
    "Proyecto",
    "FaseProyecto",
    "DocumentoProyecto",
    "FotoProyecto",
    "EntradaBitacora",
    "Empleado",
    "Subcontratista",
    "Proveedor",
    "Cotizacion",
    "PartidaCotizacion",
    "Material",
    "MovimientoInventario",
    "PrecioMaterial",
    "SolicitudCompra",
    "ItemSolicitudCompra",
    "OrdenCompra",
    "ItemOrdenCompra",
    "Maquinaria",
    "MantenimientoMaquinaria",
    "Ingreso",
    "Egreso",
    "CuentaPorCobrar",
    "PagoCuentaCobrar",
    "CuentaPorPagar",
    "PagoCuentaPagar",
    "Alerta",
    "Unidad",
]
