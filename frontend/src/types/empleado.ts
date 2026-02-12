export type Departamento = 'obra' | 'administracion' | 'contabilidad' | 'compras' | 'ingenieria' | 'recursos_humanos' | 'ventas'
export type TipoContrato = 'planta' | 'obra' | 'honorarios'

export interface Empleado {
  id: string
  numero_empleado: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string | null
  fecha_nacimiento: string | null
  rfc: string | null
  curp: string | null
  nss: string | null
  email: string
  telefono: string | null
  telefono_emergencia: string | null
  contacto_emergencia_nombre: string | null
  contacto_emergencia_relacion: string | null
  direccion: string | null
  ciudad: string | null
  estado_geo: string | null
  codigo_postal: string | null
  puesto: string
  departamento: Departamento
  fecha_ingreso: string | null
  fecha_baja: string | null
  tipo_contrato: TipoContrato | null
  salario_diario: number | null
  tipo_sangre: string | null
  alergias: string | null
  enfermedades: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface EmpleadoCreate {
  nombre: string
  apellido_paterno: string
  apellido_materno?: string
  fecha_nacimiento?: string
  rfc?: string
  curp?: string
  nss?: string
  email: string
  telefono?: string
  telefono_emergencia?: string
  contacto_emergencia_nombre?: string
  contacto_emergencia_relacion?: string
  direccion?: string
  ciudad?: string
  estado_geo?: string
  codigo_postal?: string
  puesto: string
  departamento: Departamento
  fecha_ingreso?: string
  tipo_contrato?: TipoContrato
  salario_diario?: number
  tipo_sangre?: string
  alergias?: string
  enfermedades?: string
}

export interface EmpleadoUpdate extends Partial<EmpleadoCreate> {
  fecha_baja?: string
}
