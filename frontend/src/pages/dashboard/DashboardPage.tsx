import { useAuthStore } from '@/stores/auth.store'
import { useClientes } from '@/services/clientes.service'
import { useProyectos } from '@/services/proyectos.service'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { data: clientes } = useClientes({ limit: 100 })
  const { data: proyectos } = useProyectos({ limit: 100 })
  const { data: proyectosActivos } = useProyectos({ estado: 'en_construccion' })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-secondary-500 text-sm">Resumen del sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Proyectos Activos" value={proyectosActivos?.total ?? 0} color="bg-primary-500" />
        <KPICard title="Total Proyectos" value={proyectos?.total ?? 0} color="bg-info" />
        <KPICard title="Clientes" value={clientes?.total ?? 0} color="bg-success" />
        <KPICard title="Alertas Pendientes" value={0} color="bg-warning" />
      </div>

      {/* Proyectos recientes */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-800 mb-4">Proyectos Recientes</h2>
        {proyectos?.items && proyectos.items.length > 0 ? (
          <div className="space-y-3">
            {proyectos.items.slice(0, 5).map((proyecto) => (
              <div key={proyecto.id} className="flex items-center justify-between p-3 rounded-lg border border-secondary-200 hover:bg-secondary-50">
                <div>
                  <p className="font-medium text-secondary-800">{proyecto.nombre}</p>
                  <p className="text-sm text-secondary-500">{proyecto.codigo} · {proyecto.tipo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary-700">{proyecto.progreso_general}%</p>
                    <p className="text-xs text-secondary-400">Avance</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoColor(proyecto.estado)}`}>
                    {getEstadoLabel(proyecto.estado)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-500 text-sm text-center py-8">No hay proyectos aún</p>
        )}
      </div>
    </div>
  )
}

function KPICard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary-500">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 mt-0.5">{value}</p>
        </div>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center opacity-20`} />
      </div>
    </div>
  )
}

function getEstadoColor(estado: string) {
  const colors: Record<string, string> = {
    cotizacion: 'bg-blue-100 text-blue-700',
    adjudicado: 'bg-purple-100 text-purple-700',
    en_construccion: 'bg-yellow-100 text-yellow-700',
    pausado: 'bg-gray-100 text-gray-600',
    finalizado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }
  return colors[estado] || 'bg-gray-100 text-gray-600'
}

function getEstadoLabel(estado: string) {
  const labels: Record<string, string> = {
    cotizacion: 'Cotización',
    adjudicado: 'Adjudicado',
    en_construccion: 'En Construcción',
    pausado: 'Pausado',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  }
  return labels[estado] || estado
}
