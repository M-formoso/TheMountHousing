import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSubcontratistas, useDeleteSubcontratista, useCreateSubcontratista } from '@/services/subcontratistas.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Subcontratista, SubcontratistaCreate, Especialidad } from '@/types/subcontratista'

const espLabels: Record<string, string> = {
  plomeria: 'Plomería', electricidad: 'Electricidad', acabados: 'Acabados',
  carpinteria: 'Carpintería', albanileo: 'Albañilería', pintura: 'Pintura',
  jardineria: 'Jardinería', vidrieria: 'Vidriería', soldadura: 'Soldadura', otro: 'Otro',
}

export default function SubcontratistasPage() {
  const [buscar, setBuscar] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useSubcontratistas({ skip, limit, buscar: buscar || undefined, especialidad: especialidad || undefined })
  const deleteMutation = useDeleteSubcontratista()
  const createMutation = useCreateSubcontratista()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SubcontratistaCreate>({ razon_social: '', contacto_principal: '', email: '', especialidad: 'otro' })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este subcontratista?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const handleCreate = async () => {
    if (!form.razon_social || !form.contacto_principal || !form.email) return
    await createMutation.mutateAsync(form)
    setForm({ razon_social: '', contacto_principal: '', email: '', especialidad: 'otro' })
    setShowForm(false)
    refetch()
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Subcontratistas</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Nuevo</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Razón social *" value={form.razon_social} onChange={(e) => setForm((p) => ({ ...p, razon_social: e.target.value }))} className="input-field" />
            <input type="text" placeholder="Contacto principal *" value={form.contacto_principal} onChange={(e) => setForm((p) => ({ ...p, contacto_principal: e.target.value }))} className="input-field" />
            <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field" />
          </div>
          <select value={form.especialidad} onChange={(e) => setForm((p) => ({ ...p, especialidad: e.target.value as Especialidad }))} className="input-field w-full sm:w-64">
            {Object.entries(espLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary text-sm">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Buscar..." value={buscar} onChange={(e) => { setBuscar(e.target.value); setSkip(0) }} className="input-field flex-1" />
        <select value={especialidad} onChange={(e) => { setEspecialidad(e.target.value); setSkip(0) }} className="input-field w-full sm:w-52">
          <option value="">Todas las especialidades</option>
          {Object.entries(espLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
                    <th className="text-left p-3 font-semibold text-secondary-600">Especialidad</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Contacto</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Calificación</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Seguro</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s: Subcontratista) => (
                    <tr key={s.id} className="border-t border-secondary-100 hover:bg-secondary-50">
                      <td className="p-3">
                        <p className="font-medium text-secondary-800">{s.razon_social}</p>
                        {s.en_lista_negra && <span className="text-xs text-error">Lista negra</span>}
                      </td>
                      <td className="p-3 text-secondary-600">{espLabels[s.especialidad]}</td>
                      <td className="p-3 text-secondary-600">{s.contacto_principal}</td>
                      <td className="p-3 text-secondary-600">{'★'.repeat(s.calificacion)}{'☆'.repeat(5 - s.calificacion)}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.seguro_responsabilidad_civil ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.seguro_responsabilidad_civil ? 'Sí' : 'No'}</span></td>
                      <td className="p-3"><button onClick={() => handleDelete(s.id)} className="text-secondary-400 hover:text-error p-1"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-secondary-400">No hay subcontratistas</td></tr>}
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
