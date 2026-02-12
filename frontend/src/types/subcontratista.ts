export type Especialidad = 'plomeria' | 'electricidad' | 'acabados' | 'carpinteria' | 'albanileo' | 'pintura' | 'jardineria' | 'vidrieria' | 'soldadura' | 'otro'
export type RangoPrecio = 'economico' | 'medio' | 'premium'

export interface Subcontratista {
  id: string
  razon_social: string
  nombre_comercial: string | null
  rfc: string | null
  contacto_principal: string
  email: string
  telefono: string | null
  telefono_alternativo: string | null
  especialidad: Especialidad
  direccion: string | null
  ciudad: string | null
  estado_geo: string | null
  banco: string | null
  cuenta_bancaria: string | null
  clabe: string | null
  calificacion: number
  precio_rango: RangoPrecio | null
  seguro_responsabilidad_civil: boolean
  seguro_vigencia: string | null
  en_lista_negra: boolean
  razon_lista_negra: string | null
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface SubcontratistaCreate {
  razon_social: string
  nombre_comercial?: string
  rfc?: string
  contacto_principal: string
  email: string
  telefono?: string
  telefono_alternativo?: string
  especialidad: Especialidad
  direccion?: string
  ciudad?: string
  estado_geo?: string
  banco?: string
  cuenta_bancaria?: string
  clabe?: string
  calificacion?: number
  precio_rango?: RangoPrecio
  seguro_responsabilidad_civil?: boolean
  seguro_vigencia?: string
  notas?: string
}

export interface SubcontratistaUpdate extends Partial<SubcontratistaCreate> {
  en_lista_negra?: boolean
  razon_lista_negra?: string
}
