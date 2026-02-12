export type TipoProyecto = 'residencial' | 'comercial' | 'industrial' | 'remodelacion' | 'obra_civil'
export type EstadoProyecto = 'cotizacion' | 'adjudicado' | 'en_construccion' | 'pausado' | 'finalizado' | 'cancelado'

export interface Proyecto {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  tipo: TipoProyecto
  estado: EstadoProyecto
  cliente_id: string
  gerente_proyecto_id: string | null
  direccion: string | null
  ciudad: string | null
  estado_geo: string | null
  codigo_postal: string | null
  latitud: number | null
  longitud: number | null
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  fecha_fin_real: string | null
  presupuesto_total: number
  costo_real: number
  margen_ganancia_esperado: number
  area_construccion_m2: number | null
  progreso_general: number
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
  fases: FaseProyecto[]
}

export interface FaseProyecto {
  id: string
  numero_fase: number
  nombre: string
  descripcion: string | null
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  fecha_fin_real: string | null
  progreso: number
  estado: string
  activo: boolean
}

export interface EntradaBitacora {
  id: string
  contenido: string
  clima: string | null
  temperatura: number | null
  trabajadores_presentes: number | null
  notas: string | null
  created_at: string
}

export interface ProyectoCreate {
  nombre: string
  descripcion?: string
  tipo: TipoProyecto
  cliente_id: string
  gerente_proyecto_id?: string
  direccion?: string
  ciudad?: string
  estado_geo?: string
  codigo_postal?: string
  latitud?: number
  longitud?: number
  fecha_inicio?: string
  fecha_fin_estimada?: string
  presupuesto_total?: number
  margen_ganancia_esperado?: number
  area_construccion_m2?: number
  notas?: string
}

export interface ProyectoUpdate extends Partial<ProyectoCreate> {
  estado?: EstadoProyecto
  progreso_general?: number
  fecha_fin_real?: string
  costo_real?: number
}

export interface FaseCreate {
  numero_fase: number
  nombre: string
  descripcion?: string
  fecha_inicio?: string
  fecha_fin_estimada?: string
}

export interface FaseUpdate {
  nombre?: string
  descripcion?: string
  fecha_inicio?: string
  fecha_fin_estimada?: string
  fecha_fin_real?: string
  progreso?: number
  estado?: string
}

export interface EntradaBitacoraCreate {
  contenido: string
  clima?: string
  temperatura?: number
  trabajadores_presentes?: number
  notas?: string
}
