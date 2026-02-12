import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCuentasPagar, useCreateCuentaPagar } from '@/services/finanzas.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { CuentaPorPagar, CuentaPagearCreate, PagoCreate } from '@/types/finanzas'

const estadoColors: Record<string, string> = { pendiente: 'bg-secondary-200 text-secondary-700', parcial: 'bg-warning text-white', pagada: 'bg-success text-white', vencida: 'bg-error text-white' }
const estadoLabels: Record<string, string> = { pendiente: 'Pendiente', parcial: 'Parcial', pagada: 'Pagada', vencida: 'Vencida' }

export default function CuentasPagearPage() {
  const [estado, setEstado] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useCuentasPagar({ skip, limit, estado: estado || undefined })
  const createMutation = useCreateCuentaPagar()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CuentaPagearCreate>({ concepto: '', monto_total: 0, fecha_emision: new Date().toISOString().split('T')[0] })

  const [pagandoCuenta, setPagandoCuenta] = useState<string | null>(null)
  const [pagoForm, setPagoForm] = useState<PagoCreate>({ monto: 0, fecha: new Date().toISOString().split('T')[0] })

  const handleCreate = async () => {
    if (!form.concepto || form.monto_total <= 0) return
    await createMutation.mutateAsync(form)
    setForm({ concepto: '', monto_total: 0, fecha_emision: new Date().toISOString().split('T')[0] })
    setShowForm(false)
    refetch()
  }

  const handlePago = async (cuentaId: string) => {
    if (pagoForm.monto <= 0) return
    const { default: api } = await import('@/lib/axios')
    await api.post(`/api/v1/finanzas/pagar/${cuentaId}/pagos`, pagoForm)
    setPagandoCuenta(null)
    setPagoForm({ monto: 0, fecha: new Date().toISOString().split('T')[0] })
    refetch()
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Cuentas por Pagar</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Nueva cuenta</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Concepto *" value={form.concepto} onChange={(e) => setForm((p) => ({ ...p, concepto: e.target.value }))} className="input-field" />
            <input type="number" placeholder="Monto total *" value={form.monto_total || ''} onChange={(e) => setForm((p) => ({ ...p, monto_total: Number(e.target.value) }))} className="input-field" />
            <input type="date" value={form.fecha_emision} onChange={(e) => setForm((p) => ({ ...p, fecha_emision: e.target.value }))} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary text-sm">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </div>
      )}

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
                    <th className="text-left p-3 font-semibold text-secondary-600">Concepto</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Fecha</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Prioridad</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Estado</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Total</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Saldo</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c: CuentaPorPagar) => (
                    <>
                      <tr key={c.id} className="border-t border-secondary-100">
                        <td className="p-3 font-medium text-secondary-800">{c.concepto}</td>
                        <td className="p-3 text-secondary-500">{new Date(c.fecha_emision).toLocaleDateString('es-MX')}</td>
                        <td className="p-3 capitalize text-secondary-600">{c.prioridad}</td>
                        <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</span></td>
                        <td className="p-3 text-right text-secondary-700">${Number(c.monto_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right font-semibold text-error">${Number(c.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3">{c.estado !== 'pagada' && <button onClick={() => { setPagandoCuenta(c.id); setPagoForm({ monto: c.saldo, fecha: new Date().toISOString().split('T')[0] }) }} className="text-xs btn-outline py-0.5 px-2">Pagar</button>}</td>
                      </tr>
                      {pagandoCuenta === c.id && (
                        <tr key={`pago-${c.id}`} className="bg-secondary-50">
                          <td colSpan={7} className="p-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <input type="number" value={pagoForm.monto || ''} onChange={(e) => setPagoForm((p) => ({ ...p, monto: Number(e.target.value) }))} className="input-field w-36" placeholder="Monto" />
                              <input type="date" value={pagoForm.fecha} onChange={(e) => setPagoForm((p) => ({ ...p, fecha: e.target.value }))} className="input-field w-44" />
                              <button onClick={() => handlePago(c.id)} className="btn-primary text-sm">Confirmar</button>
                              <button onClick={() => setPagandoCuenta(null)} className="btn-ghost text-sm">Cancelar</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-secondary-400">No hay cuentas por pagar</td></tr>}
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
