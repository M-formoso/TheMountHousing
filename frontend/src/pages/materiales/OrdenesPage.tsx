import { useState } from 'react'
import { useOrdenesCompra } from '@/services/materiales.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { OrdenCompra } from '@/types/material'

const estadoLabels: Record<string, string> = { pendiente: 'Pendiente', confirmada: 'Confirmada', recibida: 'Recibida', cancelada: 'Cancelada' }
const estadoColors: Record<string, string> = { pendiente: 'bg-secondary-200 text-secondary-700', confirmada: 'bg-warning text-white', recibida: 'bg-success text-white', cancelada: 'bg-error text-white' }

export default function OrdenesPage() {
  const [estado, setEstado] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading } = useOrdenesCompra({ skip, limit, estado: estado || undefined })
  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Órdenes de Compra</h1>
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
                    <th className="text-left p-3 font-semibold text-secondary-600">Estado</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Items</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Subtotal</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">IVA</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((o: OrdenCompra) => (
                    <tr key={o.id} className="border-t border-secondary-100 hover:bg-secondary-50">
                      <td className="p-3 font-mono text-xs text-secondary-600">{o.numero}</td>
                      <td className="p-3 text-secondary-500">{new Date(o.fecha_orden).toLocaleDateString('es-MX')}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${estadoColors[o.estado]}`}>{estadoLabels[o.estado]}</span></td>
                      <td className="p-3 text-secondary-500">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                      <td className="p-3 text-right text-secondary-600">${Number(o.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right text-secondary-600">${Number(o.iva).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right font-semibold text-secondary-800">${Number(o.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-secondary-400">No hay órdenes de compra</td></tr>}
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
