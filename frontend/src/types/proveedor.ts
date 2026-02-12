export type TipoProveedor = 'materiales' | 'servicios' | 'ambos'

export interface Proveedor {
  id: string
  razon_social: string
  nombre_comercial: string | null
  rfc: string | null
  tipo: TipoProveedor
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
  condiciones_pago: string | null
  dias_credito: number
  descuento_pronto_pago: number
  tiempo_entrega_dias: number | null
  calificacion_calidad: number
  calificacion_precio: number
  calificacion_servicio: number
  calificacion_general: number
  volumen_compra_anual: number
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
  tipo: TipoProveedor
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
  condiciones_pago?: string
  dias_credito?: number
  descuento_pronto_pago?: number
  tiempo_entrega_dias?: number
  preferido?: boolean
  notas?: string
}

export interface ProveedorUpdate extends Partial<ProveedorCreate> {
  calificacion_calidad?: number
  calificacion_precio?: number
  calificacion_servicio?: number
}
