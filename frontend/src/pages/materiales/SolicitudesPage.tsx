import { useState } from 'react'
import { useSolicitudesCompra, useUpdateSolicitud } from '@/services/materiales.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { SolicitudCompra } from '@/types/material'

const estadoLabels: Record<string, string> = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada', completada: 'Completada' }
const estadoColors: Record<string, string> = { pendiente: 'bg-secondary-200 text-secondary-700', aprobada: 'bg-success text-white', rechazada: 'bg-error text-white', completada: 'bg-info text-white' }

export default function SolicitudesPage() {
  const [estado, setEstado] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useSolicitudesCompra({ skip, limit, estado: estado || undefined })
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    const mutation = useUpdateSolicitud(id)
    // Direct call since we can't call hooks dynamically
    const { default: api } = await import('@/lib/axios')
    await api.put(`/api/v1/materiales/solicitudes/${id}`, { estado: nuevoEstado })
    refetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Solicitudes de Compra</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={estado} onChange={(e) => { setEstado(e.target.value); setSkip(0) }} className="input-field w-full sm:w-48">
          <option value="">Todos los estados</option>
          {Object.entries(estadoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-secondary-600">Número</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Fecha</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Prioridad</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Estado</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Total est.</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Items</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s: SolicitudCompra) => (
                    <tr key={s.id} className="border-t border-secondary-100">
                      <td className="p-3 font-mono text-xs text-secondary-600">{s.numero}</td>
                      <td className="p-3 text-secondary-500">{new Date(s.fecha_solicitud).toLocaleDateString('es-MX')}</td>
                      <td className="p-3 capitalize text-secondary-600">{s.prioridad}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${estadoColors[s.estado]}`}>{estadoLabels[s.estado]}</span></td>
                      <td className="p-3 text-right text-secondary-700">${Number(s.total_estimado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-secondary-500">{s.items.length} item{s.items.length !== 1 ? 's' : ''}</td>
                      <td className="p-3">
                        {s.estado === 'pendiente' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleCambiarEstado(s.id, 'aprobada')} className="text-xs btn-primary py-0.5 px-2">Aprobar</button>
                            <button onClick={() => handleCambiarEstado(s.id, 'rechazada')} className="text-xs btn-outline py-0.5 px-2">Rechazar</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-secondary-400">No hay solicitudes</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          {total > limit && (
            <div className="flex items-center justify-between mt-4 text-sm text-secondary-500">
              <span>Mostrando {skip + 1}–{Math.min(skip + limit, total)} de {total}</span>
              <div className="flex gap-2">
                <button disabled={skip === 0} onClick={() => setSkip((s) => Math.max(0, s - limit))} className="btn-outline disabled:opacity-40">Anterior</button>
                <button disabled={skip + limit >= total} onClick={() => setSkip((s) => s + limit)} className="btn-outline disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
