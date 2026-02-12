import { useState } from 'react'
import { useProyectos } from '@/services/proyectos.service'
import { useIngresos, useEgresos } from '@/services/finanzas.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function ReportesPage() {
  const [proyecto, setProyecto] = useState('')

  const { data: proyectos, isLoading: loadingProyectos } = useProyectos({ limit: 100 })
  const { data: ingresos } = useIngresos({ proyecto_id: proyecto || undefined, limit: 100 })
  const { data: egresos } = useEgresos({ proyecto_id: proyecto || undefined, limit: 100 })

  if (loadingProyectos) return <LoadingSpinner />

  const totalIngresos = (ingresos?.items ?? []).reduce((acc, i) => acc + i.monto, 0)
  const totalEgresos = (egresos?.items ?? []).reduce((acc, e) => acc + e.monto, 0)
  const balance = totalIngresos - totalEgresos

  const proyectosList = proyectos?.items ?? []

  // Agrupa egresos por categoría
  const egresoPorCategoria: Record<string, number> = {}
  ;(egresos?.items ?? []).forEach((e) => {
    egresoPorCategoria[e.categoria] = (egresoPorCategoria[e.categoria] || 0) + e.monto
  })

  const catLabels: Record<string, string> = {
    materiales: 'Materiales', mano_obra: 'Mano de Obra', subcontratistas: 'Subcontratistas',
    maquinaria: 'Maquinaria', gastos_generales: 'Gastos Generales', impuestos: 'Impuestos', otros: 'Otros',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Reportes</h1>
      </div>

      {/* Filtro proyecto */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-secondary-600 whitespace-nowrap">Filtrar por proyecto</label>
          <select value={proyecto} onChange={(e) => setProyecto(e.target.value)} className="input-field flex-1">
            <option value="">Todos los proyectos</option>
            {proyectosList.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Total Ingresos</p>
          <p className="text-2xl font-bold text-success">${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Total Egresos</p>
          <p className="text-2xl font-bold text-error">${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-error'}`}>${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Desglose egresos por categoría */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-800 mb-4">Egresos por Categoría</h2>
        {Object.keys(egresoPorCategoria).length === 0 ? (
          <p className="text-secondary-400 text-sm text-center py-4">No hay datos de egresos</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(egresoPorCategoria)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, monto]) => {
                const pct = totalEgresos > 0 ? (monto / totalEgresos) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-700">{catLabels[cat] || cat}</span>
                      <span className="text-secondary-600">${monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
