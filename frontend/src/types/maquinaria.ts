export type TipoMaquinaria = 'excavadora' | 'retroexcavadora' | 'camion' | 'revolvedora' | 'gru' | 'tractor' | 'compactador' | 'herramienta' | 'otro'
export type TipoPropiedad = 'propia' | 'rentada' | 'subcontratista'
export type EstadoMaquinaria = 'operativa' | 'mantenimiento' | 'descompuesta' | 'baja'
export type TipoCombustible = 'diesel' | 'gasolina' | 'electrico' | 'gas'

export interface Maquinaria {
  id: string
  codigo: string
  nombre: string
  tipo: TipoMaquinaria
  marca: string | null
  modelo: string | null
  anio: number | null
  tipo_propiedad: TipoPropiedad
  numero_serie: string | null
  numero_economico: string | null
  placas: string | null
  estado: EstadoMaquinaria
  ubicacion_actual: string | null
  proyecto_asignado_id: string | null
  costo_adquisicion: number | null
  costo_renta_dia: number | null
  costo_operacion_hora: number | null
  poliza_seguro: string | null
  vigencia_seguro: string | null
  horometro_actual: number
  odometro_actual: number | null
  capacidad: string | null
  combustible: TipoCombustible | null
  fecha_ultimo_mantenimiento: string | null
  proxima_mantenimiento: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface MaquinariaCreate {
  nombre: string
  tipo: TipoMaquinaria
  marca?: string
  modelo?: string
  anio?: number
  tipo_propiedad: TipoPropiedad
  numero_serie?: string
  numero_economico?: string
  placas?: string
  ubicacion_actual?: string
  proyecto_asignado_id?: string
  costo_adquisicion?: number
  costo_renta_dia?: number
  costo_operacion_hora?: number
  poliza_seguro?: string
  vigencia_seguro?: string
  horometro_actual?: number
  odometro_actual?: number
  capacidad?: string
  combustible?: TipoCombustible
}

export interface MaquinariaUpdate extends Partial<MaquinariaCreate> {
  estado?: EstadoMaquinaria
  fecha_ultimo_mantenimiento?: string
  proxima_mantenimiento?: string
}

export interface MantenimientoMaquinaria {
  id: string
  maquinaria_id: string
  tipo: string
  descripcion: string
  fecha: string
  costo: number
  proveedor: string | null
  realizado_por: string | null
  notas: string | null
  created_at: string
}

export interface MantenimientoCreate {
  tipo: string
  descripcion: string
  fecha: string
  costo?: number
  proveedor?: string
  realizado_por?: string
  notas?: string
}
