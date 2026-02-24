import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Home, Ruler, DollarSign, Tag, User,
  Image as ImageIcon, Plus, Trash2, Check, Save, X,
  CheckCircle, Clock, Building2, Loader2, Copy,
  Calendar, Edit2, Eye, FileText, Pencil, ChevronDown, ChevronUp,
  Upload, Camera, Wallet, Hammer, Package, TrendingUp,
} from 'lucide-react'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface Cliente {
  id: string
  nombre: string
  apellido_paterno: string
  email?: string
}

interface Imagen {
  id: string
  url: string
  titulo?: string
  descripcion?: string
  tipo: string
  orden: number
  created_at: string
}

interface Etapa {
  id: string
  nombre: string
  descripcion?: string
  orden: number
  completada: boolean
  porcentaje: number
  fecha_inicio?: string
  fecha_fin?: string
  notas?: string
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
  caracteristicas?: string
  habitaciones?: number
  banos?: number
  estacionamientos?: number
  render_url?: string
  plano_url?: string
  cliente_id?: string
  cliente?: Cliente
  imagenes: Imagen[]
  etapas: Etapa[]
}

interface CostosUnidad {
  unidad_id: string
  numero_unidad: string
  costos: {
    materiales: number
    mano_obra: number
    subcontratistas: number
    otros: number
    ordenes_compra: number
    total: number
  }
  precio_venta: number
  margen: number | null
}

interface EgresoUnidad {
  id: string
  categoria: string
  concepto: string
  monto: number
  fecha: string
  proveedor_id?: string
  notas?: string
}

interface MaterialesUnidad {
  unidad_id: string
  numero_unidad: string
  total_costo_materiales: number
  resumen: {
    material_id: string
    codigo: string
    nombre: string
    categoria: string
    unidad_medida: string
    cantidad_total: number
    costo_total: number
  }[]
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

const tipoImagenLabels: Record<string, string> = {
  avance: 'Avance de Obra',
  render: 'Render',
  plano: 'Plano',
}

// Modal para agregar/editar imagen con file upload
function ImagenModal({
  open,
  onClose,
  onSave,
  imagen,
  isLoading,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  imagen?: Imagen | null
  isLoading: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>(imagen?.url || '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [form, setForm] = useState({
    url: imagen?.url || '',
    titulo: imagen?.titulo || '',
    descripcion: imagen?.descripcion || '',
    tipo: imagen?.tipo || 'avance',
    orden: imagen?.orden || 0,
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen')
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('La imagen es muy grande. Máximo 10MB')
      return
    }

    setSelectedFile(file)
    setUploadError(null)

    // Preview local
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile && !form.url) {
      setUploadError('Selecciona una imagen')
      return
    }

    let imageUrl = form.url

    // Si hay archivo seleccionado, subirlo primero
    if (selectedFile) {
      setUploading(true)
      setUploadError(null)

      try {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('folder', 'unidades')

        const response = await api.post('/api/v1/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        imageUrl = response.data.data.url
      } catch (error: any) {
        setUploadError(error.response?.data?.detail || 'Error al subir la imagen')
        setUploading(false)
        return
      }

      setUploading(false)
    }

    // Guardar el registro de imagen
    onSave({
      ...form,
      url: imageUrl,
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current
      if (input) {
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        handleFileSelect({ target: { files: dt.files } } as any)
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{imagen ? 'Editar Imagen' : 'Agregar Imagen de Avance'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary-100 rounded">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Área de carga de archivo */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Imagen *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                transition-colors hover:border-primary-400 hover:bg-primary-50/50
                ${preview ? 'border-primary-300 bg-primary-50/30' : 'border-secondary-300'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {preview ? (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-secondary-500">
                    {selectedFile ? selectedFile.name : 'Imagen cargada'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setPreview('')
                      setForm((p) => ({ ...p, url: '' }))
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    Cambiar imagen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Upload className="text-secondary-400" size={28} />
                  </div>
                  <div>
                    <p className="text-secondary-700 font-medium">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="text-secondary-400 text-sm mt-1">
                      JPG, PNG, GIF o WebP • Máximo 10MB
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button type="button" variant="outline" size="sm">
                      <Camera size={16} className="mr-1" />
                      Seleccionar archivo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-error text-sm mt-2">{uploadError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              className="input-field w-full"
              required
              placeholder="Ej: Avance Febrero 2025 - Cimientos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              className="input-field w-full"
              rows={3}
              placeholder="Describe el avance mostrado en la imagen..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Tipo de Imagen
              </label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                className="input-field w-full"
              >
                <option value="avance">Avance de Obra</option>
                <option value="render">Render</option>
                <option value="plano">Plano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Orden
              </label>
              <input
                type="number"
                value={form.orden}
                onChange={(e) => setForm((p) => ({ ...p, orden: Number(e.target.value) }))}
                className="input-field w-full"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || uploading} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Subiendo...
                </>
              ) : isLoading ? (
                'Guardando...'
              ) : imagen ? (
                'Actualizar'
              ) : (
                'Agregar Imagen'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal para ver imagen ampliada
function ImagenViewer({
  imagen,
  onClose,
}: {
  imagen: Imagen | null
  onClose: () => void
}) {
  if (!imagen) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-secondary-300"
        >
          <X size={24} />
        </button>
        <img
          src={imagen.url}
          alt={imagen.titulo || 'Imagen'}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />
        <div className="mt-4 text-white">
          <h3 className="text-lg font-semibold">{imagen.titulo}</h3>
          {imagen.descripcion && (
            <p className="text-secondary-300 mt-1">{imagen.descripcion}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-secondary-400">
            <span>{tipoImagenLabels[imagen.tipo]}</span>
            <span>{new Date(imagen.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal para editar etapa
function EtapaModal({
  open,
  onClose,
  onSave,
  etapa,
  isLoading,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  etapa: Etapa | null
  isLoading: boolean
}) {
  const [form, setForm] = useState({
    porcentaje: etapa?.porcentaje || 0,
    completada: etapa?.completada || false,
    descripcion: etapa?.descripcion || '',
    fecha_inicio: etapa?.fecha_inicio?.split('T')[0] || '',
    fecha_fin: etapa?.fecha_fin?.split('T')[0] || '',
    notas: etapa?.notas || '',
  })

  if (!open || !etapa) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Editar Etapa: {etapa.nombre}</h2>
            <p className="text-sm text-secondary-500">Actualiza el progreso y detalles de esta etapa</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary-100 rounded">
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSave({
              ...form,
              fecha_inicio: form.fecha_inicio || null,
              fecha_fin: form.fecha_fin || null,
            })
          }}
          className="p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Porcentaje de Avance
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={form.porcentaje}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setForm((p) => ({
                    ...p,
                    porcentaje: val,
                    completada: val === 100,
                  }))
                }}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={form.porcentaje}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, Number(e.target.value)))
                  setForm((p) => ({
                    ...p,
                    porcentaje: val,
                    completada: val === 100,
                  }))
                }}
                className="input-field w-20 text-center"
              />
              <span className="text-secondary-500">%</span>
            </div>
            <div className="mt-2 h-3 bg-secondary-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${form.completada ? 'bg-green-500' : 'bg-primary-500'}`}
                style={{ width: `${form.porcentaje}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completada"
              checked={form.completada}
              onChange={(e) => setForm((p) => ({
                ...p,
                completada: e.target.checked,
                porcentaje: e.target.checked ? 100 : p.porcentaje,
              }))}
              className="rounded"
            />
            <label htmlFor="completada" className="text-sm text-secondary-700">
              Marcar como completada
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Descripción del Avance
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              className="input-field w-full"
              rows={2}
              placeholder="Describe el trabajo realizado en esta etapa..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
              className="input-field w-full"
              rows={2}
              placeholder="Observaciones, pendientes, materiales utilizados..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UnidadDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showVenderModal, setShowVenderModal] = useState(false)
  const [showImagenModal, setShowImagenModal] = useState(false)
  const [showEtapaModal, setShowEtapaModal] = useState(false)
  const [showCredencialesModal, setShowCredencialesModal] = useState(false)
  const [credencialesGeneradas, setCredencialesGeneradas] = useState<{ email: string; password: string } | null>(null)
  const [selectedEtapa, setSelectedEtapa] = useState<Etapa | null>(null)
  const [selectedImagen, setSelectedImagen] = useState<Imagen | null>(null)
  const [viewingImagen, setViewingImagen] = useState<Imagen | null>(null)
  const [tipoImagenFilter, setTipoImagenFilter] = useState<string>('todos')
  const [expandedEtapa, setExpandedEtapa] = useState<string | null>(null)
  const [uploadingRender, setUploadingRender] = useState(false)
  const renderInputRef = useRef<HTMLInputElement>(null)

  const { data: unidad, isLoading } = useQuery<UnidadDetalle>({
    queryKey: ['unidad', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/unidades/${id}`)
      return res.data
    },
  })

  const { data: clientes = [] } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await api.get('/api/v1/clientes')
      return res.data.items || []
    },
  })

  const { data: costos } = useQuery<CostosUnidad>({
    queryKey: ['unidad-costos', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/unidades/${id}/costos`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: egresos = [] } = useQuery<EgresoUnidad[]>({
    queryKey: ['unidad-egresos', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/unidades/${id}/egresos`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: materialesData } = useQuery<MaterialesUnidad>({
    queryKey: ['unidad-materiales', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/unidades/${id}/materiales`)
      return res.data
    },
    enabled: !!id,
  })

  const venderMutation = useMutation({
    mutationFn: (data: { cliente_id: string; crear_usuario: boolean }) =>
      api.post(`/api/v1/unidades/${id}/vender`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unidad', id] })
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
      setShowVenderModal(false)

      if (variables.crear_usuario && unidad) {
        const cliente = clientes.find(c => c.id === variables.cliente_id)
        if (cliente?.email) {
          const password = `TheMountPH${unidad.numero_unidad.replace(/\s/g, '')}`
          setCredencialesGeneradas({
            email: cliente.email,
            password: password,
          })
          setShowCredencialesModal(true)
        }
      }
    },
  })

  const liberarMutation = useMutation({
    mutationFn: () => api.post(`/api/v1/unidades/${id}/liberar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidad', id] })
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
    },
  })

  const updateEtapaMutation = useMutation({
    mutationFn: ({ etapaId, data }: { etapaId: string; data: any }) =>
      api.put(`/api/v1/unidades/${id}/etapas/${etapaId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidad', id] })
      setShowEtapaModal(false)
      setSelectedEtapa(null)
    },
  })

  const addImagenMutation = useMutation({
    mutationFn: (data: any) =>
      api.post(`/api/v1/unidades/${id}/imagenes`, { ...data, unidad_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidad', id] })
      setShowImagenModal(false)
    },
  })

  const deleteImagenMutation = useMutation({
    mutationFn: (imagenId: string) => api.delete(`/api/v1/unidades/${id}/imagenes/${imagenId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidad', id] })
    },
    onError: (error: any) => {
      console.error('Error eliminando imagen:', error)
      alert('Error al eliminar: ' + (error.response?.data?.detail || error.message))
    },
  })

  const updateUnidadMutation = useMutation({
    mutationFn: (data: any) => api.put(`/api/v1/unidades/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidad', id] })
    },
  })

  const handleRenderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 10MB')
      return
    }

    setUploadingRender(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'renders')

      const uploadRes = await api.post('/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await updateUnidadMutation.mutateAsync({ render_url: uploadRes.data.data.url })
    } catch (error: any) {
      alert('Error al subir: ' + (error.response?.data?.detail || error.message))
    } finally {
      setUploadingRender(false)
      if (renderInputRef.current) renderInputRef.current.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (!unidad) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">Unidad no encontrada</p>
      </div>
    )
  }

  const filteredImagenes = tipoImagenFilter === 'todos'
    ? unidad.imagenes
    : unidad.imagenes.filter(img => img.tipo === tipoImagenFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/unidades')} className="p-2 hover:bg-secondary-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-2">
            <Home className="text-primary-600" />
            {unidad.numero_unidad}
            {unidad.nombre && <span className="text-primary-600">- {unidad.nombre}</span>}
          </h1>
          <p className="text-secondary-500 text-sm">{unidad.tipo_casa || 'Estándar'}</p>
        </div>
        <Badge variant={
          unidad.estado === 'disponible' ? 'success' :
          unidad.estado === 'vendida' ? 'info' : 'warning'
        }>
          {unidad.estado === 'disponible' ? 'Disponible' :
           unidad.estado === 'vendida' ? 'Vendida' : 'Reservada'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Render / Imagen principal */}
          <div className="card overflow-hidden relative group">
            <input
              ref={renderInputRef}
              type="file"
              accept="image/*"
              onChange={handleRenderUpload}
              className="hidden"
            />
            <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
              {unidad.render_url ? (
                <>
                  <img src={unidad.render_url} alt={unidad.numero_unidad} className="w-full h-full object-cover" />
                  {/* Overlay con botones */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => renderInputRef.current?.click()}
                      disabled={uploadingRender}
                    >
                      {uploadingRender ? (
                        <Loader2 className="animate-spin mr-1" size={16} />
                      ) : (
                        <Camera size={16} className="mr-1" />
                      )}
                      Cambiar Render
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90"
                      onClick={() => window.open(unidad.render_url, '_blank')}
                    >
                      <Eye size={16} className="mr-1" />
                      Ver Completa
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => renderInputRef.current?.click()}
                >
                  {uploadingRender ? (
                    <>
                      <Loader2 className="mx-auto text-primary-500 mb-2 animate-spin" size={64} />
                      <p className="text-primary-500">Subiendo render...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto text-primary-300 mb-2" size={64} />
                      <p className="text-primary-400 font-medium">Clic para subir render</p>
                      <p className="text-primary-300 text-sm mt-1">JPG, PNG o WebP • Máx 10MB</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Etapas de obra - MEJORADO */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-800 flex items-center gap-2">
                <CheckCircle className="text-primary-600" size={20} />
                Etapas de Construcción
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary-500">Avance General:</span>
                <Badge variant={unidad.avance_porcentaje === 100 ? 'success' : 'info'}>
                  {unidad.avance_porcentaje}%
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {(unidad.etapas || []).map((etapa) => (
                <div key={etapa.id} className="border border-secondary-200 rounded-lg overflow-hidden">
                  <div
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary-50 transition-colors ${
                      expandedEtapa === etapa.id ? 'bg-secondary-50' : ''
                    }`}
                    onClick={() => setExpandedEtapa(expandedEtapa === etapa.id ? null : etapa.id)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      etapa.completada ? 'bg-green-500 text-white' : 'bg-secondary-200 text-secondary-500'
                    }`}>
                      {etapa.completada ? <Check size={16} /> : etapa.orden}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-secondary-800">{etapa.nombre}</span>
                        <span className={`text-sm font-semibold ${
                          etapa.completada ? 'text-green-600' : 'text-primary-600'
                        }`}>
                          {etapa.porcentaje}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 bg-secondary-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            etapa.completada ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${etapa.porcentaje}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEtapa(etapa)
                        setShowEtapaModal(true)
                      }}
                      className="p-1.5 hover:bg-secondary-200 rounded text-secondary-500"
                      title="Editar etapa"
                    >
                      <Pencil size={16} />
                    </button>
                    {expandedEtapa === etapa.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {expandedEtapa === etapa.id && (
                    <div className="px-4 pb-4 pt-2 bg-secondary-50 border-t border-secondary-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {etapa.fecha_inicio && (
                          <div>
                            <span className="text-secondary-500">Fecha inicio:</span>
                            <span className="ml-2 text-secondary-700">
                              {new Date(etapa.fecha_inicio).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                        )}
                        {etapa.fecha_fin && (
                          <div>
                            <span className="text-secondary-500">Fecha fin:</span>
                            <span className="ml-2 text-secondary-700">
                              {new Date(etapa.fecha_fin).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                        )}
                      </div>
                      {etapa.descripcion && (
                        <p className="text-sm text-secondary-600 mt-2">{etapa.descripcion}</p>
                      )}
                      {etapa.notas && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                          <strong>Notas:</strong> {etapa.notas}
                        </div>
                      )}
                      {!etapa.descripcion && !etapa.notas && !etapa.fecha_inicio && !etapa.fecha_fin && (
                        <p className="text-sm text-secondary-400 italic">
                          Sin información adicional. Haz clic en el ícono de edición para agregar detalles.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Galería de imágenes - MEJORADA */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-800 flex items-center gap-2">
                <ImageIcon className="text-primary-600" size={20} />
                Galería de Avance
              </h2>
              <Button onClick={() => setShowImagenModal(true)} size="sm">
                <Plus size={16} className="mr-1" />
                Agregar Imagen
              </Button>
            </div>

            {/* Filtros de tipo */}
            <Tabs value={tipoImagenFilter} onValueChange={setTipoImagenFilter} className="mb-4">
              <TabsList>
                <TabsTrigger value="todos">
                  Todos ({unidad.imagenes.length})
                </TabsTrigger>
                <TabsTrigger value="avance">
                  Avance ({unidad.imagenes.filter(i => i.tipo === 'avance').length})
                </TabsTrigger>
                <TabsTrigger value="render">
                  Render ({unidad.imagenes.filter(i => i.tipo === 'render').length})
                </TabsTrigger>
                <TabsTrigger value="plano">
                  Planos ({unidad.imagenes.filter(i => i.tipo === 'plano').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredImagenes.length === 0 ? (
              <div className="text-center py-12 bg-secondary-50 rounded-lg">
                <ImageIcon className="mx-auto text-secondary-300 mb-2" size={48} />
                <p className="text-secondary-400">No hay imágenes de avance</p>
                <p className="text-secondary-400 text-sm mt-1">
                  Agrega fotos del progreso de la construcción
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredImagenes.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-secondary-200">
                    <img
                      src={img.url}
                      alt={img.titulo || 'Avance'}
                      className="w-full h-40 object-cover cursor-pointer"
                      onClick={() => setViewingImagen(img)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-medium truncate">{img.titulo || 'Sin título'}</p>
                        <p className="text-white/70 text-xs">
                          {new Date(img.created_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewingImagen(img)}
                        className="p-1.5 bg-white/90 text-secondary-700 rounded hover:bg-white"
                        title="Ver imagen"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta imagen?')) {
                            deleteImagenMutation.mutate(img.id)
                          }
                        }}
                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <Badge
                      variant={img.tipo === 'avance' ? 'info' : img.tipo === 'render' ? 'purple' : 'secondary'}
                      className="absolute top-2 left-2"
                    >
                      {tipoImagenLabels[img.tipo]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Info de la unidad */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Información</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 flex items-center gap-2">
                  <Ruler size={16} />
                  Superficie
                </span>
                <span className="font-semibold">{unidad.metros_cuadrados} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 flex items-center gap-2">
                  <Tag size={16} />
                  Precio/m²
                </span>
                <span className="font-semibold">{formatCurrency(unidad.precio_por_m2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-secondary-700 flex items-center gap-2 font-medium">
                  <DollarSign size={16} />
                  Valor Total
                </span>
                <span className="font-bold text-lg text-primary-600">{formatCurrency(unidad.precio_total)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-secondary-500 flex items-center gap-2">
                  <Clock size={16} />
                  Avance
                </span>
                <span className="font-semibold">{unidad.avance_porcentaje}%</span>
              </div>
              {unidad.etapa_actual && (
                <div className="flex items-center justify-between">
                  <span className="text-secondary-500 flex items-center gap-2">
                    <Building2 size={16} />
                    Etapa
                  </span>
                  <Badge variant="secondary">{unidad.etapa_actual}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Cliente asignado */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <User size={20} />
              Cliente
            </h2>
            {unidad.cliente ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-secondary-800">
                    {unidad.cliente.nombre} {unidad.cliente.apellido_paterno}
                  </p>
                  {unidad.cliente.email && (
                    <p className="text-sm text-secondary-500">{unidad.cliente.email}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('¿Liberar esta unidad?')) liberarMutation.mutate()
                  }}
                  disabled={liberarMutation.isPending}
                  className="w-full"
                >
                  {liberarMutation.isPending ? 'Liberando...' : 'Liberar Unidad'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-secondary-400 text-center py-4">Sin cliente asignado</p>
                <Button onClick={() => setShowVenderModal(true)} className="w-full">
                  Vender Unidad
                </Button>
              </div>
            )}
          </div>

          {/* Materiales Consumidos */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Materiales Consumidos
            </h2>
            {materialesData && materialesData.resumen.length > 0 ? (
              <div className="space-y-3">
                {materialesData.resumen.map((mat) => (
                  <div key={mat.material_id} className="text-xs p-2 bg-blue-50 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{mat.nombre}</span>
                      <span className="text-blue-700">{formatCurrency(mat.costo_total)}</span>
                    </div>
                    <div className="flex justify-between text-secondary-400 mt-1">
                      <span>{mat.codigo}</span>
                      <span>{mat.cantidad_total} {mat.unidad_medida}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t font-semibold">
                  <span className="text-secondary-700">Total Materiales</span>
                  <span className="text-blue-600">{formatCurrency(materialesData.total_costo_materiales)}</span>
                </div>
              </div>
            ) : (
              <p className="text-secondary-400 text-center py-4 text-sm">
                Sin materiales asignados
              </p>
            )}
          </div>

          {/* Costos asignados (Egresos) */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-amber-600" />
              Otros Costos
            </h2>
            {costos && costos.costos.total > 0 ? (
              <div className="space-y-3">
                {costos.costos.mano_obra > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-500 flex items-center gap-2">
                      <Hammer size={14} />
                      Mano de Obra
                    </span>
                    <span className="font-medium">{formatCurrency(costos.costos.mano_obra)}</span>
                  </div>
                )}
                {costos.costos.subcontratistas > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-500 flex items-center gap-2">
                      <User size={14} />
                      Subcontratistas
                    </span>
                    <span className="font-medium">{formatCurrency(costos.costos.subcontratistas)}</span>
                  </div>
                )}
                {costos.costos.otros > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-500">Otros Gastos</span>
                    <span className="font-medium">{formatCurrency(costos.costos.otros)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t font-semibold">
                  <span className="text-secondary-700">Total Otros Costos</span>
                  <span className="text-amber-600">{formatCurrency(costos.costos.total)}</span>
                </div>
              </div>
            ) : (
              <p className="text-secondary-400 text-center py-4 text-sm">
                Sin otros costos asignados
              </p>
            )}

            {/* Lista de egresos */}
            {egresos.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-secondary-700 mb-2">Detalle</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {egresos.map((egreso) => (
                    <div key={egreso.id} className="text-xs p-2 bg-secondary-50 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium truncate flex-1">{egreso.concepto}</span>
                        <span className="text-secondary-700 ml-2">{formatCurrency(egreso.monto)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resumen Total y Margen */}
          <div className="card p-6 bg-gradient-to-br from-primary-50 to-primary-100">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-600" />
              Resumen Financiero
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Materiales</span>
                <span className="font-medium">{formatCurrency(materialesData?.total_costo_materiales || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Otros Costos</span>
                <span className="font-medium">{formatCurrency(costos?.costos.total || 0)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-primary-200 font-semibold">
                <span className="text-secondary-700">Costo Total</span>
                <span className="text-amber-600">
                  {formatCurrency((materialesData?.total_costo_materiales || 0) + (costos?.costos.total || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Precio de Venta</span>
                <span className="font-medium">{formatCurrency(unidad.precio_total || 0)}</span>
              </div>
              {unidad.precio_total && (
                <div className="flex items-center justify-between pt-2 border-t border-primary-200 font-bold">
                  <span className="text-secondary-700">Margen</span>
                  {(() => {
                    const costoTotal = (materialesData?.total_costo_materiales || 0) + (costos?.costos.total || 0)
                    const margen = (unidad.precio_total || 0) - costoTotal
                    return (
                      <span className={margen >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(margen)}
                      </span>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Plano */}
          {unidad.plano_url && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Plano
              </h2>
              <img
                src={unidad.plano_url}
                alt="Plano"
                className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(unidad.plano_url, '_blank')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal Vender */}
      {showVenderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Vender Unidad</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                venderMutation.mutate({
                  cliente_id: formData.get('cliente_id') as string,
                  crear_usuario: formData.get('crear_usuario') === 'on',
                })
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Seleccionar Cliente
                </label>
                <select name="cliente_id" className="input-field w-full" required>
                  <option value="">Seleccione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido_paterno}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="crear_usuario" id="crear_usuario" defaultChecked />
                <label htmlFor="crear_usuario" className="text-sm text-secondary-700">
                  Crear usuario para el cliente (acceso a su PH)
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowVenderModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={venderMutation.isPending} className="flex-1">
                  {venderMutation.isPending ? 'Vendiendo...' : 'Confirmar Venta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Credenciales Generadas */}
      {showCredencialesModal && credencialesGeneradas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b bg-green-50">
              <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle size={20} />
                Venta Registrada Exitosamente
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-secondary-600">
                Se ha creado un usuario para que el cliente pueda acceder a ver su unidad.
                Comparte estas credenciales con el cliente:
              </p>

              <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {credencialesGeneradas.email}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(credencialesGeneradas.email)}
                      className="p-2 hover:bg-secondary-200 rounded"
                      title="Copiar"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Contraseña</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {credencialesGeneradas.password}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(credencialesGeneradas.password)}
                      className="p-2 hover:bg-secondary-200 rounded"
                      title="Copiar"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-secondary-400">
                El cliente podrá iniciar sesión y ver únicamente su unidad con el avance de obra.
              </p>

              <Button
                onClick={() => {
                  setShowCredencialesModal(false)
                  setCredencialesGeneradas(null)
                }}
                className="w-full"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Imagen */}
      <ImagenModal
        open={showImagenModal}
        onClose={() => {
          setShowImagenModal(false)
          setSelectedImagen(null)
        }}
        onSave={(data) => addImagenMutation.mutate(data)}
        imagen={selectedImagen}
        isLoading={addImagenMutation.isPending}
      />

      {/* Modal Editar Etapa */}
      <EtapaModal
        open={showEtapaModal}
        onClose={() => {
          setShowEtapaModal(false)
          setSelectedEtapa(null)
        }}
        onSave={(data) => {
          if (selectedEtapa) {
            updateEtapaMutation.mutate({ etapaId: selectedEtapa.id, data })
          }
        }}
        etapa={selectedEtapa}
        isLoading={updateEtapaMutation.isPending}
      />

      {/* Visor de imagen ampliada */}
      <ImagenViewer
        imagen={viewingImagen}
        onClose={() => setViewingImagen(null)}
      />
    </div>
  )
}
