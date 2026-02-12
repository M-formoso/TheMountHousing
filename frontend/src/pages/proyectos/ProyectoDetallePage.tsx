import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Calendar, MapPin, DollarSign, TrendingUp } from 'lucide-react'
import { useProyecto, useProyectoFases, useProyectoBitacora, useCreateBitacora, useUpdateFase, useProyectoDashboard } from '@/services/proyectos.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useState } from 'react'
import type { FaseProyecto } from '@/types/proyecto'

const tipoLabels: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  industrial: 'Industrial',
  remodelacion: 'Remodelación',
  obra_civil: 'Obra Civil',
}

const estadoLabels: Record<string, string> = {
  cotizacion: 'Cotización',
  adjudicado: 'Adjudicado',
  en_construccion: 'En Construcción',
  pausado: 'Pausado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
}

const estadoColors: Record<string, string> = {
  cotizacion: 'bg-info text-white',
  adjudicado: 'bg-warning text-white',
  en_construccion: 'bg-primary-500 text-white',
  pausado: 'bg-secondary-400 text-white',
  finalizado: 'bg-success text-white',
  cancelado: 'bg-error text-white',
}

const estadoFaseColors: Record<string, string> = {
  pendiente: 'bg-secondary-200 text-secondary-700',
  en_ejecucion: 'bg-primary-200 text-primary-700',
  completada: 'bg-green-100 text-green-700',
  suspendida: 'bg-yellow-100 text-yellow-700',
}

export default function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: proyecto, isLoading, error } = useProyecto(id!)
  const { data: fases, refetch: refetchFases } = useProyectoFases(id!)
  const { data: bitacora, refetch: refetchBitacora } = useProyectoBitacora(id!, { limit: 20 })
  const { data: dashboard } = useProyectoDashboard(id!)
  const createBitacora = useCreateBitacora(id!)

  const [showBitacoraForm, setShowBitacoraForm] = useState(false)
  const [nuevaEntrada, setNuevaEntrada] = useState({ contenido: '', clima: '', temperatura: '', trabajadores_presentes: '', notas: '' })

  const [editingFaseId, setEditingFaseId] = useState<string | null>(null)
  const [editFase, setEditFase] = useState({ progreso: 0, estado: '' })

  if (isLoading) return <LoadingSpinner />
  if (error || !proyecto) return <ErrorMessage message="Proyecto no encontrado" />

  const handleSaveBitacora = async () => {
    if (!nuevaEntrada.contenido.trim()) return
    await createBitacora.mutateAsync({
      contenido: nuevaEntrada.contenido,
      clima: nuevaEntrada.clima || undefined,
      temperatura: nuevaEntrada.temperatura ? Number(nuevaEntrada.temperatura) : undefined,
      trabajadores_presentes: nuevaEntrada.trabajadores_presentes ? Number(nuevaEntrada.trabajadores_presentes) : undefined,
      notas: nuevaEntrada.notas || undefined,
    })
    setNuevaEntrada({ contenido: '', clima: '', temperatura: '', trabajadores_presentes: '', notas: '' })
    setShowBitacoraForm(false)
    refetchBitacora()
  }

  const handleEditFaseClick = (fase: FaseProyecto) => {
    setEditingFaseId(fase.id)
    setEditFase({ progreso: fase.progreso, estado: fase.estado })
  }

  const handleSaveFase = async (faseId: string) => {
    const updateFase = (await import('@/services/proyectos.service')).useUpdateFase
    // Direct API call instead of hook (can't call hooks dynamically)
    const { default: api } = await import('@/lib/axios')
    await api.put(`/api/v1/proyectos/${id}/fases/${faseId}`, {
      progreso: editFase.progreso,
      estado: editFase.estado,
    })
    setEditingFaseId(null)
    refetchFases()
  }

  const varianzaPresupuesto = proyecto.costo_real - proyecto.presupuesto_total
  const varianzaPercent = proyecto.presupuesto_total > 0 ? ((proyecto.costo_real / proyecto.presupuesto_total) - 1) * 100 : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/proyectos')} className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-500">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-secondary-900">{proyecto.nombre}</h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${estadoColors[proyecto.estado] || 'bg-secondary-200 text-secondary-700'}`}>
              {estadoLabels[proyecto.estado]}
            </span>
          </div>
          <p className="text-secondary-500 text-sm mt-0.5">{proyecto.codigo} · {tipoLabels[proyecto.tipo]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Información General */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Información General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Tipo" value={tipoLabels[proyecto.tipo]} />
              <InfoField label="Estado" value={estadoLabels[proyecto.estado]} />
              <InfoField label="Dirección" value={proyecto.direccion || '—'} icon={<MapPin size={14} />} />
              <InfoField label="Ciudad" value={[proyecto.ciudad, proyecto.estado_geo].filter(Boolean).join(', ') || '—'} />
              <InfoField label="Área" value={proyecto.area_construccion_m2 ? `${proyecto.area_construccion_m2} m²` : '—'} />
              <InfoField label="Fecha inicio" value={proyecto.fecha_inicio ? formatDate(proyecto.fecha_inicio) : '—'} icon={<Calendar size={14} />} />
              <InfoField label="Fecha fin estimada" value={proyecto.fecha_fin_estimada ? formatDate(proyecto.fecha_fin_estimada) : '—'} />
              <InfoField label="Fecha fin real" value={proyecto.fecha_fin_real ? formatDate(proyecto.fecha_fin_real) : '—'} />
            </div>
            {proyecto.notas && (
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Notas</p>
                <p className="text-sm text-secondary-600">{proyecto.notas}</p>
              </div>
            )}
          </div>

          {/* Fases del proyecto */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">Fases</h2>
            {fases && fases.length > 0 ? (
              <div className="space-y-3">
                {fases.map((fase) => (
                  <div key={fase.id} className="border border-secondary-200 rounded-lg p-4">
                    {editingFaseId === fase.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-secondary-700 w-24 shrink-0">Progreso</span>
                          <input
                            type="range" min="0" max="100" value={editFase.progreso}
                            onChange={(e) => setEditFase((p) => ({ ...p, progreso: Number(e.target.value) }))}
                            className="flex-1"
                          />
                          <span className="text-sm font-semibold text-secondary-800 w-10 text-right">{editFase.progreso}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-secondary-700 w-24 shrink-0">Estado</span>
                          <select
                            value={editFase.estado}
                            onChange={(e) => setEditFase((p) => ({ ...p, estado: e.target.value }))}
                            className="input-field flex-1 text-sm"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_ejecucion">En Ejecución</option>
                            <option value="completada">Completada</option>
                            <option value="suspendida">Suspendida</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveFase(fase.id)} className="btn-primary text-sm">Guardar</button>
                          <button onClick={() => setEditingFaseId(null)} className="btn-ghost text-sm">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-secondary-800">Fase {fase.numero_fase}: {fase.nombre}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${estadoFaseColors[fase.estado] || 'bg-secondary-100 text-secondary-600'}`}>
                              {fase.estado === 'pendiente' ? 'Pendiente' : fase.estado === 'en_ejecucion' ? 'En Ejecución' : fase.estado === 'completada' ? 'Completada' : 'Suspendida'}
                            </span>
                          </div>
                          <button onClick={() => handleEditFaseClick(fase)} className="text-xs text-primary-500 hover:text-primary-700">Editar</button>
                        </div>
                        <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${fase.progreso}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-secondary-500">{fase.descripcion || ''}</p>
                          <p className="text-xs text-secondary-500">{fase.progreso}%</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-400 text-sm text-center py-4">No hay fases registradas</p>
            )}
          </div>

          {/* Bitácora */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-800">Bitácora</h2>
              <button onClick={() => setShowBitacoraForm(!showBitacoraForm)} className="btn-outline text-sm flex items-center gap-1">
                <Plus size={14} /> Nueva entrada
              </button>
            </div>

            {showBitacoraForm && (
              <div className="border border-secondary-200 rounded-lg p-4 mb-4 space-y-3">
                <textarea
                  placeholder="Descripción de la entrada *"
                  value={nuevaEntrada.contenido}
                  onChange={(e) => setNuevaEntrada((p) => ({ ...p, contenido: e.target.value }))}
                  rows={3}
                  className="input-field w-full resize-none"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input type="text" placeholder="Clima" value={nuevaEntrada.clima} onChange={(e) => setNuevaEntrada((p) => ({ ...p, clima: e.target.value }))} className="input-field" />
                  <input type="number" placeholder="Temp °C" value={nuevaEntrada.temperatura} onChange={(e) => setNuevaEntrada((p) => ({ ...p, temperatura: e.target.value }))} className="input-field" />
                  <input type="number" placeholder="Trabajadores" value={nuevaEntrada.trabajadores_presentes} onChange={(e) => setNuevaEntrada((p) => ({ ...p, trabajadores_presentes: e.target.value }))} className="input-field" />
                  <input type="text" placeholder="Notas" value={nuevaEntrada.notas} onChange={(e) => setNuevaEntrada((p) => ({ ...p, notas: e.target.value }))} className="input-field" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveBitacora} className="btn-primary text-sm">Guardar</button>
                  <button onClick={() => setShowBitacoraForm(false)} className="btn-ghost text-sm">Cancelar</button>
                </div>
              </div>
            )}

            {bitacora && bitacora.length > 0 ? (
              <div className="space-y-3">
                {bitacora.map((entrada) => (
                  <div key={entrada.id} className="p-3 rounded-lg border border-secondary-100 bg-secondary-50">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-sm text-secondary-800">{entrada.contenido}</p>
                      <p className="text-xs text-secondary-400 shrink-0 ml-3">{formatDate(entrada.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {entrada.clima && <span className="text-xs text-secondary-500">Clima: {entrada.clima}</span>}
                      {entrada.temperatura != null && <span className="text-xs text-secondary-500">Temp: {entrada.temperatura}°C</span>}
                      {entrada.trabajadores_presentes != null && <span className="text-xs text-secondary-500">Trabajadores: {entrada.trabajadores_presentes}</span>}
                      {entrada.notas && <span className="text-xs text-secondary-500">Notas: {entrada.notas}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-400 text-sm text-center py-4">No hay entradas en la bitácora</p>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Progreso general */}
          <div className="card p-5">
            <h3 className="font-semibold text-secondary-800 mb-3">Progreso General</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold text-primary-600">{proyecto.progreso_general}%</span>
              <span className="text-secondary-400 text-sm mb-1">completado</span>
            </div>
            <div className="w-full h-3 bg-secondary-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${proyecto.progreso_general}%` }} />
            </div>
          </div>

          {/* Presupuesto */}
          <div className="card p-5">
            <h3 className="font-semibold text-secondary-800 mb-3 flex items-center gap-2">
              <DollarSign size={16} /> Presupuesto
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Presupuesto total</span>
                <span className="text-sm font-medium text-secondary-700">${formatMoney(proyecto.presupuesto_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Costo real</span>
                <span className="text-sm font-medium text-secondary-700">${formatMoney(proyecto.costo_real)}</span>
              </div>
              <div className="border-t border-secondary-200 pt-2 flex justify-between">
                <span className="text-sm text-secondary-500">Varianza</span>
                <span className={`text-sm font-semibold ${varianzaPresupuesto > 0 ? 'text-error' : varianzaPresupuesto < 0 ? 'text-success' : 'text-secondary-700'}`}>
                  {varianzaPresupuesto >= 0 ? '+' : ''}{formatMoney(varianzaPresupuesto)} ({varianzaPercent >= 0 ? '+' : ''}{varianzaPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-500">Margen esperado</span>
                <span className="text-sm font-medium text-secondary-700">{proyecto.margen_ganancia_esperado}%</span>
              </div>
            </div>
          </div>

          {/* Resumen fases (dashboard) */}
          {dashboard && (
            <div className="card p-5">
              <h3 className="font-semibold text-secondary-800 mb-3 flex items-center gap-2">
                <TrendingUp size={16} /> Resumen
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-secondary-500">Total fases</p>
                  <p className="text-lg font-bold text-secondary-800">{dashboard.total_fases ?? '—'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600">Completadas</p>
                  <p className="text-lg font-bold text-green-700">{dashboard.fases_completadas ?? '—'}</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-primary-600">En ejecución</p>
                  <p className="text-lg font-bold text-primary-700">{dashboard.fases_en_ejecucion ?? '—'}</p>
                </div>
                <div className="bg-secondary-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-secondary-500">Pendientes</p>
                  <p className="text-lg font-bold text-secondary-800">{dashboard.fases_pendientes ?? '—'}</p>
                </div>
              </div>
            </div>
          )}
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

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(amount: number): string {
  return Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })
}
