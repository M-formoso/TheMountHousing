export type TipoAlerta =
  | 'proyecto_retraso' | 'proyecto_sobrecosto' | 'stock_bajo'
  | 'mantenimiento_maquinaria' | 'vencimiento_seguro' | 'pago_proveedor_vence'
  | 'cuenta_cobrar_vencida' | 'cotizacion_vence' | 'inspeccion_calidad'
  | 'certificacion_empleado' | 'contrato_finaliza'

export type Prioridad = 'baja' | 'media' | 'alta' | 'critica'

export interface Alerta {
  id: string
  tipo: TipoAlerta
  prioridad: Prioridad
  titulo: string
  mensaje: string
  usuario_id: string | null
  rol_destinatario: string | null
  entidad_tipo: string | null
  entidad_id: string | null
  leida: boolean
  fecha_lectura: string | null
  accion_url: string | null
  accion_texto: string | null
  expira_en: string | null
  activo: boolean
  created_at: string
}
