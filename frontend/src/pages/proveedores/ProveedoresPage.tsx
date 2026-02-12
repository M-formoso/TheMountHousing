import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useProveedores, useDeleteProveedor, useCreateProveedor } from '@/services/proveedores.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Proveedor, ProveedorCreate, TipoProveedor } from '@/types/proveedor'

const tipoLabels: Record<string, string> = { materiales: 'Materiales', servicios: 'Servicios', ambos: 'Ambos' }

export default function ProveedoresPage() {
  const [buscar, setBuscar] = useState('')
  const [tipo, setTipo] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useProveedores({ skip, limit, buscar: buscar || undefined, tipo: tipo || undefined })
  const deleteMutation = useDeleteProveedor()
  const createMutation = useCreateProveedor()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ProveedorCreate>({ razon_social: '', tipo: 'materiales', contacto_principal: '', email: '' })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const handleCreate = async () => {
    if (!form.razon_social || !form.contacto_principal || !form.email) return
    await createMutation.mutateAsync(form)
    setForm({ razon_social: '', tipo: 'materiales', contacto_principal: '', email: '' })
    setShowForm(false)
    refetch()
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Proveedores</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Nuevo</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input type="text" placeholder="Razón social *" value={form.razon_social} onChange={(e) => setForm((p) => ({ ...p, razon_social: e.target.value }))} className="input-field" />
            <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoProveedor }))} className="input-field">
              {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="text" placeholder="Contacto *" value={form.contacto_principal} onChange={(e) => setForm((p) => ({ ...p, contacto_principal: e.target.value }))} className="input-field" />
            <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary text-sm">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Buscar..." value={buscar} onChange={(e) => { setBuscar(e.target.value); setSkip(0) }} className="input-field flex-1" />
        <select value={tipo} onChange={(e) => { setTipo(e.target.value); setSkip(0) }} className="input-field w-full sm:w-48">
          <option value="">Todos los tipos</option>
          {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-secondary-600">Razón Social</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Tipo</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Contacto</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Ciudad</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Calificación</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Preferido</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p: Proveedor) => (
                    <tr key={p.id} className="border-t border-secondary-100 hover:bg-secondary-50">
                      <td className="p-3 font-medium text-secondary-800">{p.razon_social}</td>
                      <td className="p-3 text-secondary-600">{tipoLabels[p.tipo]}</td>
                      <td className="p-3 text-secondary-600">{p.contacto_principal}</td>
                      <td className="p-3 text-secondary-500">{p.ciudad || '—'}</td>
                      <td className="p-3 text-secondary-600">{p.calificacion_general.toFixed(1)} / 5</td>
                      <td className="p-3">{p.preferido ? <span className="text-xs bg-warning text-white px-2 py-0.5 rounded-full">Sí</span> : '—'}</td>
                      <td className="p-3"><button onClick={() => handleDelete(p.id)} className="text-secondary-400 hover:text-error p-1"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-secondary-400">No hay proveedores</td></tr>}
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
