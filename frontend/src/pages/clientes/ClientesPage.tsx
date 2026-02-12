import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useClientes, useDeleteCliente } from '@/services/clientes.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ClienteFormModal } from '@/components/clientes/ClienteFormModal'
import type { Cliente } from '@/types/cliente'

export default function ClientesPage() {
  const [buscar, setBuscar] = useState('')
  const [tipo, setTipo] = useState('')
  const [skip, setSkip] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const limit = 20

  const { data, isLoading, error, refetch } = useClientes({
    skip,
    limit,
    buscar: buscar || undefined,
    tipo: tipo || undefined,
  })

  const deleteMutation = useDeleteCliente()
  const navigate = useNavigate()

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message='Error al cargar clientes' />

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Clientes</h1>
          <p className="text-secondary-500 text-sm">{data?.total ?? 0} clientes registrados</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nuevo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={buscar}
              onChange={(e) => { setBuscar(e.target.value); setSkip(0) }}
              className="input-field pl-9"
            />
          </div>
          <select
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setSkip(0) }}
            className="input-field sm:w-48"
          >
            <option value="">Todos los tipos</option>
            <option value="persona_fisica">Persona Física</option>
            <option value="persona_moral">Persona Moral</option>
            <option value="gobierno">Gobierno</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700 hidden md:table-cell">Ciudad</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Calificación</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Estado Cuenta</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((cliente) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  onDelete={() => handleDelete(cliente.id)}
                  onView={() => navigate(`/clientes/${cliente.id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {data && data.total > limit && (
          <div className="flex items-center justify-between p-4 border-t border-secondary-200">
            <p className="text-sm text-secondary-500">
              Mostrando {skip + 1} - {Math.min(skip + limit, data.total)} de {data.total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip((prev) => Math.max(0, prev - limit))}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={skip + limit >= data.total}
                onClick={() => setSkip((prev) => prev + limit)}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {data?.items.length === 0 && (
          <p className="text-center text-secondary-500 py-8">No se encontraron clientes</p>
        )}
      </div>

      {/* Modal crear cliente */}
      {isModalOpen && (
        <ClienteFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); refetch() }}
        />
      )}
    </div>
  )
}

function ClienteRow({ cliente, onDelete, onView }: { cliente: Cliente; onDelete: () => void; onView: () => void }) {
  const tipoLabels: Record<string, string> = {
    persona_fisica: 'Persona Física',
    persona_moral: 'Persona Moral',
    gobierno: 'Gobierno',
  }
  const estadoCuentaColors: Record<string, string> = {
    al_dia: 'bg-green-100 text-green-700',
    debe: 'bg-red-100 text-red-700',
    credito: 'bg-blue-100 text-blue-700',
  }
  const estadoCuentaLabels: Record<string, string> = {
    al_dia: 'Al día',
    debe: 'Debe',
    credito: 'Crédito',
  }

  return (
    <tr className="border-t border-secondary-200 hover:bg-secondary-50 cursor-pointer" onClick={onView}>
      <td className="px-4 py-3 font-medium text-secondary-800">{cliente.nombre}</td>
      <td className="px-4 py-3 text-secondary-600">{tipoLabels[cliente.tipo]}</td>
      <td className="px-4 py-3 text-secondary-600">{cliente.email}</td>
      <td className="px-4 py-3 text-secondary-600 hidden md:table-cell">{cliente.ciudad || '—'}</td>
      <td className="px-4 py-3 text-secondary-600">{cliente.calificacion > 0 ? `${cliente.calificacion}/5` : '—'}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${estadoCuentaColors[cliente.estado_cuenta]}`}>
          {estadoCuentaLabels[cliente.estado_cuenta]}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1 text-secondary-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  )
}
