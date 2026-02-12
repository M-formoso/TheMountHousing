export type EstadoCotizacion = 'pendiente' | 'enviada' | 'en_revision' | 'aceptada' | 'rechazada' | 'vencida'

export interface PartidaCotizacion {
  id: string
  numero_partida: number
  concepto: string
  descripcion: string | null
  unidad: string
  cantidad: number
  precio_unitario: number
  importe: number
  incluye_material: boolean
  incluye_mano_obra: boolean
  incluye_maquinaria: boolean
  mano_obra_horas: number | null
  costo_mano_obra: number | null
}

export interface Cotizacion {
  id: string
  numero: string
  version: number
  fecha_emision: string
  fecha_vigencia: string | null
  estado: EstadoCotizacion
  cliente_id: string
  proyecto_nombre: string | null
  proyecto_descripcion: string | null
  proyecto_ubicacion: string | null
  subtotal: number
  iva: number
  total: number
  margen_utilidad: number
  condiciones_pago: string | null
  tiempo_ejecucion_dias: number | null
  garantia: string | null
  notas: string | null
  elaborada_por_id: string
  aprobada_por_id: string | null
  fecha_aprobacion: string | null
  firma_cliente_url: string | null
  fecha_firma: string | null
  proyecto_id: string | null
  partidas: PartidaCotizacion[]
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PartidaCreate {
  numero_partida: number
  concepto: string
  descripcion?: string
  unidad: string
  cantidad: number
  precio_unitario: number
  incluye_material?: boolean
  incluye_mano_obra?: boolean
  incluye_maquinaria?: boolean
  mano_obra_horas?: number
  costo_mano_obra?: number
}

export interface CotizacionCreate {
  cliente_id: string
  fecha_emision: string
  fecha_vigencia?: string
  proyecto_nombre?: string
  proyecto_descripcion?: string
  proyecto_ubicacion?: string
  margen_utilidad?: number
  condiciones_pago?: string
  tiempo_ejecucion_dias?: number
  garantia?: string
  notas?: string
  partidas?: PartidaCreate[]
}

export interface CotizacionUpdate {
  estado?: EstadoCotizacion
  fecha_vigencia?: string
  proyecto_nombre?: string
  proyecto_descripcion?: string
  proyecto_ubicacion?: string
  margen_utilidad?: number
  condiciones_pago?: string
  tiempo_ejecucion_dias?: number
  garantia?: string
  notas?: string
}
