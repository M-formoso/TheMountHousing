import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { useEmpleado } from '@/services/empleados.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

const deptLabels: Record<string, string> = {
  obra: 'Obra', administracion: 'Administración', contabilidad: 'Contabilidad',
  compras: 'Compras', ingenieria: 'Ingeniería', recursos_humanos: 'Recursos Humanos', ventas: 'Ventas',
}

const contratoLabels: Record<string, string> = { planta: 'Planta', obra: 'Obra por obra', honorarios: 'Honorarios' }

export default function EmpleadoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: empleado, isLoading, error } = useEmpleado(id!)

  if (isLoading) return <LoadingSpinner />
  if (error || !empleado) return <ErrorMessage message="Empleado no encontrado" />

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/empleados')} className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-500"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{empleado.nombre} {empleado.apellido_paterno} {empleado.apellido_materno || ''}</h1>
          <p className="text-secondary-500 text-sm">{empleado.numero_empleado} · {empleado.puesto} · {deptLabels[empleado.departamento]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Datos personales */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Datos Personales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="RFC" value={empleado.rfc || '—'} />
              <InfoField label="CURP" value={empleado.curp || '—'} />
              <InfoField label="NSS" value={empleado.nss || '—'} />
              <InfoField label="Fecha nacimiento" value={empleado.fecha_nacimiento ? formatDate(empleado.fecha_nacimiento) : '—'} />
              <InfoField label="Email" value={empleado.email} icon={<Mail size={14} />} />
              <InfoField label="Teléfono" value={empleado.telefono || '—'} icon={<Phone size={14} />} />
              <InfoField label="Dirección" value={empleado.direccion || '—'} />
              <InfoField label="Ciudad / Estado" value={[empleado.ciudad, empleado.estado_geo].filter(Boolean).join(', ') || '—'} />
            </div>
          </div>

          {/* Datos laborales */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Datos Laborales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Departamento" value={deptLabels[empleado.departamento]} />
              <InfoField label="Tipo contrato" value={empleado.tipo_contrato ? contratoLabels[empleado.tipo_contrato] : '—'} />
              <InfoField label="Fecha ingreso" value={empleado.fecha_ingreso ? formatDate(empleado.fecha_ingreso) : '—'} />
              <InfoField label="Fecha baja" value={empleado.fecha_baja ? formatDate(empleado.fecha_baja) : '—'} />
              <InfoField label="Salario diario" value={empleado.salario_diario != null ? `$${Number(empleado.salario_diario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'} />
            </div>
          </div>

          {/* Contacto emergencia */}
          {(empleado.contacto_emergencia_nombre || empleado.telefono_emergencia) && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4">Contacto de Emergencia</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoField label="Nombre" value={empleado.contacto_emergencia_nombre || '—'} />
                <InfoField label="Relación" value={empleado.contacto_emergencia_relacion || '—'} />
                <InfoField label="Teléfono" value={empleado.telefono_emergencia || '—'} icon={<Phone size={14} />} />
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral — médico */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-secondary-800 mb-3">Datos Médicos</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-secondary-500">Tipo de sangre</span><span className="text-sm font-medium text-secondary-700">{empleado.tipo_sangre || '—'}</span></div>
              <div className="flex justify-between"><span className="text-sm text-secondary-500">Alergias</span><span className="text-sm font-medium text-secondary-700">{empleado.alergias || '—'}</span></div>
              <div className="flex justify-between"><span className="text-sm text-secondary-500">Enfermedades</span><span className="text-sm font-medium text-secondary-700">{empleado.enfermedades || '—'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-secondary-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-secondary-700 flex items-center gap-1 mt-0.5">{icon} {value}</p>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
