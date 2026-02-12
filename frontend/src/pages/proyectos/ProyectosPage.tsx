import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useProyectos, useDeleteProyecto } from '@/services/proyectos.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ProyectoFormModal } from '@/components/proyectos/ProyectoFormModal'
import type { Proyecto } from '@/types/proyecto'

export default function ProyectosPage() {
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [tipo, setTipo] = useState('')
  const [skip, setSkip] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const limit = 20

  const { data, isLoading, error, refetch } = useProyectos({
    skip,
    limit,
    buscar: buscar || undefined,
    estado: estado || undefined,
    tipo: tipo || undefined,
  })

  const deleteMutation = useDeleteProyecto()
  const navigate = useNavigate()

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message='Error al cargar proyectos' />

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Proyectos</h1>
          <p className="text-secondary-500 text-sm">{data?.total ?? 0} proyectos registrados</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nuevo Proyecto
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
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setSkip(0) }} className="input-field sm:w-48">
            <option value="">Todos los estados</option>
            <option value="cotizacion">Cotización</option>
            <option value="adjudicado">Adjudicado</option>
            <option value="en_construccion">En Construcción</option>
            <option value="pausado">Pausado</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select value={tipo} onChange={(e) => { setTipo(e.target.value); setSkip(0) }} className="input-field sm:w-48">
            <option value="">Todos los tipos</option>
            <option value="residencial">Residencial</option>
            <option value="comercial">Comercial</option>
            <option value="industrial">Industrial</option>
            <option value="remodelacion">Remodelación</option>
            <option value="obra_civil">Obra Civil</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700 hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700 hidden lg:table-cell">Presupuesto</th>
                <th className="text-left px-4 py-3 font-semibold text-secondary-700">Avance</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((proyecto) => (
                <ProyectoRow
                  key={proyecto.id}
                  proyecto={proyecto}
                  onDelete={() => handleDelete(proyecto.id)}
                  onView={() => navigate(`/proyectos/${proyecto.id}`)}
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
              <button disabled={skip === 0} onClick={() => setSkip((prev) => Math.max(0, prev - limit))} className="px-3 py-1 text-sm border rounded-md disabled:opacity-40">Anterior</button>
              <button disabled={skip + limit >= data.total} onClick={() => setSkip((prev) => prev + limit)} className="px-3 py-1 text-sm border rounded-md disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}

        {data?.items.length === 0 && (
          <p className="text-center text-secondary-500 py-8">No se encontraron proyectos</p>
        )}
      </div>

      {isModalOpen && (
        <ProyectoFormModal onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch() }} />
      )}
    </div>
  )
}

function ProyectoRow({ proyecto, onDelete, onView }: { proyecto: Proyecto; onDelete: () => void; onView: () => void }) {
  const tipoLabels: Record<string, string> = {
    residencial: 'Residencial', comercial: 'Comercial', industrial: 'Industrial',
    remodelacion: 'Remodelación', obra_civil: 'Obra Civil',
  }
  const estadoColors: Record<string, string> = {
    cotizacion: 'bg-blue-100 text-blue-700',
    adjudicado: 'bg-purple-100 text-purple-700',
    en_construccion: 'bg-yellow-100 text-yellow-700',
    pausado: 'bg-gray-100 text-gray-600',
    finalizado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }
  const estadoLabels: Record<string, string> = {
    cotizacion: 'Cotización', adjudicado: 'Adjudicado', en_construccion: 'En Construcción',
    pausado: 'Pausado', finalizado: 'Finalizado', cancelado: 'Cancelado',
  }

  return (
    <tr className="border-t border-secondary-200 hover:bg-secondary-50 cursor-pointer" onClick={onView}>
      <td className="px-4 py-3 font-mono text-sm text-secondary-600">{proyecto.codigo}</td>
      <td className="px-4 py-3 font-medium text-secondary-800">{proyecto.nombre}</td>
      <td className="px-4 py-3 text-secondary-600 hidden md:table-cell">{tipoLabels[proyecto.tipo]}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColors[proyecto.estado]}`}>
          {estadoLabels[proyecto.estado]}
        </span>
      </td>
      <td className="px-4 py-3 text-secondary-600 hidden lg:table-cell">
        ${Number(proyecto.presupuesto_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-secondary-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${proyecto.progreso_general}%` }}
            />
          </div>
          <span className="text-sm text-secondary-600">{proyecto.progreso_general}%</span>
        </div>
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
