export type TipoIngreso = 'pago_cliente' | 'anticipo' | 'finiquito' | 'otros'
export type CategoriaEgreso = 'materiales' | 'mano_obra' | 'subcontratistas' | 'maquinaria' | 'gastos_generales' | 'impuestos' | 'otros'
export type MetodoPago = 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta'
export type EstadoPago = 'pendiente' | 'pagado' | 'parcial'
export type EstadoCuenta = 'pendiente' | 'parcial' | 'pagada' | 'vencida'

// Labels y colores para UI
export const tipoIngresoLabels: Record<TipoIngreso, string> = {
  pago_cliente: 'Pago Cliente',
  anticipo: 'Anticipo',
  finiquito: 'Finiquito',
  otros: 'Otros',
}

export const tipoIngresoColors: Record<TipoIngreso, string> = {
  pago_cliente: 'success',
  anticipo: 'info',
  finiquito: 'purple',
  otros: 'secondary',
}

export const categoriaEgresoLabels: Record<CategoriaEgreso, string> = {
  materiales: 'Materiales',
  mano_obra: 'Mano de Obra',
  subcontratistas: 'Subcontratistas',
  maquinaria: 'Maquinaria',
  gastos_generales: 'Gastos Generales',
  impuestos: 'Impuestos',
  otros: 'Otros',
}

export const categoriaEgresoColors: Record<CategoriaEgreso, string> = {
  materiales: 'info',
  mano_obra: 'orange',
  subcontratistas: 'purple',
  maquinaria: 'cyan',
  gastos_generales: 'secondary',
  impuestos: 'warning',
  otros: 'secondary',
}

export const metodoPagoLabels: Record<MetodoPago, string> = {
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
}

export const estadoPagoLabels: Record<EstadoPago, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  parcial: 'Parcial',
}

export const estadoPagoColors: Record<EstadoPago, string> = {
  pendiente: 'warning',
  pagado: 'success',
  parcial: 'info',
}

export const estadoCuentaLabels: Record<EstadoCuenta, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagada: 'Pagada',
  vencida: 'Vencida',
}

export const estadoCuentaColors: Record<EstadoCuenta, string> = {
  pendiente: 'warning',
  parcial: 'info',
  pagada: 'success',
  vencida: 'error',
}

export interface Ingreso {
  id: string
  tipo: TipoIngreso
  concepto: string
  monto: number
  fecha: string
  proyecto_id: string | null
  cliente_id: string | null
  metodo_pago: MetodoPago | null
  referencia: string | null
  factura: string | null
  notas: string | null
  registrado_por_id: string
  activo: boolean
  created_at: string
}

export interface IngresoCreate {
  tipo: TipoIngreso
  concepto: string
  monto: number
  fecha: string
  proyecto_id?: string
  cliente_id?: string
  metodo_pago?: MetodoPago
  referencia?: string
  factura?: string
  notas?: string
}

export interface Egreso {
  id: string
  categoria: CategoriaEgreso
  subcategoria: string | null
  concepto: string
  monto: number
  fecha: string
  proyecto_id: string | null
  proveedor_id: string | null
  subcontratista_id: string | null
  empleado_id: string | null
  metodo_pago: MetodoPago | null
  referencia: string | null
  factura: string | null
  autorizado_por_id: string | null
  estado_pago: EstadoPago
  notas: string | null
  activo: boolean
  created_at: string
}

export interface EgresoCreate {
  categoria: CategoriaEgreso
  subcategoria?: string
  concepto: string
  monto: number
  fecha: string
  proyecto_id?: string
  proveedor_id?: string
  subcontratista_id?: string
  empleado_id?: string
  metodo_pago?: MetodoPago
  referencia?: string
  factura?: string
  notas?: string
}

export interface PagoCuenta {
  id: string
  monto: number
  fecha: string
  metodo_pago: MetodoPago | null
  referencia: string | null
  notas: string | null
}

export interface CuentaPorCobrar {
  id: string
  cliente_id: string
  proyecto_id: string | null
  concepto: string
  monto_total: number
  monto_pagado: number
  saldo: number
  fecha_emision: string
  fecha_vencimiento: string | null
  estado: string
  pagos: PagoCuenta[]
  activo: boolean
  created_at: string
}

export interface CuentaCobrarCreate {
  cliente_id: string
  proyecto_id?: string
  concepto: string
  monto_total: number
  fecha_emision: string
  fecha_vencimiento?: string
}

export interface CuentaPorPagar {
  id: string
  proveedor_id: string | null
  subcontratista_id: string | null
  proyecto_id: string | null
  concepto: string
  monto_total: number
  monto_pagado: number
  saldo: number
  fecha_emision: string
  fecha_vencimiento: string | null
  estado: string
  prioridad: string
  pagos: PagoCuenta[]
  activo: boolean
  created_at: string
}

export interface CuentaPagearCreate {
  proveedor_id?: string
  subcontratista_id?: string
  proyecto_id?: string
  concepto: string
  monto_total: number
  fecha_emision: string
  fecha_vencimiento?: string
  prioridad?: string
}

export interface PagoCreate {
  monto: number
  fecha: string
  metodo_pago?: MetodoPago
  referencia?: string
  notas?: string
}
