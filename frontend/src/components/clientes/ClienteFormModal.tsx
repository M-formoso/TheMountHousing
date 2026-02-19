import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/lib/axios'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function ClienteFormModal({ onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    tipo: 'persona_fisica',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    razon_social: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    notas: '',
  })

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/api/v1/clientes', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Generar número de cliente automáticamente
    const numeroCliente = `CLI-${Date.now().toString().slice(-6)}`

    try {
      await createMutation.mutateAsync({
        numero_cliente: numeroCliente,
        tipo: formData.tipo,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno || undefined,
        apellido_materno: formData.apellido_materno || undefined,
        razon_social: formData.tipo === 'persona_moral' ? formData.razon_social : undefined,
        rfc: formData.rfc || undefined,
        email: formData.email,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        ciudad: formData.ciudad || undefined,
        estado: formData.estado || undefined,
        codigo_postal: formData.codigo_postal || undefined,
        notas: formData.notas || undefined,
      })
      onSuccess()
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { detail?: unknown } } })?.response?.data
      let errorMsg = 'Error al crear cliente'

      if (response?.detail) {
        // Si es un array de errores de validación de FastAPI
        if (Array.isArray(response.detail)) {
          const firstError = response.detail[0]
          if (firstError?.msg) {
            const field = firstError.loc?.[1] || 'campo'
            errorMsg = `${field}: ${firstError.msg}`
          }
        } else if (typeof response.detail === 'string') {
          errorMsg = response.detail
        }
      }

      setError(errorMsg)
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
            </select>
          </div>

          {formData.tipo === 'persona_fisica' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Apellido Paterno</label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Apellido Materno</label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nombre de Contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">RFC</label>
              <input
                type="text"
                name="rfc"
                value={formData.rfc}
                onChange={handleChange}
                className="input-field"
                maxLength={13}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Estado</label>
              <input
                type="text"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">C.P.</label>
              <input
                type="text"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                className="input-field"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
