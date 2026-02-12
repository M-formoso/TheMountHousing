import { useState } from 'react'
import { ChevronDown, Home, DollarSign, Maximize2, Users } from 'lucide-react'
import type { Unidad } from '@/services/unidades.service'

interface UnidadCardProps {
  unidad: Unidad
  onAsignarCliente?: (unidadId: string) => void
  onLiberar?: (unidadId: string) => void
  onEdit?: (unidad: Unidad) => void
  onChangeStatus?: (unidadId: string, newStatus: string) => void
  canManage?: boolean
}

export default function UnidadCard({ unidad, onAsignarCliente, onLiberar, onEdit, onChangeStatus, canManage = false }: UnidadCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const estadoConfig = {
    disponible: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
      label: 'Disponible',
    },
    vendida: {
      dot: 'bg-rose-500',
      text: 'text-rose-700',
      label: 'Vendida',
    },
    reservada: {
      dot: 'bg-amber-500',
      text: 'text-amber-700',
      label: 'Reservada',
    },
    en_construccion: {
      dot: 'bg-blue-500',
      text: 'text-blue-700',
      label: 'En Construcción',
    },
  }

  const config = estadoConfig[unidad.estado] || estadoConfig.disponible

  const estadosDisponibles = [
    { value: 'disponible', label: 'Disponible', dotClass: 'bg-emerald-500' },
    { value: 'reservada', label: 'Reservada', dotClass: 'bg-amber-500' },
    { value: 'vendida', label: 'Vendida', dotClass: 'bg-rose-500' },
    { value: 'en_construccion', label: 'En Construcción', dotClass: 'bg-blue-500' },
  ]

  const handleChangeStatus = (newStatus: string) => {
    if (onChangeStatus) {
      onChangeStatus(unidad.id, newStatus)
    }
    setShowStatusMenu(false)
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-secondary-200 flex flex-col h-full overflow-hidden">
      {/* Header con gradiente sutil */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-5 border-b border-secondary-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Home className="text-primary-600" size={20} />
            <h3 className="text-xl font-bold text-secondary-900">{unidad.numero_unidad}</h3>
          </div>

          {/* Estado con menú dropdown */}
          <div className="relative">
            {canManage ? (
              <>
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.text} bg-white border-2 border-current hover:bg-secondary-50 transition-colors`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                  {config.label}
                  <ChevronDown size={12} />
                </button>

                {/* Dropdown de estados */}
                {showStatusMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-20 min-w-[160px]">
                      {estadosDisponibles.map((estado) => (
                        <button
                          key={estado.value}
                          onClick={() => handleChangeStatus(estado.value)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary-50 flex items-center gap-2 ${
                            unidad.estado === estado.value ? 'bg-secondary-50 font-semibold' : ''
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${estado.dotClass}`}></span>
                          {estado.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.text} bg-white border-2 border-current`}>
                <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
                {config.label}
              </span>
            )}
          </div>
        </div>

        {/* Tipo de casa */}
        {unidad.tipo_casa && (
          <p className="text-sm text-secondary-600">
            {unidad.tipo_casa}
          </p>
        )}
      </div>

      {/* Información principal */}
      <div className="p-5 flex-grow">
        <div className="space-y-3">
          {/* Superficie */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Maximize2 className="text-blue-600" size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-secondary-500">Superficie</p>
              <p className="font-semibold text-secondary-900">{unidad.metros_cuadrados} m²</p>
            </div>
          </div>

          {/* Precio por m² */}
          {unidad.precio_por_m2 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="text-green-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-secondary-500">Precio/m²</p>
                <p className="font-semibold text-secondary-900">{formatPrice(unidad.precio_por_m2)}</p>
              </div>
            </div>
          )}

          {/* Precio total */}
          {unidad.precio_total && (
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3 border border-primary-200">
              <p className="text-xs text-primary-700 mb-1">Precio Total</p>
              <p className="text-xl font-bold text-primary-800">{formatPrice(unidad.precio_total)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Características adicionales (collapsible) */}
      {(unidad.habitaciones || unidad.banos || unidad.estacionamientos) && (
        <div className="px-5 pb-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <ChevronDown className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`} size={14} />
            Características
          </button>
          {showDetails && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {unidad.habitaciones && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-secondary-400">🛏️</span>
                  <span className="text-secondary-700">{unidad.habitaciones} hab.</span>
                </div>
              )}
              {unidad.banos && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-secondary-400">🚿</span>
                  <span className="text-secondary-700">{unidad.banos} baños</span>
                </div>
              )}
              {unidad.estacionamientos && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-secondary-400">🚗</span>
                  <span className="text-secondary-700">{unidad.estacionamientos} est.</span>
                </div>
              )}
              {unidad.nivel && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-secondary-400">📍</span>
                  <span className="text-secondary-700">{unidad.nivel}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Acciones (solo para administradores) */}
      {canManage && (
        <div className="p-5 pt-3 border-t border-secondary-200 mt-auto bg-secondary-50/50">
          <div className="flex gap-2">
            {unidad.estado === 'disponible' && onAsignarCliente && (
              <button
                onClick={() => onAsignarCliente(unidad.id)}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Users size={14} />
                Asignar Cliente
              </button>
            )}
            {unidad.estado === 'vendida' && onLiberar && (
              <button
                onClick={() => onLiberar(unidad.id)}
                className="flex-1 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 text-xs font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Liberar
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(unidad)}
                className="bg-secondary-200 hover:bg-secondary-300 text-secondary-700 text-xs font-medium py-2.5 px-3 rounded-lg transition-colors"
              >
                ✏️
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
