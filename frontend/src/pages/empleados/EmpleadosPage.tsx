import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useEmpleados, useDeleteEmpleado, useCreateEmpleado } from '@/services/empleados.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Empleado, EmpleadoCreate, Departamento } from '@/types/empleado'

const deptLabels: Record<string, string> = {
  obra: 'Obra', administracion: 'Administración', contabilidad: 'Contabilidad',
  compras: 'Compras', ingenieria: 'Ingeniería', recursos_humanos: 'Recursos Humanos', ventas: 'Ventas',
}

export default function EmpleadosPage() {
  const navigate = useNavigate()
  const [buscar, setBuscar] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 20

  const { data, isLoading, refetch } = useEmpleados({ skip, limit, buscar: buscar || undefined, departamento: departamento || undefined })
  const deleteMutation = useDeleteEmpleado()
  const createMutation = useCreateEmpleado()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<EmpleadoCreate>({ nombre: '', apellido_paterno: '', email: '', puesto: '', departamento: 'obra' })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este empleado?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const handleCreate = async () => {
    if (!form.nombre || !form.apellido_paterno || !form.email || !form.puesto) return
    await createMutation.mutateAsync(form)
    setForm({ nombre: '', apellido_paterno: '', email: '', puesto: '', departamento: 'obra' })
    setShowForm(false)
    refetch()
  }

  const total = data?.total ?? 0
  const items = data?.items ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Empleados</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Nuevo empleado
        </button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} className="input-field" />
            <input type="text" placeholder="Apellido paterno *" value={form.apellido_paterno} onChange={(e) => setForm((p) => ({ ...p, apellido_paterno: e.target.value }))} className="input-field" />
            <input type="text" placeholder="Apellido materno" value={form.apellido_materno || ''} onChange={(e) => setForm((p) => ({ ...p, apellido_materno: e.target.value }))} className="input-field" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input-field" />
            <input type="text" placeholder="Puesto *" value={form.puesto} onChange={(e) => setForm((p) => ({ ...p, puesto: e.target.value }))} className="input-field" />
            <select value={form.departamento} onChange={(e) => setForm((p) => ({ ...p, departamento: e.target.value as Departamento }))} className="input-field">
              {Object.entries(deptLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary text-sm">Guardar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="text" placeholder="Buscar por nombre o número..." value={buscar} onChange={(e) => { setBuscar(e.target.value); setSkip(0) }} className="input-field flex-1" />
        <select value={departamento} onChange={(e) => { setDepartamento(e.target.value); setSkip(0) }} className="input-field w-full sm:w-52">
          <option value="">Todos los departamentos</option>
          {Object.entries(deptLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-secondary-600">N° Empleado</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Nombre</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Puesto</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Departamento</th>
                    <th className="text-left p-3 font-semibold text-secondary-600">Email</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((emp: Empleado) => (
                    <tr key={emp.id} onClick={() => navigate(`/empleados/${emp.id}`)} className="border-t border-secondary-100 hover:bg-secondary-50 cursor-pointer">
                      <td className="p-3 font-mono text-xs text-secondary-600">{emp.numero_empleado}</td>
                      <td className="p-3 font-medium text-secondary-800">{emp.nombre} {emp.apellido_paterno} {emp.apellido_materno || ''}</td>
                      <td className="p-3 text-secondary-600">{emp.puesto}</td>
                      <td className="p-3 text-secondary-600">{deptLabels[emp.departamento]}</td>
                      <td className="p-3 text-secondary-500">{emp.email}</td>
                      <td className="p-3">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(emp.id) }} className="text-secondary-400 hover:text-error p-1"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-secondary-400">No hay empleados</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
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
