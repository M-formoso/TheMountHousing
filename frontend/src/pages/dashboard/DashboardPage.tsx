import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import {
  Home, Users, DollarSign, TrendingUp, Building2,
  CheckCircle, Clock, AlertCircle, ArrowUpRight, Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/axios'

interface Unidad {
  id: string
  numero_unidad: string
  nombre?: string
  tipo_casa?: string
  metros_cuadrados: number
  precio_total?: number
  estado: string
  avance_porcentaje: number
  etapa_actual?: string
}

interface DashboardStats {
  unidades: {
    total: number
    disponibles: number
    vendidas: number
    reservadas: number
    en_construccion: number
  }
  financiero: {
    valor_total_proyecto: number
    valor_vendido: number
    valor_disponible: number
  }
  avance: {
    promedio: number
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const { data: unidades = [], isLoading } = useQuery<Unidad[]>({
    queryKey: ['unidades'],
    queryFn: async () => {
      const res = await api.get('/api/v1/unidades')
      return res.data
    },
  })

  const { data: clientesData } = useQuery({
    queryKey: ['clientes-count'],
    queryFn: async () => {
      const res = await api.get('/api/v1/clientes?limit=1')
      return res.data
    },
  })

  // Calcular estadísticas
  const stats: DashboardStats = {
    unidades: {
      total: unidades.length,
      disponibles: unidades.filter(u => u.estado === 'disponible').length,
      vendidas: unidades.filter(u => u.estado === 'vendida').length,
      reservadas: unidades.filter(u => u.estado === 'reservada').length,
      en_construccion: unidades.filter(u => u.estado === 'en_construccion').length,
    },
    financiero: {
      valor_total_proyecto: unidades.reduce((sum, u) => sum + (u.precio_total || 0), 0),
      valor_vendido: unidades.filter(u => u.estado === 'vendida').reduce((sum, u) => sum + (u.precio_total || 0), 0),
      valor_disponible: unidades.filter(u => u.estado === 'disponible').reduce((sum, u) => sum + (u.precio_total || 0), 0),
    },
    avance: {
      promedio: unidades.length > 0
        ? Math.round(unidades.reduce((sum, u) => sum + u.avance_porcentaje, 0) / unidades.length)
        : 0,
    },
  }

  // Unidades recientes o con mayor avance
  const unidadesDestacadas = [...unidades]
    .sort((a, b) => b.avance_porcentaje - a.avance_porcentaje)
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="text-secondary-500 text-sm">Panel de control - The Mount Housing</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full font-medium">
            {stats.unidades.total} Unidades
          </span>
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">
            {stats.avance.promedio}% Avance Promedio
          </span>
        </div>
      </div>

      {/* KPI Cards - Unidades */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Unidades Disponibles"
          value={stats.unidades.disponibles}
          icon={<Home className="text-green-600" size={24} />}
          color="from-green-50 to-green-100"
          textColor="text-green-700"
        />
        <KPICard
          title="Unidades Vendidas"
          value={stats.unidades.vendidas}
          icon={<CheckCircle className="text-blue-600" size={24} />}
          color="from-blue-50 to-blue-100"
          textColor="text-blue-700"
        />
        <KPICard
          title="Reservadas"
          value={stats.unidades.reservadas}
          icon={<Clock className="text-yellow-600" size={24} />}
          color="from-yellow-50 to-yellow-100"
          textColor="text-yellow-700"
        />
        <KPICard
          title="Clientes"
          value={clientesData?.total || 0}
          icon={<Users className="text-purple-600" size={24} />}
          color="from-purple-50 to-purple-100"
          textColor="text-purple-700"
        />
      </div>

      {/* KPI Cards - Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Valor Total Proyecto</p>
              <p className="text-2xl font-bold text-secondary-900 mt-1">
                {formatCurrency(stats.financiero.valor_total_proyecto)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Building2 className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Valor Vendido</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(stats.financiero.valor_vendido)}
              </p>
              <p className="text-xs text-secondary-400 mt-1">
                {stats.unidades.total > 0
                  ? Math.round((stats.unidades.vendidas / stats.unidades.total) * 100)
                  : 0}% del proyecto
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Valor Disponible</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(stats.financiero.valor_disponible)}
              </p>
              <p className="text-xs text-secondary-400 mt-1">
                {stats.unidades.disponibles} unidades por vender
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avance de Obra */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-800">Avance de Obra</h2>
            <button
              onClick={() => navigate('/unidades')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Ver todas <ArrowUpRight size={14} />
            </button>
          </div>

          {unidadesDestacadas.length > 0 ? (
            <div className="space-y-3">
              {unidadesDestacadas.map((unidad) => (
                <div
                  key={unidad.id}
                  className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => navigate(`/unidades/${unidad.id}`)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    unidad.estado === 'vendida' ? 'bg-blue-100' :
                    unidad.estado === 'disponible' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <Home className={`${
                      unidad.estado === 'vendida' ? 'text-blue-600' :
                      unidad.estado === 'disponible' ? 'text-green-600' : 'text-yellow-600'
                    }`} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-secondary-800 truncate">
                        {unidad.numero_unidad}
                        {unidad.nombre && <span className="text-primary-600 ml-1">· {unidad.nombre}</span>}
                      </p>
                      <span className="text-sm font-semibold text-secondary-700">
                        {unidad.avance_porcentaje}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 bg-secondary-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          unidad.avance_porcentaje === 100 ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${unidad.avance_porcentaje}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto text-secondary-300 mb-2" size={40} />
              <p className="text-secondary-500 text-sm">No hay unidades cargadas</p>
              <button
                onClick={() => navigate('/unidades')}
                className="mt-2 text-primary-600 text-sm hover:underline"
              >
                Cargar unidades
              </button>
            </div>
          )}
        </div>

        {/* Resumen por Estado */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4">Distribución de Unidades</h2>

          {unidades.length > 0 ? (
            <div className="space-y-4">
              <ProgressBar
                label="Disponibles"
                value={stats.unidades.disponibles}
                total={stats.unidades.total}
                color="bg-green-500"
              />
              <ProgressBar
                label="Vendidas"
                value={stats.unidades.vendidas}
                total={stats.unidades.total}
                color="bg-blue-500"
              />
              <ProgressBar
                label="Reservadas"
                value={stats.unidades.reservadas}
                total={stats.unidades.total}
                color="bg-yellow-500"
              />
              <ProgressBar
                label="En Construcción"
                value={stats.unidades.en_construccion}
                total={stats.unidades.total}
                color="bg-orange-500"
              />

              {/* Resumen visual */}
              <div className="mt-6 pt-4 border-t border-secondary-100">
                <div className="flex items-center justify-center gap-1 h-8">
                  {unidades.map((u, i) => (
                    <div
                      key={i}
                      className={`w-4 h-full rounded-sm ${
                        u.estado === 'vendida' ? 'bg-blue-400' :
                        u.estado === 'disponible' ? 'bg-green-400' :
                        u.estado === 'reservada' ? 'bg-yellow-400' : 'bg-orange-400'
                      }`}
                      title={u.numero_unidad}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-secondary-500">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-400 rounded-sm" /> Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-sm" /> Vendida
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded-sm" /> Reservada
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-secondary-300 mb-2" size={40} />
              <p className="text-secondary-500 text-sm">Sin datos disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            label="Ver Unidades"
            icon={<Home size={20} />}
            onClick={() => navigate('/unidades')}
          />
          <QuickAction
            label="Clientes"
            icon={<Users size={20} />}
            onClick={() => navigate('/clientes')}
          />
          <QuickAction
            label="Análisis ROI"
            icon={<TrendingUp size={20} />}
            onClick={() => navigate('/roi')}
          />
          <QuickAction
            label="Reportes"
            icon={<AlertCircle size={20} />}
            onClick={() => navigate('/reportes')}
          />
        </div>
      </div>
    </div>
  )
}

function KPICard({
  title,
  value,
  icon,
  color,
  textColor,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  textColor: string
}) {
  return (
    <div className={`card p-5 bg-gradient-to-br ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary-500">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  )
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-secondary-600">{label}</span>
        <span className="font-medium text-secondary-800">{value} / {total}</span>
      </div>
      <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-xl transition-colors"
    >
      <div className="text-primary-600">{icon}</div>
      <span className="text-sm font-medium text-secondary-700">{label}</span>
    </button>
  )
}
