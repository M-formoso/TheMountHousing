import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, Phone, Mail, MapPin, Star, DollarSign,
  CreditCard, FileText, Plus, Edit2, Trash2, Paperclip, Calendar,
  Globe, Heart, Shield, Clock, Briefcase, CheckCircle2, AlertCircle,
  Download, Wrench, User, Hash
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useProveedor, useAccionesProveedor, useCreateAccion, useUpdateAccion, useDeleteAccion } from '@/services/proveedores.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ProveedorFormModal } from '@/components/proveedores/ProveedorFormModal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { AccionProveedor, AccionProveedorCreate, TipoAccion, EstadoAccion } from '@/types/proveedor'
import {
  categoriaLabels, categoriaColors,
  estadoProveedorLabels, estadoProveedorColors,
  especialidadLabels,
  tipoAccionLabels, tipoAccionColors,
  estadoAccionLabels, estadoAccionColors
} from '@/types/proveedor'

export default function ProveedorDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('info')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAccionForm, setShowAccionForm] = useState(false)
  const [editingAccion, setEditingAccion] = useState<AccionProveedor | null>(null)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const { data: proveedor, isLoading, refetch } = useProveedor(id || '')
  const { data: accionesData, refetch: refetchAcciones } = useAccionesProveedor(id || '', {
    tipo: filtroTipo || undefined,
    estado: filtroEstado || undefined,
    limit: 100,
  })

  const acciones = accionesData?.items ?? []

  // Calculate totals from actions
  const actionTotals = useMemo(() => {
    const pagos = acciones.filter(a => a.tipo === 'pago' && a.estado === 'completado')
      .reduce((sum, a) => sum + (a.monto || 0), 0)
    const pedidos = acciones.filter(a => a.tipo === 'pedido')
      .reduce((sum, a) => sum + (a.monto || 0), 0)
    const pendientes = acciones.filter(a => a.estado === 'pendiente').length
    const completados = acciones.filter(a => a.estado === 'completado').length
    return { pagos, pedidos, pendientes, completados }
  }, [acciones])

  const renderStars = (rating: number, editable = false) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={18}
          className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-2 text-sm text-secondary-500">({rating}/5)</span>
    </div>
  )

  const exportAccionesToExcel = () => {
    const exportData = acciones.map(a => ({
      'Tipo': tipoAccionLabels[a.tipo],
      'Descripción': a.descripcion,
      'Monto': a.monto || 0,
      'Fecha': formatDate(a.fecha),
      'Estado': estadoAccionLabels[a.estado],
      'Referencia': a.referencia || '',
      'Notas': a.notas || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Acciones')
    XLSX.writeFile(wb, `acciones_${proveedor?.razon_social}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (isLoading) return <LoadingSpinner />
  if (!proveedor) return <div className="text-center py-12">Proveedor no encontrado</div>

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/proveedores')}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              {proveedor.categoria === 'mano_de_obra' ? (
                <Wrench size={24} className="text-primary-600" />
              ) : (
                <Building2 size={24} className="text-primary-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                {proveedor.razon_social}
                {proveedor.preferido && (
                  <Heart size={20} className="fill-red-500 text-red-500" />
                )}
              </h1>
              {proveedor.nombre_comercial && (
                <p className="text-secondary-500">{proveedor.nombre_comercial}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={categoriaColors[proveedor.categoria] as any}>
              {categoriaLabels[proveedor.categoria]}
            </Badge>
            <Badge variant={estadoProveedorColors[proveedor.estado] as any}>
              {estadoProveedorLabels[proveedor.estado]}
            </Badge>
            {proveedor.especialidad && (
              <Badge variant="secondary">
                {especialidadLabels[proveedor.especialidad]}
              </Badge>
            )}
            {proveedor.tiene_seguro && (
              <Badge variant="info">
                <Shield size={12} className="mr-1" /> Asegurado
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowEditModal(true)}>
          <Edit2 size={16} className="mr-2" /> Editar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(proveedor.total_pagado)}</p>
              <p className="text-xs text-secondary-500">Total Pagado</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(proveedor.total_pendiente)}</p>
              <p className="text-xs text-secondary-500">Pendiente</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-secondary-900">{proveedor.trabajos_completados}</p>
              <p className="text-xs text-secondary-500">Trabajos Completados</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-secondary-900">{proveedor.dias_credito} días</p>
              <p className="text-xs text-secondary-500">Plazo de Crédito</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="acciones">
            Acciones ({acciones.length})
          </TabsTrigger>
          <TabsTrigger value="financiero">Datos Financieros</TabsTrigger>
          {proveedor.categoria === 'mano_de_obra' && (
            <TabsTrigger value="contratista">Datos Contratista</TabsTrigger>
          )}
        </TabsList>

        {/* Tab: Información */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <User size={18} /> Información de Contacto
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-secondary-500" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Contacto Principal</p>
                    <p className="font-medium text-secondary-900">{proveedor.contacto_principal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Mail size={16} className="text-secondary-500" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Email</p>
                    <a href={`mailto:${proveedor.email}`} className="font-medium text-primary-600 hover:underline">
                      {proveedor.email}
                    </a>
                  </div>
                </div>
                {proveedor.telefono && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Phone size={16} className="text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Teléfono</p>
                      <a href={`tel:${proveedor.telefono}`} className="font-medium text-secondary-900">
                        {proveedor.telefono}
                      </a>
                    </div>
                  </div>
                )}
                {proveedor.telefono_alternativo && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Phone size={16} className="text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Teléfono Alternativo</p>
                      <a href={`tel:${proveedor.telefono_alternativo}`} className="font-medium text-secondary-900">
                        {proveedor.telefono_alternativo}
                      </a>
                    </div>
                  </div>
                )}
                {proveedor.sitio_web && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Globe size={16} className="text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Sitio Web</p>
                      <a href={proveedor.sitio_web} target="_blank" rel="noopener noreferrer"
                        className="font-medium text-primary-600 hover:underline">
                        {proveedor.sitio_web}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <MapPin size={18} /> Dirección
              </h3>
              {proveedor.direccion ? (
                <div className="space-y-3">
                  <p className="text-secondary-800">{proveedor.direccion}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {proveedor.ciudad && (
                      <div>
                        <span className="text-secondary-500">Ciudad:</span>
                        <span className="ml-2 text-secondary-900">{proveedor.ciudad}</span>
                      </div>
                    )}
                    {proveedor.estado_geo && (
                      <div>
                        <span className="text-secondary-500">Estado:</span>
                        <span className="ml-2 text-secondary-900">{proveedor.estado_geo}</span>
                      </div>
                    )}
                    {proveedor.codigo_postal && (
                      <div>
                        <span className="text-secondary-500">C.P.:</span>
                        <span className="ml-2 text-secondary-900">{proveedor.codigo_postal}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-secondary-400 text-sm">Sin dirección registrada</p>
              )}
            </div>

            {/* Rating & Activity */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <Star size={18} /> Calificación y Actividad
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary-500 mb-2">Calificación</p>
                  {renderStars(proveedor.calificacion)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Trabajos Completados</p>
                    <p className="text-2xl font-bold text-secondary-900">{proveedor.trabajos_completados}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Última Actividad</p>
                    <p className="text-lg font-medium text-secondary-900">
                      {proveedor.ultima_actividad ? formatDate(proveedor.ultima_actividad) : 'Sin actividad'}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-secondary-100">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={proveedor.preferido}
                      disabled
                      className="w-4 h-4 rounded border-secondary-300"
                    />
                    <span className="text-sm text-secondary-700">Proveedor Preferido</span>
                    {proveedor.preferido && <Heart size={14} className="fill-red-500 text-red-500" />}
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <FileText size={18} /> Notas
              </h3>
              {proveedor.notas ? (
                <p className="text-sm text-secondary-600 whitespace-pre-wrap">{proveedor.notas}</p>
              ) : (
                <p className="text-secondary-400 text-sm">Sin notas</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Acciones */}
        <TabsContent value="acciones">
          <div className="card p-5">
            {/* Header de Acciones */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="font-semibold text-secondary-900 text-lg">Historial de Acciones</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportAccionesToExcel}>
                  <Download size={14} className="mr-1" /> Exportar
                </Button>
                <Button size="sm" onClick={() => { setEditingAccion(null); setShowAccionForm(true) }}>
                  <Plus size={14} className="mr-1" /> Nueva Acción
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-secondary-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-secondary-900">{acciones.length}</p>
                <p className="text-xs text-secondary-500">Total Acciones</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{actionTotals.pendientes}</p>
                <p className="text-xs text-amber-600">Pendientes</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{actionTotals.completados}</p>
                <p className="text-xs text-green-600">Completados</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{formatCurrency(actionTotals.pagos)}</p>
                <p className="text-xs text-blue-600">En Pagos</p>
              </div>
            </div>

            {/* Filtros de Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">Todos los tipos</option>
                {Object.entries(tipoAccionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">Todos los estados</option>
                {Object.entries(estadoAccionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Lista de Acciones */}
            <div className="space-y-3">
              {acciones.length === 0 ? (
                <div className="text-center py-8 text-secondary-400">
                  <FileText size={40} className="mx-auto mb-3 text-secondary-300" />
                  <p>No hay acciones registradas</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => { setEditingAccion(null); setShowAccionForm(true) }}
                  >
                    <Plus size={14} className="mr-1" /> Agregar primera acción
                  </Button>
                </div>
              ) : (
                acciones.map((accion) => (
                  <AccionItem
                    key={accion.id}
                    accion={accion}
                    proveedorId={id || ''}
                    onEdit={() => { setEditingAccion(accion); setShowAccionForm(true) }}
                    onDelete={() => refetchAcciones()}
                  />
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Datos Financieros */}
        <TabsContent value="financiero">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bank Info */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} /> Datos Bancarios
              </h3>
              {proveedor.banco || proveedor.cuenta_bancaria || proveedor.clabe ? (
                <div className="space-y-4">
                  {proveedor.banco && (
                    <div>
                      <p className="text-sm text-secondary-500">Banco</p>
                      <p className="font-medium text-secondary-900">{proveedor.banco}</p>
                    </div>
                  )}
                  {proveedor.cuenta_bancaria && (
                    <div>
                      <p className="text-sm text-secondary-500">Número de Cuenta</p>
                      <p className="font-mono text-secondary-900">{proveedor.cuenta_bancaria}</p>
                    </div>
                  )}
                  {proveedor.clabe && (
                    <div>
                      <p className="text-sm text-secondary-500">CLABE Interbancaria</p>
                      <p className="font-mono text-secondary-900 text-sm">{proveedor.clabe}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-secondary-400 text-sm">Sin datos bancarios registrados</p>
              )}
            </div>

            {/* Tax Info */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <Hash size={18} /> Datos Fiscales
              </h3>
              {proveedor.rfc ? (
                <div>
                  <p className="text-sm text-secondary-500">RFC</p>
                  <p className="font-mono text-lg font-medium text-secondary-900">{proveedor.rfc}</p>
                </div>
              ) : (
                <p className="text-secondary-400 text-sm">Sin RFC registrado</p>
              )}
            </div>

            {/* Payment Terms */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <Clock size={18} /> Condiciones de Pago
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Días de Crédito</p>
                    <p className="text-2xl font-bold text-secondary-900">{proveedor.dias_credito}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Descuento Pronto Pago</p>
                    <p className="text-2xl font-bold text-secondary-900">{proveedor.descuento_pronto_pago}%</p>
                  </div>
                </div>
                {proveedor.tiempo_entrega_dias && (
                  <div>
                    <p className="text-sm text-secondary-500">Tiempo de Entrega</p>
                    <p className="font-medium text-secondary-900">{proveedor.tiempo_entrega_dias} días</p>
                  </div>
                )}
                {proveedor.condiciones_pago && (
                  <div>
                    <p className="text-sm text-secondary-500">Condiciones Adicionales</p>
                    <p className="text-secondary-700">{proveedor.condiciones_pago}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <DollarSign size={18} /> Resumen Financiero
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">Total Pagado</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(proveedor.total_pagado)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">Saldo Pendiente</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">
                    {formatCurrency(proveedor.total_pendiente)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Datos Contratista (solo para mano de obra) */}
        {proveedor.categoria === 'mano_de_obra' && (
          <TabsContent value="contratista">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Specialty */}
              <div className="card p-5">
                <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <Wrench size={18} /> Especialidad
                </h3>
                {proveedor.especialidad ? (
                  <div>
                    <Badge variant="purple" size="lg">
                      {especialidadLabels[proveedor.especialidad]}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-secondary-400 text-sm">Sin especialidad registrada</p>
                )}
              </div>

              {/* License */}
              <div className="card p-5">
                <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <FileText size={18} /> Licencia
                </h3>
                {proveedor.numero_licencia ? (
                  <div>
                    <p className="text-sm text-secondary-500">Número de Licencia</p>
                    <p className="font-mono text-lg font-medium text-secondary-900">{proveedor.numero_licencia}</p>
                  </div>
                ) : (
                  <p className="text-secondary-400 text-sm">Sin licencia registrada</p>
                )}
              </div>

              {/* Insurance */}
              <div className="card p-5 lg:col-span-2">
                <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <Shield size={18} /> Información de Seguro
                </h3>
                {proveedor.tiene_seguro ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-secondary-500">Aseguradora</p>
                      <p className="font-medium text-secondary-900">{proveedor.aseguradora || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Número de Póliza</p>
                      <p className="font-mono text-secondary-900">{proveedor.numero_poliza || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Vigencia</p>
                      <p className="font-medium text-secondary-900">
                        {proveedor.vigencia_seguro ? formatDate(proveedor.vigencia_seguro) : 'No especificada'}
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <Badge variant="success" size="lg">
                        <Shield size={14} className="mr-1" /> Contratista Asegurado
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield size={40} className="mx-auto mb-3 text-secondary-300" />
                    <p className="text-secondary-500">Este contratista no tiene seguro registrado</p>
                    <Badge variant="warning" className="mt-2">Sin Cobertura</Badge>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Modal Editar Proveedor */}
      {showEditModal && (
        <ProveedorFormModal
          proveedor={proveedor}
          onClose={() => { setShowEditModal(false); refetch() }}
        />
      )}

      {/* Modal Acción */}
      {showAccionForm && (
        <AccionFormModal
          proveedorId={id || ''}
          accion={editingAccion}
          onClose={() => { setShowAccionForm(false); setEditingAccion(null); refetchAcciones() }}
        />
      )}
    </div>
  )
}

// Componente para cada acción
function AccionItem({
  accion,
  proveedorId,
  onEdit,
  onDelete
}: {
  accion: AccionProveedor
  proveedorId: string
  onEdit: () => void
  onDelete: () => void
}) {
  const deleteMutation = useDeleteAccion(proveedorId)

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta acción?')) return
    await deleteMutation.mutateAsync(accion.id)
    onDelete()
  }

  return (
    <div className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={tipoAccionColors[accion.tipo] as any}>
              {tipoAccionLabels[accion.tipo]}
            </Badge>
            <Badge variant={estadoAccionColors[accion.estado] as any}>
              {estadoAccionLabels[accion.estado]}
            </Badge>
          </div>
          <p className="text-sm text-secondary-800 mb-2">{accion.descripcion}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-500">
            {accion.monto != null && (
              <span className="font-semibold text-secondary-700">
                {formatCurrency(accion.monto)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(accion.fecha)}
            </span>
            {accion.referencia && (
              <span className="font-mono bg-secondary-100 px-2 py-0.5 rounded">
                {accion.referencia}
              </span>
            )}
            {accion.adjuntos.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip size={12} /> {accion.adjuntos.length} archivo(s)
              </span>
            )}
          </div>
          {accion.notas && (
            <p className="text-xs text-secondary-500 mt-2 italic">{accion.notas}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-secondary-200 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={14} className="text-secondary-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal para crear/editar acciones
function AccionFormModal({
  proveedorId,
  accion,
  onClose
}: {
  proveedorId: string
  accion: AccionProveedor | null
  onClose: () => void
}) {
  const isEditing = !!accion

  const [form, setForm] = useState<AccionProveedorCreate>({
    tipo: accion?.tipo || 'pedido',
    descripcion: accion?.descripcion || '',
    monto: accion?.monto || undefined,
    fecha: accion?.fecha || new Date().toISOString().split('T')[0],
    estado: accion?.estado || 'pendiente',
    referencia: accion?.referencia || '',
    notas: accion?.notas || '',
  })
  const [error, setError] = useState('')

  const createMutation = useCreateAccion(proveedorId)
  const updateMutation = useUpdateAccion(proveedorId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.descripcion) {
      setError('La descripción es requerida')
      return
    }

    try {
      if (isEditing && accion) {
        await updateMutation.mutateAsync({ accionId: accion.id, data: form })
      } else {
        await createMutation.mutateAsync(form)
      }
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar la acción')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-secondary-900">
            {isEditing ? 'Editar Acción' : 'Nueva Acción'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Tipo de Acción *
              </label>
              <select
                value={form.tipo}
                onChange={(e) => setForm(p => ({ ...p, tipo: e.target.value as TipoAccion }))}
                className="input-field w-full"
                required
              >
                {Object.entries(tipoAccionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) => setForm(p => ({ ...p, estado: e.target.value as EstadoAccion }))}
                className="input-field w-full"
              >
                {Object.entries(estadoAccionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm(p => ({ ...p, descripcion: e.target.value }))}
              className="input-field w-full"
              rows={3}
              required
              placeholder="Describe la acción..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Monto
              </label>
              <input
                type="number"
                step="0.01"
                value={form.monto || ''}
                onChange={(e) => setForm(p => ({ ...p, monto: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="input-field w-full"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm(p => ({ ...p, fecha: e.target.value }))}
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Referencia / Nº Documento
            </label>
            <input
              type="text"
              value={form.referencia}
              onChange={(e) => setForm(p => ({ ...p, referencia: e.target.value }))}
              className="input-field w-full"
              placeholder="Ej: FAC-001234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Notas
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm(p => ({ ...p, notas: e.target.value }))}
              className="input-field w-full"
              rows={2}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Guardando...'
                : 'Guardar Acción'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
