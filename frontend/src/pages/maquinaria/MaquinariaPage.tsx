import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useMaquinarias, useDeleteMaquinaria, useCreateMaquinaria } from '@/services/maquinaria.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Maquinaria, MaquinariaCreate, TipoMaquinaria, TipoPropiedad } from '@/types/maquinaria'

const tipoLabels: Record<string, string> = {
  excavadora: 'Excavadora', retroexcavadora: 'Retroexcavadora', camion: 'Camión',
  revolvedora: 'Revolvedora', gru: 'Grúa', tractor: 'Tractor',
  compactador: 'Compactador', herramienta: 'Herramienta', otro: 'Otro',
}

const estadoColors: Record<string, string> = {
  operativa: 'bg-green-100 text-green-700', mantenimiento: 'bg-warning text-white',
  descompuesta: 'bg-error text-white', baja: 'bg-secondary-400 text-white',
}

const estadoLabels: Record<string, string> = { operativa: 'Operativa', mantenimiento: 'Mantenimiento', descompuesta: 'Descompuesta', baja: 'Baja' }

export default function MaquinariaPage() {
  const [buscar, setBuscar] = useState('')
  const [tipo, setTipo] = useState('')
  const [estado, setEstado] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useMaquinarias({ skip, limit, buscar: buscar || undefined, tipo: tipo || undefined, estado: estado || undefined })
  const deleteMutation = useDeleteMaquinaria()
  const createMutation = useCreateMaquinaria()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<MaquinariaCreate>({ nombre: '', tipo: 'otro', tipo_propiedad: 'propia' })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta maquinaria?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const handleCreate = async () => {
    if (!form.nombre) return
    await createMutation.mutateAsync(form)
    setForm({ nombre: '', tipo: 'otro', tipo_propiedad: 'propia' })
    setShowForm(false)
    refetch()
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Maquinaria</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Nueva maquinaria</button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} className="input-field" />
            <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoMaquinaria }))} className="input-field">
              {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={form.tipo_propiedad} onChange={(e) => setForm((p) => ({ ...p, tipo_propiedad: e.target.value as TipoPropiedad }))} className="input-field">
              <option value="propia">Propia</option><option value="rentada">Rentada</option><option value="subcontratista">Subcontratista</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary text-sm">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Buscar por nombre, código o placas..." value={buscar} onChange={(e) => { setBuscar(e.target.value); setSkip(0) }} className="input-field flex-1" />
        <select value={tipo} onChange={(e) => { setTipo(e.target.value); setSkip(0) }} className="input-field w-full sm:w-48">
          <option value="">Todos los tipos</option>
          {Object.entries(tipoLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={estado} onChange={(e) => { setEstado(e.target.value); setSkip(0) }} className="input-field w-full sm:w-44">
          <option value="">Todos estados</option>
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
                    <th className="text-left p-3 font-semibold text-secondary-600">Código</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Nombre</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Tipo</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Marca / Modelo</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Estado</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Horometro</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m: Maquinaria) => (
                    <tr key={m.id} className="border-t border-secondary-100 hover:bg-secondary-50">
                      <td className="p-3 font-mono text-xs text-secondary-600">{m.codigo}</td>
                      <td className="p-3 font-medium text-secondary-800">{m.nombre}</td>
                      <td className="p-3 text-secondary-600">{tipoLabels[m.tipo]}</td>
                      <td className="p-3 text-secondary-500">{[m.marca, m.modelo].filter(Boolean).join(' ') || '—'}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${estadoColors[m.estado]}`}>{estadoLabels[m.estado]}</span></td>
                      <td className="p-3 text-secondary-600">{m.horometro_actual} h</td>
                      <td className="p-3"><button onClick={() => handleDelete(m.id)} className="text-secondary-400 hover:text-error p-1"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-secondary-400">No hay maquinaria registrada</td></tr>}
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
