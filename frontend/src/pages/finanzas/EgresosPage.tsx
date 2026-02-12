import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useEgresos, useCreateEgreso, useDeleteEgreso } from '@/services/finanzas.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Egreso, EgresoCreate, CategoriaEgreso } from '@/types/finanzas'

const catLabels: Record<string, string> = {
  materiales: 'Materiales', mano_obra: 'Mano de Obra', subcontratistas: 'Subcontratistas',
  maquinaria: 'Maquinaria', gastos_generales: 'Gastos Generales', impuestos: 'Impuestos', otros: 'Otros',
}

const pagoColors: Record<string, string> = { pendiente: 'bg-secondary-200 text-secondary-700', pagado: 'bg-success text-white', parcial: 'bg-warning text-white' }
const pagoLabels: Record<string, string> = { pendiente: 'Pendiente', pagado: 'Pagado', parcial: 'Parcial' }

export default function EgresosPage() {
  const [categoria, setCategoria] = useState('')
  const [estadoPago, setEstadoPago] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useEgresos({ skip, limit, categoria: categoria || undefined, estado_pago: estadoPago || undefined })
  const createMutation = useCreateEgreso()
  const deleteMutation = useDeleteEgreso()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<EgresoCreate>({ categoria: 'otros', concepto: '', monto: 0, fecha: new Date().toISOString().split('T')[0] })

  const handleCreate = async () => {
    if (!form.concepto || form.monto <= 0) return
    await createMutation.mutateAsync(form)
    setForm({ categoria: 'otros', concepto: '', monto: 0, fecha: new Date().toISOString().split('T')[0] })
    setShowForm(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este egreso?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Egresos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Nuevo egreso</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value as CategoriaEgreso }))} className="input-field">
              {Object.entries(catLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="text" placeholder="Concepto *" value={form.concepto} onChange={(e) => setForm((p) => ({ ...p, concepto: e.target.value }))} className="input-field" />
            <input type="number" placeholder="Monto *" value={form.monto || ''} onChange={(e) => setForm((p) => ({ ...p, monto: Number(e.target.value) }))} className="input-field" />
            <input type="date" value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary text-sm">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setSkip(0) }} className="input-field w-full sm:w-52">
          <option value="">Todas las categorías</option>
          {Object.entries(catLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={estadoPago} onChange={(e) => { setEstadoPago(e.target.value); setSkip(0) }} className="input-field w-full sm:w-44">
          <option value="">Todo estado</option>
          {Object.entries(pagoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-secondary-600">Categoría</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Concepto</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Fecha</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Estado pago</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Monto</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((eg: Egreso) => (
                    <tr key={eg.id} className="border-t border-secondary-100">
                      <td className="p-3 text-secondary-600">{catLabels[eg.categoria]}</td>
                      <td className="p-3 font-medium text-secondary-800">{eg.concepto}</td>
                      <td className="p-3 text-secondary-500">{new Date(eg.fecha).toLocaleDateString('es-MX')}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${pagoColors[eg.estado_pago]}`}>{pagoLabels[eg.estado_pago]}</span></td>
                      <td className="p-3 text-right font-semibold text-error">${Number(eg.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3"><button onClick={() => handleDelete(eg.id)} className="text-secondary-400 hover:text-error p-1"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-secondary-400">No hay egresos</td></tr>}
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
