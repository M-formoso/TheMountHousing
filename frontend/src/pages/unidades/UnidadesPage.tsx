import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Home, Search, Plus, Eye, DollarSign, Ruler, Tag,
  CheckCircle, Clock, AlertCircle, Building2, Loader2,
} from 'lucide-react'
import api from '@/lib/axios'

interface Unidad {
  id: string
  numero_unidad: string
  nombre?: string
  tipo_casa?: string
  metros_cuadrados: number
  precio_por_m2?: number
  precio_total?: number
  estado: string
  avance_porcentaje: number
  etapa_actual?: string
  cliente_id?: string
  render_url?: string
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'disponible':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'reservada':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'vendida':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'en_construccion':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case 'disponible':
      return <CheckCircle size={14} />
    case 'reservada':
      return <Clock size={14} />
    case 'vendida':
      return <DollarSign size={14} />
    default:
      return <AlertCircle size={14} />
  }
}

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case 'disponible':
      return 'Disponible'
    case 'reservada':
      return 'Reservada'
    case 'vendida':
      return 'Vendida'
    case 'en_construccion':
      return 'En Construcción'
    default:
      return estado
  }
}

export default function UnidadesPage() {
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: unidades = [], isLoading } = useQuery<Unidad[]>({
    queryKey: ['unidades'],
    queryFn: async () => {
      const res = await api.get('/api/v1/unidades')
      return res.data
    },
  })

  const seedMutation = useMutation({
    mutationFn: () => api.post('/api/v1/unidades/seed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
    },
  })

  const filteredUnidades = unidades.filter((u) => {
    const matchSearch =
      u.numero_unidad.toLowerCase().includes(search.toLowerCase()) ||
      u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      u.tipo_casa?.toLowerCase().includes(search.toLowerCase())

    const matchEstado = !filtroEstado || u.estado === filtroEstado

    return matchSearch && matchEstado
  })

  // Estadísticas
  const stats = {
    total: unidades.length,
    disponibles: unidades.filter((u) => u.estado === 'disponible').length,
    vendidas: unidades.filter((u) => u.estado === 'vendida').length,
    reservadas: unidades.filter((u) => u.estado === 'reservada').length,
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-2">
            <Home className="text-primary-600" />
            Unidades / PH
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            Gestión de las 20 unidades del proyecto The Mount
          </p>
        </div>
        {unidades.length === 0 && (
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            {seedMutation.isPending ? 'Cargando...' : 'Cargar 20 PH'}
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-secondary-50 to-white">
          <div className="text-sm text-secondary-500">Total Unidades</div>
          <div className="text-2xl font-bold text-secondary-800">{stats.total}</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-green-50 to-white">
          <div className="text-sm text-green-600">Disponibles</div>
          <div className="text-2xl font-bold text-green-700">{stats.disponibles}</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="text-sm text-blue-600">Vendidas</div>
          <div className="text-2xl font-bold text-blue-700">{stats.vendidas}</div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-yellow-50 to-white">
          <div className="text-sm text-yellow-600">Reservadas</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.reservadas}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por número, nombre o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponibles</option>
          <option value="vendida">Vendidas</option>
          <option value="reservada">Reservadas</option>
          <option value="en_construccion">En Construcción</option>
        </select>
      </div>

      {/* Grid de Cards */}
      {filteredUnidades.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="mx-auto text-secondary-300 mb-4" size={48} />
          <p className="text-secondary-500">No se encontraron unidades</p>
          {unidades.length === 0 && (
            <p className="text-sm text-secondary-400 mt-2">
              Haz clic en "Cargar 20 PH" para importar las unidades del proyecto
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUnidades.map((unidad) => (
            <div
              key={unidad.id}
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => navigate(`/unidades/${unidad.id}`)}
            >
              {/* Imagen / Render */}
              <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-50 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                {unidad.render_url ? (
                  <img
                    src={unidad.render_url}
                    alt={unidad.numero_unidad}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Home className="text-primary-300" size={48} />
                )}
                {/* Estado badge */}
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getEstadoColor(
                    unidad.estado
                  )}`}
                >
                  {getEstadoIcon(unidad.estado)}
                  {getEstadoLabel(unidad.estado)}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-secondary-800 text-lg">
                      {unidad.numero_unidad}
                    </h3>
                    {unidad.nombre && (
                      <p className="text-sm text-primary-600 font-medium">{unidad.nombre}</p>
                    )}
                  </div>
                </div>

                {/* Características */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-secondary-600">
                    <span className="flex items-center gap-1">
                      <Ruler size={14} />
                      Superficie
                    </span>
                    <span className="font-medium">{unidad.metros_cuadrados} m²</span>
                  </div>

                  {unidad.precio_por_m2 && (
                    <div className="flex items-center justify-between text-secondary-600">
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        Precio/m²
                      </span>
                      <span className="font-medium">{formatCurrency(unidad.precio_por_m2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-secondary-800 font-semibold pt-2 border-t border-secondary-100">
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      Total
                    </span>
                    <span className="text-primary-600">{formatCurrency(unidad.precio_total)}</span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-secondary-500 mb-1">
                    <span>Avance de obra</span>
                    <span>{unidad.avance_porcentaje}%</span>
                  </div>
                  <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
                      style={{ width: `${unidad.avance_porcentaje}%` }}
                    />
                  </div>
                  {unidad.etapa_actual && (
                    <p className="text-xs text-secondary-400 mt-1 capitalize">
                      Etapa: {unidad.etapa_actual}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-secondary-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/unidades/${unidad.id}`)
                    }}
                    className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    Ver Detalle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
