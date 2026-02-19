import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { useNavigate } from 'react-router-dom'
import {
  Home, Ruler, DollarSign, Tag, Calendar,
  CheckCircle, Clock, Building2, Loader2, Image as ImageIcon,
  Phone, Mail, LogOut,
} from 'lucide-react'
import api from '@/lib/axios'

interface Imagen {
  id: string
  url: string
  titulo?: string
  tipo: string
}

interface Etapa {
  id: string
  nombre: string
  orden: number
  completada: boolean
  porcentaje: number
}

interface Cliente {
  id: string
  nombre: string
  apellido_paterno: string
  email?: string
}

interface UnidadDetalle {
  id: string
  numero_unidad: string
  nombre?: string
  tipo_casa?: string
  metros_cuadrados: number
  precio_por_m2?: number
  precio_total?: number
  estado: string
  avance_porcentaje: number
  etapa_actual?: string
  descripcion?: string
  render_url?: string
  plano_url?: string
  fecha_venta?: string
  cliente?: Cliente
  imagenes: Imagen[]
  etapas: Etapa[]
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function MiUnidadPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } catch {
      // Ignorar error
    }
    logout()
    navigate('/login')
  }

  // Primero obtener la lista de unidades (el backend filtra para clientes)
  const { data: unidadesList = [] } = useQuery<{ id: string }[]>({
    queryKey: ['mi-unidad-list'],
    queryFn: async () => {
      const res = await api.get('/api/v1/unidades')
      return res.data
    },
  })

  const unidadId = unidadesList[0]?.id

  // Luego obtener el detalle completo con etapas e imágenes
  const { data: unidad, isLoading } = useQuery<UnidadDetalle>({
    queryKey: ['mi-unidad', unidadId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/unidades/${unidadId}`)
      return res.data
    },
    enabled: !!unidadId,
  })

  if (isLoading || (unidadId && !unidad)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <p className="text-secondary-500">Cargando tu unidad...</p>
        </div>
      </div>
    )
  }

  if (!unidadId || !unidad) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Building2 className="text-secondary-300 mx-auto mb-4" size={64} />
          <h2 className="text-xl font-semibold text-secondary-700 mb-2">Sin unidad asignada</h2>
          <p className="text-secondary-500">Aún no tienes una unidad asignada a tu cuenta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl font-bold">The Mount Housing</h1>
                <p className="text-gray-400 text-sm">Portal del Propietario</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Bienvenido</p>
                <p className="font-medium">{user?.nombre} {user?.apellido_paterno}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Título de la unidad */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Home className="text-primary-600" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-secondary-800">
                {unidad.numero_unidad}
                {unidad.nombre && <span className="text-primary-600 ml-2">· {unidad.nombre}</span>}
              </h2>
              <p className="text-secondary-500">{unidad.tipo_casa || 'Unidad Estándar'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Render / Imagen principal */}
            <div className="card overflow-hidden">
              <div className="h-72 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                {unidad.render_url ? (
                  <img src={unidad.render_url} alt={unidad.numero_unidad} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Building2 className="mx-auto text-primary-300 mb-2" size={80} />
                    <p className="text-primary-400">Imagen próximamente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progreso de Obra */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-800 flex items-center gap-2">
                  <CheckCircle className="text-primary-600" size={20} />
                  Avance de Construcción
                </h3>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary-600">{unidad.avance_porcentaje}%</span>
                  <p className="text-xs text-secondary-400">Completado</p>
                </div>
              </div>

              {/* Barra de progreso general */}
              <div className="mb-6">
                <div className="h-4 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${unidad.avance_porcentaje}%` }}
                  />
                </div>
              </div>

              {/* Etapas */}
              <div className="space-y-3">
                {(unidad.etapas || []).map((etapa) => (
                  <div key={etapa.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      etapa.completada
                        ? 'bg-green-500 text-white'
                        : etapa.porcentaje > 0
                          ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                          : 'bg-secondary-100 text-secondary-400'
                    }`}>
                      {etapa.completada ? (
                        <CheckCircle size={20} />
                      ) : (
                        <span className="text-sm font-bold">{etapa.orden}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${etapa.completada ? 'text-green-700' : 'text-secondary-700'}`}>
                          {etapa.nombre}
                        </span>
                        <span className={`text-sm font-semibold ${
                          etapa.completada ? 'text-green-600' : 'text-secondary-500'
                        }`}>
                          {etapa.porcentaje}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            etapa.completada ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${etapa.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Galería de imágenes */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                <ImageIcon className="text-primary-600" size={20} />
                Galería de Avance
              </h3>
              {(!unidad.imagenes || unidad.imagenes.length === 0) ? (
                <div className="text-center py-12 bg-secondary-50 rounded-lg">
                  <ImageIcon className="mx-auto text-secondary-300 mb-2" size={48} />
                  <p className="text-secondary-400">Próximamente fotos del avance de obra</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {unidad.imagenes.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt={img.titulo || 'Avance de obra'}
                        className="w-full h-40 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      />
                      {img.titulo && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                          <p className="text-white text-xs truncate">{img.titulo}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Información de la unidad */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Detalles de tu Propiedad</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-500 flex items-center gap-2">
                    <Ruler size={18} />
                    Superficie
                  </span>
                  <span className="font-bold text-secondary-800">{unidad.metros_cuadrados} m²</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-500 flex items-center gap-2">
                    <Tag size={18} />
                    Precio por m²
                  </span>
                  <span className="font-bold text-secondary-800">{formatCurrency(unidad.precio_por_m2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <span className="text-primary-700 flex items-center gap-2 font-medium">
                    <DollarSign size={18} />
                    Valor Total
                  </span>
                  <span className="font-bold text-xl text-primary-600">{formatCurrency(unidad.precio_total)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-500 flex items-center gap-2">
                    <Calendar size={18} />
                    Fecha de Compra
                  </span>
                  <span className="font-medium text-secondary-800">{formatDate(unidad.fecha_venta)}</span>
                </div>
              </div>
            </div>

            {/* Estado actual */}
            <div className="card p-6 bg-gradient-to-br from-green-50 to-white">
              <h3 className="text-lg font-semibold text-secondary-800 mb-3">Estado Actual</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-green-700 capitalize">
                    {unidad.etapa_actual?.replace(/_/g, ' ') || 'En proceso'}
                  </p>
                  <p className="text-sm text-secondary-500">Etapa de construcción</p>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">¿Tienes dudas?</h3>
              <p className="text-secondary-500 text-sm mb-4">
                Contáctanos para cualquier consulta sobre tu propiedad.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:info@themounthousing.com"
                  className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <Mail size={18} className="text-primary-600" />
                  <span className="text-sm text-secondary-700">info@themounthousing.com</span>
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <Phone size={18} className="text-primary-600" />
                  <span className="text-sm text-secondary-700">+1 (234) 567-890</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-400 text-sm">© 2025 The Mount Housing. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
