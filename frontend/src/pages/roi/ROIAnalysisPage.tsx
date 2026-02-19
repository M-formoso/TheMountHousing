import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calculator, Save, DollarSign, TrendingUp, Target, Percent,
  Building2, Ruler, Home, Tag, PiggyBank, BarChart3,
} from 'lucide-react'
import api from '@/lib/axios'

interface ProjectConfig {
  id: string
  nombre_proyecto: string
  costo_terreno: number
  superficie_terreno: number
  superficie_construible: number
  total_departamentos: number
  tamano_promedio_depto: number
  precio_venta_m2: number
  gastos_legales: number
  gastos_comercializacion: number
  gastos_financieros: number
  imprevistos: number
}

interface ROIAnalysis {
  config: ProjectConfig
  costo_terreno: number
  costo_construccion: number
  costo_total: number
  incidencia_terreno: number
  evaluacion_incidencia: string
  costo_por_m2: number
  ingresos_totales: number
  ganancia_neta: number
  roi: number
  margen_ganancia: number
  relacion_costo_venta: number
  precio_venta_promedio: number
  costo_promedio_unidad: number
  ganancia_por_unidad: number
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`

export default function ROIAnalysisPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Partial<ProjectConfig>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Obtener análisis ROI
  const { data: analysis, isLoading } = useQuery<ROIAnalysis>({
    queryKey: ['roi-analysis'],
    queryFn: async () => {
      const res = await api.get('/api/v1/roi/analysis')
      return res.data
    },
  })

  // Inicializar form con config actual
  useEffect(() => {
    if (analysis?.config) {
      setFormData(analysis.config)
    }
  }, [analysis])

  // Mutación para guardar config
  const saveMutation = useMutation({
    mutationFn: (data: Partial<ProjectConfig>) =>
      api.put('/api/v1/roi/config', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roi-analysis'] })
      setHasChanges(false)
    },
  })

  const handleChange = (field: keyof ProjectConfig, value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData((prev) => ({ ...prev, [field]: numValue }))
    setHasChanges(true)
  }

  const handleSave = () => {
    saveMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-secondary-500">Cargando análisis ROI...</div>
      </div>
    )
  }

  const data = analysis!

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-2">
            <Calculator className="text-primary-600" />
            Análisis ROI
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            Análisis de rentabilidad del proyecto
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          className={`btn-primary flex items-center gap-2 ${
            !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} />
          {saveMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* SECCIÓN: DATOS DEL PROYECTO */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-primary-600" />
          Datos del Proyecto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Costo del Terreno ($)
            </label>
            <input
              type="number"
              value={formData.costo_terreno || ''}
              onChange={(e) => handleChange('costo_terreno', e.target.value)}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Superficie Terreno (m²)
            </label>
            <input
              type="number"
              value={formData.superficie_terreno || ''}
              onChange={(e) => handleChange('superficie_terreno', e.target.value)}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Superficie Construible (m²)
            </label>
            <input
              type="number"
              value={formData.superficie_construible || ''}
              onChange={(e) => handleChange('superficie_construible', e.target.value)}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Total Departamentos
            </label>
            <input
              type="number"
              value={formData.total_departamentos || ''}
              onChange={(e) => handleChange('total_departamentos', e.target.value)}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Tamaño Prom. Depto (m²)
            </label>
            <input
              type="number"
              value={formData.tamano_promedio_depto || ''}
              onChange={(e) => handleChange('tamano_promedio_depto', e.target.value)}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Precio Venta/m² ($)
            </label>
            <input
              type="number"
              value={formData.precio_venta_m2 || ''}
              onChange={(e) => handleChange('precio_venta_m2', e.target.value)}
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN: DESGLOSE DE COSTOS + INCIDENCIA TERRENO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desglose de Costos */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
            <PiggyBank size={20} className="text-amber-600" />
            Desglose de Costos
          </h2>
          <div className="space-y-4">
            {/* Costo del Terreno */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-secondary-600">Costo del Terreno</span>
                <span className="font-medium">{formatCurrency(data.costo_terreno)}</span>
              </div>
              <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{
                    width: `${data.costo_total > 0 ? (data.costo_terreno / data.costo_total) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="text-xs text-secondary-500 mt-1">
                {data.costo_total > 0
                  ? `${((data.costo_terreno / data.costo_total) * 100).toFixed(1)}% del costo total`
                  : '0%'}
              </div>
            </div>

            {/* Construcción & Gastos */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-secondary-600">Construcción & Gastos</span>
                <span className="font-medium">{formatCurrency(data.costo_construccion)}</span>
              </div>
              <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                  style={{
                    width: `${data.costo_total > 0 ? (data.costo_construccion / data.costo_total) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="text-xs text-secondary-500 mt-1">
                {data.costo_total > 0
                  ? `${((data.costo_construccion / data.costo_total) * 100).toFixed(1)}% del costo total`
                  : '0%'}
              </div>
            </div>

            {/* Costo Total */}
            <div className="pt-4 border-t border-secondary-200">
              <div className="flex justify-between items-center">
                <span className="text-secondary-800 font-semibold">Costo Total del Proyecto</span>
                <span className="text-2xl font-bold text-secondary-900">
                  {formatCurrency(data.costo_total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Incidencia del Terreno */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
            <Ruler size={20} className="text-orange-600" />
            Incidencia del Terreno
          </h2>
          {/* Círculo indicador */}
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(data.incidencia_terreno / 100) * 440} 440`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-secondary-800">
                {formatPercent(data.incidencia_terreno)}
              </span>
            </div>
          </div>
          <div
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              data.incidencia_terreno < 20
                ? 'bg-green-100 text-green-700'
                : data.incidencia_terreno <= 30
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {data.evaluacion_incidencia}
          </div>
        </div>
      </div>

      {/* SECCIÓN: MÉTRICAS CLAVE (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Costo por m² */}
        <div className="card p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">Costo por m²</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(data.costo_por_m2)}</div>
        </div>

        {/* Ingresos Totales */}
        <div className="card p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">Ingresos Totales</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(data.ingresos_totales)}</div>
        </div>

        {/* Ganancia Neta */}
        <div className="card p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">Ganancia Neta</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(data.ganancia_neta)}</div>
        </div>

        {/* ROI */}
        <div className="card p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Percent size={24} />
            </div>
            <span className="text-sm font-medium opacity-90">ROI</span>
          </div>
          <div className="text-2xl font-bold">{formatPercent(data.roi)}</div>
        </div>
      </div>

      {/* SECCIÓN: ANÁLISIS DE RENTABILIDAD + POR UNIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de Rentabilidad */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-600" />
            Análisis de Rentabilidad
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-secondary-700">Margen de Ganancia</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatPercent(data.margen_ganancia)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-secondary-700">ROI (Retorno de Inversión)</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPercent(data.roi)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-secondary-700">Relación Costo/Venta</span>
              <span className="text-xl font-bold text-purple-600">
                {data.relacion_costo_venta.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        {/* Por Unidad */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
            <Home size={20} className="text-blue-600" />
            Por Unidad (Promedio)
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
              <span className="text-secondary-700">Precio Venta Promedio</span>
              <span className="text-xl font-bold text-secondary-800">
                {formatCurrency(data.precio_venta_promedio)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
              <span className="text-secondary-700">Costo Promedio</span>
              <span className="text-xl font-bold text-secondary-800">
                {formatCurrency(data.costo_promedio_unidad)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <span className="text-secondary-700 font-medium">Ganancia por Unidad</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(data.ganancia_por_unidad)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: GASTOS ADICIONALES (colapsable) */}
      <details className="card">
        <summary className="p-4 cursor-pointer hover:bg-secondary-50 rounded-t-xl font-semibold text-secondary-800 flex items-center gap-2">
          <Tag size={20} className="text-secondary-600" />
          Gastos Adicionales (opcional)
        </summary>
        <div className="p-6 pt-2 border-t border-secondary-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Gastos Legales ($)
              </label>
              <input
                type="number"
                value={formData.gastos_legales || ''}
                onChange={(e) => handleChange('gastos_legales', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Comercialización ($)
              </label>
              <input
                type="number"
                value={formData.gastos_comercializacion || ''}
                onChange={(e) => handleChange('gastos_comercializacion', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Gastos Financieros ($)
              </label>
              <input
                type="number"
                value={formData.gastos_financieros || ''}
                onChange={(e) => handleChange('gastos_financieros', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Imprevistos ($)
              </label>
              <input
                type="number"
                value={formData.imprevistos || ''}
                onChange={(e) => handleChange('imprevistos', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
