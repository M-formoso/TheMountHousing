export type CategoriaProveedor = 'materiales' | 'mano_de_obra' | 'servicios' | 'equipamiento' | 'otros'
export type EstadoProveedor = 'activo' | 'inactivo' | 'suspendido'
export type EspecialidadContratista = 'albanileria' | 'plomeria' | 'electricidad' | 'acabados' | 'carpinteria' | 'pintura' | 'soldadura' | 'vidrieria' | 'jardineria' | 'impermeabilizacion' | 'herreria' | 'general' | 'otro'
export type TipoAccion = 'computo' | 'acopio' | 'cuenta_corriente' | 'pedido' | 'entrega' | 'pago' | 'ajuste' | 'otro'
export type EstadoAccion = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

export interface Proveedor {
  id: string
  razon_social: string
  nombre_comercial: string | null
  rfc: string | null
  categoria: CategoriaProveedor
  estado: EstadoProveedor
  especialidad: EspecialidadContratista | null
  contacto_principal: string
  email: string
  telefono: string | null
  telefono_alternativo: string | null
  direccion: string | null
  ciudad: string | null
  estado_geo: string | null
  codigo_postal: string | null
  sitio_web: string | null
  banco: string | null
  cuenta_bancaria: string | null
  clabe: string | null
  numero_licencia: string | null
  tiene_seguro: boolean
  aseguradora: string | null
  numero_poliza: string | null
  vigencia_seguro: string | null
  condiciones_pago: string | null
  dias_credito: number
  descuento_pronto_pago: number
  tiempo_entrega_dias: number | null
  calificacion: number
  total_pagado: number
  total_pendiente: number
  trabajos_completados: number
  ultima_actividad: string | null
  preferido: boolean
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ProveedorCreate {
  razon_social: string
  nombre_comercial?: string
  rfc?: string
  categoria: CategoriaProveedor
  estado?: EstadoProveedor
  especialidad?: EspecialidadContratista
  contacto_principal: string
  email: string
  telefono?: string
  telefono_alternativo?: string
  direccion?: string
  ciudad?: string
  estado_geo?: string
  codigo_postal?: string
  sitio_web?: string
  banco?: string
  cuenta_bancaria?: string
  clabe?: string
  numero_licencia?: string
  tiene_seguro?: boolean
  aseguradora?: string
  numero_poliza?: string
  vigencia_seguro?: string | null
  condiciones_pago?: string
  dias_credito?: number
  descuento_pronto_pago?: number
  tiempo_entrega_dias?: number | null
  calificacion?: number
  preferido?: boolean
  notas?: string
}

export interface ProveedorUpdate extends Partial<ProveedorCreate> {
  total_pagado?: number
  total_pendiente?: number
  trabajos_completados?: number
  ultima_actividad?: string
}

// Adjuntos
export interface Adjunto {
  id: string
  nombre: string
  url: string
  tipo_archivo: string | null
  created_at: string
}

export interface AdjuntoCreate {
  nombre: string
  url: string
  tipo_archivo?: string
}

// Acciones de Proveedor
export interface AccionProveedor {
  id: string
  proveedor_id: string
  tipo: TipoAccion
  descripcion: string
  monto: number | null
  fecha: string
  estado: EstadoAccion
  referencia: string | null
  notas: string | null
  adjuntos: Adjunto[]
  created_at: string
  updated_at: string
}

export interface AccionProveedorCreate {
  tipo: TipoAccion
  descripcion: string
  monto?: number
  fecha: string
  estado?: EstadoAccion
  referencia?: string
  notas?: string
}

export interface AccionProveedorUpdate extends Partial<AccionProveedorCreate> {}

// ==================== LABELS Y COLORES PARA UI ====================

export const categoriaLabels: Record<CategoriaProveedor, string> = {
  materiales: 'Materiales',
  mano_de_obra: 'Mano de Obra',
  servicios: 'Servicios',
  equipamiento: 'Equipamiento',
  otros: 'Otros',
}

export const categoriaColors: Record<CategoriaProveedor, string> = {
  materiales: 'info',
  mano_de_obra: 'orange',
  servicios: 'purple',
  equipamiento: 'cyan',
  otros: 'secondary',
}

export const estadoProveedorLabels: Record<EstadoProveedor, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  suspendido: 'Suspendido',
}

export const estadoProveedorColors: Record<EstadoProveedor, string> = {
  activo: 'success',
  inactivo: 'secondary',
  suspendido: 'error',
}

export const especialidadLabels: Record<EspecialidadContratista, string> = {
  albanileria: 'Albañilería',
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  acabados: 'Acabados',
  carpinteria: 'Carpintería',
  pintura: 'Pintura',
  soldadura: 'Soldadura',
  vidrieria: 'Vidriería',
  jardineria: 'Jardinería',
  impermeabilizacion: 'Impermeabilización',
  herreria: 'Herrería',
  general: 'General',
  otro: 'Otro',
}

export const tipoAccionLabels: Record<TipoAccion, string> = {
  computo: 'Cómputo',
  acopio: 'Acopio',
  cuenta_corriente: 'Cuenta Corriente',
  pedido: 'Pedido',
  entrega: 'Entrega',
  pago: 'Pago',
  ajuste: 'Ajuste',
  otro: 'Otro',
}

export const tipoAccionColors: Record<TipoAccion, string> = {
  computo: 'info',
  acopio: 'purple',
  cuenta_corriente: 'cyan',
  pedido: 'warning',
  entrega: 'success',
  pago: 'success',
  ajuste: 'orange',
  otro: 'secondary',
}

export const estadoAccionLabels: Record<EstadoAccion, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export const estadoAccionColors: Record<EstadoAccion, string> = {
  pendiente: 'secondary',
  en_proceso: 'info',
  completado: 'success',
  cancelado: 'error',
}
