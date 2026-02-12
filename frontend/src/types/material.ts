export type CategoriaMaterial = 'cemento' | 'arena' | 'varilla' | 'block' | 'ladrillo' | 'acero' | 'madera' | 'tuberia' | 'cable' | 'acabados' | 'pintura' | 'otro'
export type UnidadMedida = 'm2' | 'm3' | 'kg' | 'ton' | 'pieza' | 'metro' | 'caja' | 'litro' | 'otro'
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'merma'

export interface Material {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  categoria: CategoriaMaterial
  subcategoria: string | null
  unidad_medida: UnidadMedida
  precio_unitario_actual: number
  stock_actual: number
  stock_minimo: number
  stock_maximo: number
  ubicacion_almacen: string | null
  proveedor_principal_id: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface MaterialCreate {
  nombre: string
  descripcion?: string
  categoria: CategoriaMaterial
  subcategoria?: string
  unidad_medida: UnidadMedida
  precio_unitario_actual?: number
  stock_minimo?: number
  stock_maximo?: number
  ubicacion_almacen?: string
  proveedor_principal_id?: string
}

export interface MaterialUpdate extends Partial<MaterialCreate> {
  stock_actual?: number
}

export interface MovimientoInventario {
  id: string
  material_id: string
  tipo: TipoMovimiento
  cantidad: number
  proyecto_id: string | null
  fecha: string
  costo_unitario: number
  costo_total: number
  notas: string | null
  created_at: string
}

export interface MovimientoCreate {
  material_id: string
  tipo: TipoMovimiento
  cantidad: number
  proyecto_id?: string
  fecha: string
  costo_unitario?: number
  notas?: string
}

export interface ItemSolicitud {
  id: string
  material_id: string
  cantidad: number
  precio_estimado: number | null
  notas: string | null
}

export interface SolicitudCompra {
  id: string
  numero: string
  proyecto_id: string | null
  fecha_solicitud: string
  fecha_requerida: string | null
  estado: string
  prioridad: string
  total_estimado: number
  notas: string | null
  items: ItemSolicitud[]
  activo: boolean
  created_at: string
}

export interface SolicitudCompraCreate {
  proyecto_id?: string
  fecha_solicitud: string
  fecha_requerida?: string
  prioridad?: string
  notas?: string
  items: { material_id: string; cantidad: number; precio_estimado?: number; notas?: string }[]
}

export interface ItemOrden {
  id: string
  material_id: string
  cantidad: number
  precio_unitario: number
  importe: number
}

export interface OrdenCompra {
  id: string
  numero: string
  solicitud_compra_id: string | null
  proveedor_id: string
  fecha_orden: string
  fecha_entrega_esperada: string | null
  estado: string
  subtotal: number
  iva: number
  total: number
  condiciones_pago: string | null
  notas: string | null
  items: ItemOrden[]
  activo: boolean
  created_at: string
}

export interface OrdenCompraCreate {
  proveedor_id: string
  solicitud_compra_id?: string
  fecha_orden: string
  fecha_entrega_esperada?: string
  condiciones_pago?: string
  notas?: string
  items: { material_id: string; cantidad: number; precio_unitario: number }[]
}
