import { useCreateCliente } from '@/services/clientes.service'
import { useState } from 'react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function ClienteFormModal({ onClose, onSuccess }: Props) {
  const createMutation = useCreateCliente()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    tipo: 'persona_fisica' as const,
    nombre: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado_geo: '',
    codigo_postal: '',
    representante_legal: '',
    giro_empresarial: '',
    notas: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createMutation.mutateAsync({
        tipo: formData.tipo,
        nombre: formData.nombre,
        rfc: formData.rfc || undefined,
        email: formData.email,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        ciudad: formData.ciudad || undefined,
        estado_geo: formData.estado_geo || undefined,
        codigo_postal: formData.codigo_postal || undefined,
        representante_legal: formData.tipo === 'persona_moral' ? formData.representante_legal : undefined,
        giro_empresarial: formData.tipo === 'persona_moral' ? formData.giro_empresarial : undefined,
        notas: formData.notas || undefined,
      })
      onSuccess()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || 'Error al crear cliente')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header modal */}
        <div className="flex items-center justify-between p-5 border-b border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-800">Nuevo Cliente</h2>
          <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600">✕</button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Tipo de cliente</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field">
              <option value="persona_fisica">Persona Física</option>
              <option value="persona_moral">Persona Moral</option>
              <option value="gobierno">Gobierno</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input-field" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">RFC</label>
              <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} className="input-field" maxLength={13} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="input-field" />
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

          {formData.tipo === 'persona_moral' && (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Representante Legal</label>
                <input type="text" name="representante_legal" value={formData.representante_legal} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Giro Empresarial</label>
                <input type="text" name="giro_empresarial" value={formData.giro_empresarial} onChange={handleChange} className="input-field" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Notas</label>
            <textarea name="notas" value={formData.notas} onChange={handleChange} rows={2} className="input-field resize-none" />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
