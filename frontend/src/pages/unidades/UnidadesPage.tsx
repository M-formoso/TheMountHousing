import { useState } from 'react'
import { useParams } from 'react-router-dom'
import UnidadCard from '@/components/unidades/UnidadCard'
import AsignarClienteModal from '@/components/unidades/AsignarClienteModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import {
  useUnidades,
  useAsignarCliente,
  useLiberarUnidad,
  useUpdateUnidad,
  type Unidad,
} from '@/services/unidades.service'
import { useAuthStore } from '@/stores/auth.store'

export default function UnidadesPage() {
  const { proyectoId } = useParams<{ proyectoId?: string }>()
  const user = useAuthStore((state) => state.user)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string | null>(null)
  const [showAsignarModal, setShowAsignarModal] = useState(false)

  const { data: unidades, isLoading, error } = useUnidades({ proyecto_id: proyectoId })
  const asignarMutation = useAsignarCliente(unidadSeleccionada || '')
  const liberarMutation = useLiberarUnidad(unidadSeleccionada || '')
  const updateMutation = useUpdateUnidad(unidadSeleccionada || '')

  const canManage = user?.rol && ['SUPER_ADMIN', 'ADMINISTRADOR', 'GERENTE_PROYECTO'].includes(user.rol)

  const handleAsignarCliente = (unidadId: string) => {
    setUnidadSeleccionada(unidadId)
    setShowAsignarModal(true)
  }

  const handleConfirmAsignar = async (clienteId: string) => {
    if (!unidadSeleccionada) return
    try {
      await asignarMutation.mutateAsync(clienteId)
      setShowAsignarModal(false)
      setUnidadSeleccionada(null)
    } catch (err) {
      console.error('Error al asignar cliente:', err)
    }
  }

  const handleLiberar = async (unidadId: string) => {
    if (!confirm('¿Estás seguro de liberar esta unidad?')) return
    setUnidadSeleccionada(unidadId)
    try {
      await liberarMutation.mutateAsync()
      setUnidadSeleccionada(null)
    } catch (err) {
      console.error('Error al liberar unidad:', err)
    }
  }

  const handleChangeStatus = async (unidadId: string, newStatus: string) => {
    setUnidadSeleccionada(unidadId)
    try {
      await updateMutation.mutateAsync({ estado: newStatus })
      setUnidadSeleccionada(null)
    } catch (err) {
      console.error('Error al cambiar estado:', err)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Error al cargar las unidades" />

  const unidadesFiltradas =
    filtroEstado === 'todos'
      ? unidades
      : unidades?.filter((u) => u.estado === filtroEstado)

  const stats = {
    total: unidades?.length || 0,
    disponibles: unidades?.filter((u) => u.estado === 'disponible').length || 0,
    vendidas: unidades?.filter((u) => u.estado === 'vendida').length || 0,
    reservadas: unidades?.filter((u) => u.estado === 'reservada').length || 0,
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Unidades / PH
        </h1>
        <p className="text-secondary-600">
          Gestiona las unidades habitacionales del proyecto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Unidades</div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-2xl font-bold text-green-900">{stats.disponibles}</div>
          <div className="text-sm text-green-700">Disponibles</div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="text-2xl font-bold text-red-900">{stats.vendidas}</div>
          <div className="text-sm text-red-700">Vendidas</div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="text-2xl font-bold text-yellow-900">{stats.reservadas}</div>
          <div className="text-sm text-yellow-700">Reservadas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFiltroEstado('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === 'todos'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-300'
          }`}
        >
          Todas ({stats.total})
        </button>
        <button
          onClick={() => setFiltroEstado('disponible')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === 'disponible'
              ? 'bg-green-600 text-white'
              : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-300'
          }`}
        >
          Disponibles ({stats.disponibles})
        </button>
        <button
          onClick={() => setFiltroEstado('vendida')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === 'vendida'
              ? 'bg-red-600 text-white'
              : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-300'
          }`}
        >
          Vendidas ({stats.vendidas})
        </button>
        <button
          onClick={() => setFiltroEstado('reservada')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroEstado === 'reservada'
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-300'
          }`}
        >
          Reservadas ({stats.reservadas})
        </button>
      </div>

      {/* Grid de cards - 3 por fila */}
      {unidadesFiltradas && unidadesFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unidadesFiltradas.map((unidad) => (
            <UnidadCard
              key={unidad.id}
              unidad={unidad}
              onAsignarCliente={canManage ? handleAsignarCliente : undefined}
              onLiberar={canManage ? handleLiberar : undefined}
              onChangeStatus={canManage ? handleChangeStatus : undefined}
              canManage={canManage}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-secondary-500">
          No hay unidades {filtroEstado !== 'todos' && `con estado "${filtroEstado}"`}
        </div>
      )}

      {/* Modal Asignar Cliente */}
      {showAsignarModal && unidadSeleccionada && (
        <AsignarClienteModal
          unidadId={unidadSeleccionada}
          onClose={() => {
            setShowAsignarModal(false)
            setUnidadSeleccionada(null)
          }}
          onConfirm={handleConfirmAsignar}
          isLoading={asignarMutation.isPending}
        />
      )}
    </div>
  )
}
