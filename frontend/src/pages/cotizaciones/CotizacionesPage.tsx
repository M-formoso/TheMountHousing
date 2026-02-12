import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useCotizaciones, useDeleteCotizacion } from '@/services/cotizaciones.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Cotizacion } from '@/types/cotizacion'

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente', enviada: 'Enviada', en_revision: 'En Revisión',
  aceptada: 'Aceptada', rechazada: 'Rechazada', vencida: 'Vencida',
}

const estadoColors: Record<string, string> = {
  pendiente: 'bg-secondary-200 text-secondary-700',
  enviada: 'bg-info text-white',
  en_revision: 'bg-warning text-white',
  aceptada: 'bg-success text-white',
  rechazada: 'bg-error text-white',
  vencida: 'bg-secondary-400 text-white',
}

export default function CotizacionesPage() {
  const navigate = useNavigate()
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useCotizaciones({ skip, limit, buscar: buscar || undefined, estado: estado || undefined })
  const deleteMutation = useDeleteCotizacion()

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cotización?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Cotizaciones</h1>
        <button onClick={() => navigate('/cotizaciones/nueva')} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Nueva cotización</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Buscar por número o proyecto..." value={buscar} onChange={(e) => { setBuscar(e.target.value); setSkip(0) }} className="input-field flex-1" />
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
                    <th className="text-left p-3 font-semibold text-secondary-600">Proyecto</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Estado</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Fecha</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Total</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c: Cotizacion) => (
                    <tr key={c.id} onClick={() => navigate(`/cotizaciones/${c.id}`)} className="border-t border-secondary-100 hover:bg-secondary-50 cursor-pointer">
                      <td className="p-3 font-mono text-xs text-secondary-600">{c.numero}</td>
                      <td className="p-3 text-secondary-800">{c.proyecto_nombre || '—'}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</span></td>
                      <td className="p-3 text-secondary-500">{new Date(c.fecha_emision).toLocaleDateString('es-MX')}</td>
                      <td className="p-3 text-right font-semibold text-secondary-800">${Number(c.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3"><button onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }} className="text-secondary-400 hover:text-error p-1"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-secondary-400">No hay cotizaciones</td></tr>}
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
