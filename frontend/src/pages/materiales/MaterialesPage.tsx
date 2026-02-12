import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useMateriales, useDeleteMaterial, useCreateMaterial } from '@/services/materiales.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Material, MaterialCreate, CategoriaMaterial, UnidadMedida } from '@/types/material'

const catLabels: Record<string, string> = {
  cemento: 'Cemento', arena: 'Arena', varilla: 'Varilla', block: 'Block', ladrillo: 'Ladrillo',
  acero: 'Acero', madera: 'Madera', tuberia: 'Tubería', cable: 'Cable',
  acabados: 'Acabados', pintura: 'Pintura', otro: 'Otro',
}

export default function MaterialesPage() {
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useMateriales({ skip, limit, buscar: buscar || undefined, categoria: categoria || undefined })
  const deleteMutation = useDeleteMaterial()
  const createMutation = useCreateMaterial()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<MaterialCreate>({ nombre: '', categoria: 'otro', unidad_medida: 'pieza' })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este material?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const handleCreate = async () => {
    if (!form.nombre) return
    await createMutation.mutateAsync(form)
    setForm({ nombre: '', categoria: 'otro', unidad_medida: 'pieza' })
    setShowForm(false)
    refetch()
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Materiales</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Nuevo material</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} className="input-field" />
            <select value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value as CategoriaMaterial }))} className="input-field">
              {Object.entries(catLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={form.unidad_medida} onChange={(e) => setForm((p) => ({ ...p, unidad_medida: e.target.value as UnidadMedida }))} className="input-field">
              {['m2','m3','kg','ton','pieza','metro','caja','litro','otro'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary text-sm">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Buscar por nombre o código..." value={buscar} onChange={(e) => { setBuscar(e.target.value); setSkip(0) }} className="input-field flex-1" />
        <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setSkip(0) }} className="input-field w-full sm:w-52">
          <option value="">Todas las categorías</option>
          {Object.entries(catLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-secondary-600">Código</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Nombre</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Categoría</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Unidad</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Stock</th>
                    <th className="text-right p-3 font-semibold text-secondary-600">Precio</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m: Material) => {
                    const stockBajo = m.stock_actual <= m.stock_minimo
                    return (
                      <tr key={m.id} className="border-t border-secondary-100 hover:bg-secondary-50">
                        <td className="p-3 font-mono text-xs text-secondary-600">{m.codigo}</td>
                        <td className="p-3 font-medium text-secondary-800">{m.nombre}</td>
                        <td className="p-3 text-secondary-600">{catLabels[m.categoria]}</td>
                        <td className="p-3 text-secondary-600">{m.unidad_medida}</td>
                        <td className={`p-3 text-right font-medium ${stockBajo ? 'text-error' : 'text-secondary-700'}`}>{m.stock_actual}</td>
                        <td className="p-3 text-right text-secondary-700">${Number(m.precio_unitario_actual).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3"><button onClick={() => handleDelete(m.id)} className="text-secondary-400 hover:text-error p-1"><Trash2 size={15} /></button></td>
                      </tr>
                    )
                  })}
                  {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-secondary-400">No hay materiales</td></tr>}
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
