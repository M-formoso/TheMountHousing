import { useState, useEffect } from 'react'
import api from '@/lib/axios'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
}

interface AsignarClienteModalProps {
  unidadId: string
  onClose: () => void
  onConfirm: (clienteId: string) => void
  isLoading: boolean
}

export default function AsignarClienteModal({ unidadId, onClose, onConfirm, isLoading }: AsignarClienteModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('')
  const [buscar, setBuscar] = useState('')
  const [loadingClientes, setLoadingClientes] = useState(true)

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get('/api/v1/clientes', {
          params: { limit: 100 },
        })
        // La respuesta puede ser un objeto con items o directamente un array
        const data = response.data
        if (Array.isArray(data)) {
          setClientes(data)
        } else if (data.items && Array.isArray(data.items)) {
          setClientes(data.items)
        } else {
          setClientes([])
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error)
        setClientes([])
      } finally {
        setLoadingClientes(false)
      }
    }
    fetchClientes()
  }, [])

  const clientesFiltrados = Array.isArray(clientes) ? clientes.filter((c) =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    c.email.toLowerCase().includes(buscar.toLowerCase())
  ) : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (clienteSeleccionado) {
      onConfirm(clienteSeleccionado)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-900">Asignar Cliente a Unidad</h2>
          <p className="text-sm text-secondary-600 mt-1">Selecciona el cliente propietario</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {/* Buscador */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar cliente por nombre o email..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Lista de clientes */}
            {loadingClientes ? (
              <div className="text-center py-8 text-secondary-500">Cargando clientes...</div>
            ) : clientesFiltrados.length > 0 ? (
              <div className="space-y-2">
                {clientesFiltrados.map((cliente) => (
                  <label
                    key={cliente.id}
                    className={`block p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      clienteSeleccionado === cliente.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cliente"
                      value={cliente.id}
                      checked={clienteSeleccionado === cliente.id}
                      onChange={(e) => setClienteSeleccionado(e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-medium text-secondary-900">{cliente.nombre}</div>
                    <div className="text-sm text-secondary-600">{cliente.email}</div>
                    {cliente.telefono && (
                      <div className="text-sm text-secondary-500">{cliente.telefono}</div>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary-500">
                No se encontraron clientes
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-secondary-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!clienteSeleccionado || isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
