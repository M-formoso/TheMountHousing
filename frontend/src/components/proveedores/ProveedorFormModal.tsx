import { useState, useEffect } from 'react'
import {
  X, Star, Building2, User, MapPin, CreditCard, Clock, FileText,
  Wrench, Shield, Heart
} from 'lucide-react'
import { useCreateProveedor, useUpdateProveedor } from '@/services/proveedores.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Proveedor, ProveedorCreate, CategoriaProveedor, EstadoProveedor, EspecialidadContratista } from '@/types/proveedor'
import { categoriaLabels, estadoProveedorLabels, especialidadLabels } from '@/types/proveedor'

interface Props {
  proveedor: Proveedor | null
  onClose: () => void
}

const initialForm: ProveedorCreate = {
  razon_social: '',
  nombre_comercial: '',
  rfc: '',
  categoria: 'materiales',
  estado: 'activo',
  especialidad: undefined,
  contacto_principal: '',
  email: '',
  telefono: '',
  telefono_alternativo: '',
  direccion: '',
  ciudad: '',
  estado_geo: '',
  codigo_postal: '',
  sitio_web: '',
  banco: '',
  cuenta_bancaria: '',
  clabe: '',
  numero_licencia: '',
  tiene_seguro: false,
  aseguradora: '',
  numero_poliza: '',
  vigencia_seguro: '',
  condiciones_pago: '',
  dias_credito: 30,
  descuento_pronto_pago: 0,
  tiempo_entrega_dias: undefined,
  calificacion: 0,
  preferido: false,
  notas: '',
}

export function ProveedorFormModal({ proveedor, onClose }: Props) {
  const [form, setForm] = useState<ProveedorCreate>(initialForm)
  const [error, setError] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [activeSection, setActiveSection] = useState<string>('general')

  const createMutation = useCreateProveedor()
  const updateMutation = useUpdateProveedor(proveedor?.id || '')

  const isEditing = !!proveedor
  const isManoDeObra = form.categoria === 'mano_de_obra'

  useEffect(() => {
    if (proveedor) {
      setForm({
        razon_social: proveedor.razon_social,
        nombre_comercial: proveedor.nombre_comercial || '',
        rfc: proveedor.rfc || '',
        categoria: proveedor.categoria,
        estado: proveedor.estado,
        especialidad: proveedor.especialidad || undefined,
        contacto_principal: proveedor.contacto_principal,
        email: proveedor.email,
        telefono: proveedor.telefono || '',
        telefono_alternativo: proveedor.telefono_alternativo || '',
        direccion: proveedor.direccion || '',
        ciudad: proveedor.ciudad || '',
        estado_geo: proveedor.estado_geo || '',
        codigo_postal: proveedor.codigo_postal || '',
        sitio_web: proveedor.sitio_web || '',
        banco: proveedor.banco || '',
        cuenta_bancaria: proveedor.cuenta_bancaria || '',
        clabe: proveedor.clabe || '',
        numero_licencia: proveedor.numero_licencia || '',
        tiene_seguro: proveedor.tiene_seguro,
        aseguradora: proveedor.aseguradora || '',
        numero_poliza: proveedor.numero_poliza || '',
        vigencia_seguro: proveedor.vigencia_seguro || '',
        condiciones_pago: proveedor.condiciones_pago || '',
        dias_credito: proveedor.dias_credito,
        descuento_pronto_pago: proveedor.descuento_pronto_pago,
        tiempo_entrega_dias: proveedor.tiempo_entrega_dias || undefined,
        calificacion: proveedor.calificacion,
        preferido: proveedor.preferido,
        notas: proveedor.notas || '',
      })
    }
  }, [proveedor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.razon_social || !form.contacto_principal || !form.email) {
      setError('Complete los campos requeridos')
      return
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(form)
      } else {
        await createMutation.mutateAsync(form)
      }
      onClose()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        const firstError = detail[0]
        if (firstError?.msg) {
          const field = firstError.loc?.[1] || 'campo'
          setError(`${field}: ${firstError.msg}`)
        } else {
          setError('Error de validación')
        }
      } else {
        setError('Error al guardar el proveedor')
      }
    }
  }

  const handleChange = (field: keyof ProveedorCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const sections = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'contacto', label: 'Contacto', icon: User },
    { id: 'direccion', label: 'Dirección', icon: MapPin },
    { id: 'bancario', label: 'Bancario', icon: CreditCard },
    { id: 'comercial', label: 'Comercial', icon: Clock },
    ...(isManoDeObra ? [{ id: 'contratista', label: 'Contratista', icon: Wrench }] : []),
    { id: 'notas', label: 'Notas', icon: FileText },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              {isManoDeObra ? (
                <Wrench size={20} className="text-primary-600" />
              ) : (
                <Building2 size={20} className="text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              {form.categoria && (
                <p className="text-sm text-secondary-500">
                  {categoriaLabels[form.categoria]}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-secondary-100 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Sección: General */}
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Razón Social / Nombre *
                    </label>
                    <input
                      type="text"
                      value={form.razon_social}
                      onChange={(e) => handleChange('razon_social', e.target.value)}
                      className="input-field w-full"
                      placeholder="Nombre de la empresa o persona"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Nombre Comercial
                    </label>
                    <input
                      type="text"
                      value={form.nombre_comercial}
                      onChange={(e) => handleChange('nombre_comercial', e.target.value)}
                      className="input-field w-full"
                      placeholder="Nombre comercial (opcional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={form.categoria}
                      onChange={(e) => handleChange('categoria', e.target.value as CategoriaProveedor)}
                      className="input-field w-full"
                      required
                    >
                      {Object.entries(categoriaLabels).map(([value, label]) => (
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
                      onChange={(e) => handleChange('estado', e.target.value as EstadoProveedor)}
                      className="input-field w-full"
                    >
                      {Object.entries(estadoProveedorLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      RFC / ID Fiscal
                    </label>
                    <input
                      type="text"
                      value={form.rfc}
                      onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
                      className="input-field w-full font-mono"
                      maxLength={13}
                      placeholder="XXXX000000XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Calificación
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => handleChange('calificacion', star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={
                              star <= (hoveredStar || form.calificacion || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-secondary-500">
                        {form.calificacion ? `${form.calificacion}/5` : 'Sin calificar'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-secondary-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.preferido}
                      onChange={(e) => handleChange('preferido', e.target.checked)}
                      className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                      <Heart size={18} className={form.preferido ? 'fill-red-500 text-red-500' : 'text-secondary-400'} />
                      <span className="font-medium text-secondary-700">Marcar como proveedor preferido</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Sección: Contacto */}
            {activeSection === 'contacto' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Persona de Contacto *
                  </label>
                  <input
                    type="text"
                    value={form.contacto_principal}
                    onChange={(e) => handleChange('contacto_principal', e.target.value)}
                    className="input-field w-full"
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="input-field w-full"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Teléfono Principal
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    className="input-field w-full"
                    placeholder="(55) 1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Teléfono Alternativo
                  </label>
                  <input
                    type="tel"
                    value={form.telefono_alternativo}
                    onChange={(e) => handleChange('telefono_alternativo', e.target.value)}
                    className="input-field w-full"
                    placeholder="(55) 1234-5678"
                  />
                </div>
              </div>
            )}

            {/* Sección: Dirección */}
            {activeSection === 'direccion' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    className="input-field w-full"
                    placeholder="Calle, número, colonia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => handleChange('ciudad', e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={form.estado_geo}
                    onChange={(e) => handleChange('estado_geo', e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={form.codigo_postal}
                    onChange={(e) => handleChange('codigo_postal', e.target.value)}
                    className="input-field w-full"
                    maxLength={10}
                    placeholder="00000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={form.sitio_web}
                    onChange={(e) => handleChange('sitio_web', e.target.value)}
                    className="input-field w-full"
                    placeholder="https://www.ejemplo.com"
                  />
                </div>
              </div>
            )}

            {/* Sección: Bancario */}
            {activeSection === 'bancario' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={form.banco}
                    onChange={(e) => handleChange('banco', e.target.value)}
                    className="input-field w-full"
                    placeholder="Nombre del banco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    value={form.cuenta_bancaria}
                    onChange={(e) => handleChange('cuenta_bancaria', e.target.value)}
                    className="input-field w-full font-mono"
                    placeholder="0000000000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    CLABE Interbancaria
                  </label>
                  <input
                    type="text"
                    value={form.clabe}
                    onChange={(e) => handleChange('clabe', e.target.value)}
                    className="input-field w-full font-mono"
                    maxLength={18}
                    placeholder="000000000000000000"
                  />
                  <p className="text-xs text-secondary-400 mt-1">18 dígitos</p>
                </div>
              </div>
            )}

            {/* Sección: Comercial */}
            {activeSection === 'comercial' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Días de Crédito
                  </label>
                  <input
                    type="number"
                    value={form.dias_credito}
                    onChange={(e) => handleChange('dias_credito', parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Descuento Pronto Pago (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.descuento_pronto_pago}
                    onChange={(e) => handleChange('descuento_pronto_pago', parseFloat(e.target.value) || 0)}
                    className="input-field w-full"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Tiempo de Entrega (días)
                  </label>
                  <input
                    type="number"
                    value={form.tiempo_entrega_dias || ''}
                    onChange={(e) => handleChange('tiempo_entrega_dias', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="input-field w-full"
                    min={0}
                    placeholder="Opcional"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Condiciones de Pago Adicionales
                  </label>
                  <textarea
                    value={form.condiciones_pago}
                    onChange={(e) => handleChange('condiciones_pago', e.target.value)}
                    className="input-field w-full"
                    rows={2}
                    placeholder="Condiciones especiales de pago..."
                  />
                </div>
              </div>
            )}

            {/* Sección: Contratista (solo para mano de obra) */}
            {activeSection === 'contratista' && isManoDeObra && (
              <div className="space-y-6">
                {/* Especialidad y Licencia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Especialidad
                    </label>
                    <select
                      value={form.especialidad || ''}
                      onChange={(e) => handleChange('especialidad', e.target.value as EspecialidadContratista || undefined)}
                      className="input-field w-full"
                    >
                      <option value="">Seleccionar especialidad</option>
                      {Object.entries(especialidadLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Número de Licencia
                    </label>
                    <input
                      type="text"
                      value={form.numero_licencia}
                      onChange={(e) => handleChange('numero_licencia', e.target.value)}
                      className="input-field w-full font-mono"
                      placeholder="Licencia profesional (opcional)"
                    />
                  </div>
                </div>

                {/* Seguro */}
                <div className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield size={20} className={form.tiene_seguro ? 'text-green-600' : 'text-secondary-400'} />
                      <span className="font-medium text-secondary-700">Información de Seguro</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.tiene_seguro}
                        onChange={(e) => handleChange('tiene_seguro', e.target.checked)}
                        className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-600">Tiene seguro</span>
                    </label>
                  </div>

                  {form.tiene_seguro && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-secondary-100">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Aseguradora
                        </label>
                        <input
                          type="text"
                          value={form.aseguradora}
                          onChange={(e) => handleChange('aseguradora', e.target.value)}
                          className="input-field w-full"
                          placeholder="Nombre de la aseguradora"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Número de Póliza
                        </label>
                        <input
                          type="text"
                          value={form.numero_poliza}
                          onChange={(e) => handleChange('numero_poliza', e.target.value)}
                          className="input-field w-full font-mono"
                          placeholder="POL-000000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Vigencia del Seguro
                        </label>
                        <input
                          type="date"
                          value={form.vigencia_seguro}
                          onChange={(e) => handleChange('vigencia_seguro', e.target.value)}
                          className="input-field w-full"
                        />
                      </div>
                    </div>
                  )}

                  {!form.tiene_seguro && (
                    <div className="text-center py-4 text-secondary-400">
                      <Shield size={32} className="mx-auto mb-2 text-secondary-300" />
                      <p className="text-sm">Active la casilla para registrar información del seguro</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección: Notas */}
            {activeSection === 'notas' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  value={form.notas}
                  onChange={(e) => handleChange('notas', e.target.value)}
                  className="input-field w-full"
                  rows={6}
                  placeholder="Información adicional sobre el proveedor, observaciones, acuerdos especiales..."
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-200 bg-secondary-50">
            <div className="flex items-center gap-2">
              {form.preferido && (
                <Badge variant="error" size="sm">
                  <Heart size={12} className="mr-1" /> Preferido
                </Badge>
              )}
              {form.tiene_seguro && (
                <Badge variant="success" size="sm">
                  <Shield size={12} className="mr-1" /> Asegurado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Guardando...'
                  : isEditing
                    ? 'Guardar Cambios'
                    : 'Agregar Proveedor'
                }
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
