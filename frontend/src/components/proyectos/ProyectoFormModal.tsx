import { useState } from 'react'
import { useCreateProyecto } from '@/services/proyectos.service'
import { useClientes } from '@/services/clientes.service'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function ProyectoFormModal({ onClose, onSuccess }: Props) {
  const createMutation = useCreateProyecto()
  const { data: clientes } = useClientes({ limit: 100 })
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'residencial' as const,
    cliente_id: '',
    direccion: '',
    ciudad: '',
    estado_geo: '',
    codigo_postal: '',
    fecha_inicio: '',
    fecha_fin_estimada: '',
    presupuesto_total: 0,
    area_construccion_m2: '',
    notas: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'presupuesto_total' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createMutation.mutateAsync({
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        tipo: formData.tipo,
        cliente_id: formData.cliente_id,
        direccion: formData.direccion || undefined,
        ciudad: formData.ciudad || undefined,
        estado_geo: formData.estado_geo || undefined,
        codigo_postal: formData.codigo_postal || undefined,
        fecha_inicio: formData.fecha_inicio || undefined,
        fecha_fin_estimada: formData.fecha_fin_estimada || undefined,
        presupuesto_total: formData.presupuesto_total,
        area_construccion_m2: formData.area_construccion_m2 ? Number(formData.area_construccion_m2) : undefined,
        notas: formData.notas || undefined,
      })
      onSuccess()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || 'Error al crear proyecto')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-800">Nuevo Proyecto</h2>
          <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Tipo de obra</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field">
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
                <option value="remodelacion">Remodelación</option>
                <option value="obra_civil">Obra Civil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Cliente <span className="text-red-500">*</span></label>
              <select name="cliente_id" value={formData.cliente_id} onChange={handleChange} className="input-field" required>
                <option value="">Seleccionar cliente</option>
                {clientes?.items.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Ciudad</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Estado</label>
              <input type="text" name="estado_geo" value={formData.estado_geo} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha Inicio</label>
              <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha Fin Estimada</label>
              <input type="date" name="fecha_fin_estimada" value={formData.fecha_fin_estimada} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Presupuesto Total (MXN)</label>
              <input type="number" name="presupuesto_total" value={formData.presupuesto_total} onChange={handleChange} min={0} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Área (m²)</label>
              <input type="number" name="area_construccion_m2" value={formData.area_construccion_m2} onChange={handleChange} min={0} className="input-field" />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
