import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Mail, Phone, MapPin } from 'lucide-react'
import { useCliente, useUpdateCliente, useClienteContactos, useCreateContacto, useClienteProyectos } from '@/services/clientes.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useState } from 'react'

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cliente, isLoading, error, refetch } = useCliente(id!)
  const { data: contactos, refetch: refetchContactos } = useClienteContactos(id!)
  const { data: proyectosData } = useClienteProyectos(id!)
  const updateMutation = useUpdateCliente(id!)
  const createContacto = useCreateContacto(id!)

  const [showContactoForm, setShowContactoForm] = useState(false)
  const [nuevoContacto, setNuevoContacto] = useState({ nombre: '', puesto: '', email: '', telefono: '' })

  if (isLoading) return <LoadingSpinner />
  if (error || !cliente) return <ErrorMessage message="Cliente no encontrado" />

  const handleSaveContacto = async () => {
    if (!nuevoContacto.nombre) return
    await createContacto.mutateAsync({
      nombre: nuevoContacto.nombre,
      puesto: nuevoContacto.puesto || undefined,
      email: nuevoContacto.email || undefined,
      telefono: nuevoContacto.telefono || undefined,
    })
    setNuevoContacto({ nombre: '', puesto: '', email: '', telefono: '' })
    setShowContactoForm(false)
    refetchContactos()
  }

  const tipoLabels: Record<string, string> = {
    persona_fisica: 'Persona Física',
    persona_moral: 'Persona Moral',
    gobierno: 'Gobierno',
  }

  return (
    <div>
      {/* Header con botón atrás */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/clientes')} className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{cliente.nombre}</h1>
          <p className="text-secondary-500 text-sm">{tipoLabels[cliente.tipo]} · {cliente.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del cliente */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Información General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Tipo" value={tipoLabels[cliente.tipo]} />
              <InfoField label="RFC" value={cliente.rfc || '—'} />
              <InfoField label="Email" value={cliente.email} icon={<Mail size={14} />} />
              <InfoField label="Teléfono" value={cliente.telefono || '—'} icon={<Phone size={14} />} />
              <InfoField label="Ciudad" value={cliente.ciudad || '—'} />
              <InfoField label="Estado" value={cliente.estado_geo || '—'} />
              {cliente.tipo === 'persona_moral' && (
                <>
                  <InfoField label="Representante Legal" value={cliente.representante_legal || '—'} />
                  <InfoField label="Giro Empresarial" value={cliente.giro_empresarial || '—'} />
                </>
              )}
            </div>
            {cliente.notas && (
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Notas</p>
                <p className="text-sm text-secondary-600">{cliente.notas}</p>
              </div>
            )}
          </div>

          {/* Contactos adicionales */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-800">Contactos</h2>
              <button onClick={() => setShowContactoForm(!showContactoForm)} className="btn-outline text-sm flex items-center gap-1">
                <Plus size={14} /> Agregar
              </button>
            </div>

            {showContactoForm && (
              <div className="border border-secondary-200 rounded-lg p-4 mb-4 space-y-3">
                <input
                  type="text" placeholder="Nombre *"
                  value={nuevoContacto.nombre}
                  onChange={(e) => setNuevoContacto((p) => ({ ...p, nombre: e.target.value }))}
                  className="input-field"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="Puesto" value={nuevoContacto.puesto} onChange={(e) => setNuevoContacto((p) => ({ ...p, puesto: e.target.value }))} className="input-field" />
                  <input type="email" placeholder="Email" value={nuevoContacto.email} onChange={(e) => setNuevoContacto((p) => ({ ...p, email: e.target.value }))} className="input-field" />
                  <input type="text" placeholder="Teléfono" value={nuevoContacto.telefono} onChange={(e) => setNuevoContacto((p) => ({ ...p, telefono: e.target.value }))} className="input-field" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveContacto} className="btn-primary text-sm">Guardar</button>
                  <button onClick={() => setShowContactoForm(false)} className="btn-ghost text-sm">Cancelar</button>
                </div>
              </div>
            )}

            {contactos && contactos.length > 0 ? (
              <div className="space-y-2">
                {contactos.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-secondary-100 hover:bg-secondary-50">
                    <div>
                      <p className="font-medium text-secondary-800 text-sm">{c.nombre}</p>
                      <p className="text-xs text-secondary-500">{c.puesto || 'Sin puesto'}</p>
                    </div>
                    <div className="text-right">
                      {c.email && <p className="text-xs text-secondary-500">{c.email}</p>}
                      {c.telefono && <p className="text-xs text-secondary-500">{c.telefono}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-400 text-sm text-center py-4">No hay contactos adicionales</p>
            )}
          </div>

          {/* Proyectos del cliente */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Proyectos</h2>
            {proyectosData?.items && proyectosData.items.length > 0 ? (
              <div className="space-y-2">
                {proyectosData.items.map((p: { id: string; codigo: string; nombre: string; estado: string; progreso_general: number }) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-secondary-100 hover:bg-secondary-50 cursor-pointer"
                    onClick={() => navigate(`/proyectos/${p.id}`)}
                  >
                    <div>
                      <p className="font-medium text-secondary-800 text-sm">{p.nombre}</p>
                      <p className="text-xs text-secondary-500">{p.codigo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${p.progreso_general}%` }} />
                      </div>
                      <span className="text-xs text-secondary-500">{p.progreso_general}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-400 text-sm text-center py-4">No hay proyectos asociados</p>
            )}
          </div>
        </div>

        {/* Panel lateral - resumen financiero */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-secondary-800 mb-3">Estado de Cuenta</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Estado</span>
                <span className={`text-sm font-medium ${
                  cliente.estado_cuenta === 'al_dia' ? 'text-green-600' :
                  cliente.estado_cuenta === 'debe' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {cliente.estado_cuenta === 'al_dia' ? 'Al día' : cliente.estado_cuenta === 'debe' ? 'Debe' : 'Crédito'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Límite de crédito</span>
                <span className="text-sm font-medium text-secondary-700">
                  ${Number(cliente.limite_credito).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Descuento especial</span>
                <span className="text-sm font-medium text-secondary-700">{cliente.descuento_especial}%</span>
              </div>
              {cliente.forma_pago_preferida && (
                <div className="flex justify-between">
                  <span className="text-sm text-secondary-500">Forma de pago</span>
                  <span className="text-sm font-medium text-secondary-700 capitalize">{cliente.forma_pago_preferida}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-secondary-800 mb-3">Calificación</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`text-lg ${n <= cliente.calificacion ? 'text-warning' : 'text-secondary-300'}`}>★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-secondary-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-secondary-700 flex items-center gap-1 mt-0.5">
        {icon} {value}
      </p>
    </div>
  )
}
