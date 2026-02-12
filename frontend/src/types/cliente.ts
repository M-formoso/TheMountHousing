export type TipoCliente = 'persona_fisica' | 'persona_moral' | 'gobierno'
export type EstadoCuenta = 'al_dia' | 'debe' | 'credito'
export type FormaPago = 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta'

export interface Cliente {
  id: string
  tipo: TipoCliente
  nombre: string
  rfc: string | null
  email: string
  telefono: string | null
  telefono_alternativo: string | null
  direccion: string | null
  ciudad: string | null
  estado_geo: string | null
  codigo_postal: string | null
  fecha_nacimiento: string | null
  representante_legal: string | null
  giro_empresarial: string | null
  calificacion: number
  estado_cuenta: EstadoCuenta
  limite_credito: number
  descuento_especial: number
  forma_pago_preferida: FormaPago | null
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
  contactos: ContactoCliente[]
}

export interface ContactoCliente {
  id: string
  nombre: string
  puesto: string | null
  email: string | null
  telefono: string | null
  es_principal: number
  activo: boolean
}

export interface ClienteCreate {
  tipo: TipoCliente
  nombre: string
  rfc?: string
  email: string
  telefono?: string
  telefono_alternativo?: string
  direccion?: string
  ciudad?: string
  estado_geo?: string
  codigo_postal?: string
  fecha_nacimiento?: string
  representante_legal?: string
  giro_empresarial?: string
  calificacion?: number
  forma_pago_preferida?: FormaPago
  notas?: string
}

export interface ClienteUpdate extends Partial<ClienteCreate> {
  estado_cuenta?: EstadoCuenta
  limite_credito?: number
  descuento_especial?: number
}
