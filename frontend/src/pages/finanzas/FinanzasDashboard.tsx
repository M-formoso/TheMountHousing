import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle,
  ArrowRight, Calendar, Clock, Wallet, Receipt, FileText,
  CheckCircle2, AlertTriangle, PieChart
} from 'lucide-react'
import { useIngresos, useEgresos, useCuentasCobrar, useCuentasPagar } from '@/services/finanzas.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  tipoIngresoLabels, tipoIngresoColors,
  categoriaEgresoLabels, categoriaEgresoColors,
  estadoCuentaColors
} from '@/types/finanzas'

export default function FinanzasDashboard() {
  const { data: ingresosData, isLoading: loadingIngresos } = useIngresos({ limit: 100 })
  const { data: egresosData, isLoading: loadingEgresos } = useEgresos({ limit: 100 })
  const { data: cobrarData, isLoading: loadingCobrar } = useCuentasCobrar({ limit: 100 })
  const { data: pagarData, isLoading: loadingPagar } = useCuentasPagar({ limit: 100 })

  const isLoading = loadingIngresos || loadingEgresos || loadingCobrar || loadingPagar

  const ingresos = ingresosData?.items ?? []
  const egresos = egresosData?.items ?? []
  const cuentasCobrar = cobrarData?.items ?? []
  const cuentasPagar = pagarData?.items ?? []

  // Calculate totals
  const stats = useMemo(() => {
    const totalIngresos = ingresos.reduce((sum, i) => sum + Number(i.monto), 0)
    const totalEgresos = egresos.reduce((sum, e) => sum + Number(e.monto), 0)
    const balance = totalIngresos - totalEgresos

    const totalPorCobrar = cuentasCobrar.reduce((sum, c) => sum + Number(c.saldo), 0)
    const totalPorPagar = cuentasPagar.reduce((sum, c) => sum + Number(c.saldo), 0)

    const cuentasVencidas = cuentasCobrar.filter(c => c.estado === 'vencida').length +
      cuentasPagar.filter(c => c.estado === 'vencida').length

    // Last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const ingresosRecientes = ingresos.filter(i => new Date(i.fecha) >= thirtyDaysAgo)
      .reduce((sum, i) => sum + Number(i.monto), 0)
    const egresosRecientes = egresos.filter(e => new Date(e.fecha) >= thirtyDaysAgo)
      .reduce((sum, e) => sum + Number(e.monto), 0)

    return {
      totalIngresos,
      totalEgresos,
      balance,
      totalPorCobrar,
      totalPorPagar,
      cuentasVencidas,
      ingresosRecientes,
      egresosRecientes,
    }
  }, [ingresos, egresos, cuentasCobrar, cuentasPagar])

  // Egresos by category
  const egresosPorCategoria = useMemo(() => {
    const categorias: Record<string, number> = {}
    egresos.forEach(e => {
      categorias[e.categoria] = (categorias[e.categoria] || 0) + Number(e.monto)
    })
    return Object.entries(categorias)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [egresos])

  // Recent transactions
  const recentTransactions = useMemo(() => {
    const allTransactions = [
      ...ingresos.map(i => ({ ...i, type: 'ingreso' as const })),
      ...egresos.map(e => ({ ...e, type: 'egreso' as const })),
    ]
    return allTransactions
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 8)
  }, [ingresos, egresos])

  // Upcoming payments (vencidas o por vencer)
  const upcomingPayments = useMemo(() => {
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    return cuentasPagar
      .filter(c => c.estado !== 'pagada' && c.fecha_vencimiento)
      .sort((a, b) => new Date(a.fecha_vencimiento!).getTime() - new Date(b.fecha_vencimiento!).getTime())
      .slice(0, 5)
  }, [cuentasPagar])

  // Pending collections
  const pendingCollections = useMemo(() => {
    return cuentasCobrar
      .filter(c => c.estado !== 'pagada')
      .sort((a, b) => Number(b.saldo) - Number(a.saldo))
      .slice(0, 5)
  }, [cuentasCobrar])

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Panel de Finanzas</h1>
        <p className="text-secondary-500 mt-1">Resumen financiero general del proyecto</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <Badge variant="success" size="sm">Ingresos</Badge>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIngresos)}</p>
          <p className="text-sm text-secondary-500 mt-1">Total de ingresos</p>
          <div className="mt-3 pt-3 border-t border-secondary-100">
            <p className="text-xs text-secondary-400">Últimos 30 días</p>
            <p className="text-sm font-medium text-green-600">{formatCurrency(stats.ingresosRecientes)}</p>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={24} className="text-red-600" />
            </div>
            <Badge variant="error" size="sm">Egresos</Badge>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalEgresos)}</p>
          <p className="text-sm text-secondary-500 mt-1">Total de egresos</p>
          <div className="mt-3 pt-3 border-t border-secondary-100">
            <p className="text-xs text-secondary-400">Últimos 30 días</p>
            <p className="text-sm font-medium text-red-600">{formatCurrency(stats.egresosRecientes)}</p>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 ${stats.balance >= 0 ? 'bg-blue-100' : 'bg-amber-100'} rounded-xl flex items-center justify-center`}>
              <Wallet size={24} className={stats.balance >= 0 ? 'text-blue-600' : 'text-amber-600'} />
            </div>
            <Badge variant={stats.balance >= 0 ? 'info' : 'warning'} size="sm">Balance</Badge>
          </div>
          <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
            {formatCurrency(stats.balance)}
          </p>
          <p className="text-sm text-secondary-500 mt-1">Utilidad/Pérdida</p>
          <div className="mt-3 pt-3 border-t border-secondary-100">
            <div className="flex items-center gap-1">
              {stats.balance >= 0 ? (
                <CheckCircle2 size={14} className="text-green-500" />
              ) : (
                <AlertTriangle size={14} className="text-amber-500" />
              )}
              <span className="text-xs text-secondary-500">
                {stats.balance >= 0 ? 'Flujo positivo' : 'Flujo negativo'}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CreditCard size={24} className="text-purple-600" />
            </div>
            {stats.cuentasVencidas > 0 && (
              <Badge variant="error" size="sm">{stats.cuentasVencidas} vencidas</Badge>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-secondary-400">Por Cobrar</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalPorCobrar)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-400">Por Pagar</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(stats.totalPorPagar)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link to="/finanzas/ingresos" className="card p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-secondary-900">Ingresos</p>
              <p className="text-xs text-secondary-500">{ingresos.length} registros</p>
            </div>
            <ArrowRight size={16} className="text-secondary-300 group-hover:text-primary-500 transition-colors" />
          </div>
        </Link>
        <Link to="/finanzas/egresos" className="card p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-secondary-900">Egresos</p>
              <p className="text-xs text-secondary-500">{egresos.length} registros</p>
            </div>
            <ArrowRight size={16} className="text-secondary-300 group-hover:text-primary-500 transition-colors" />
          </div>
        </Link>
        <Link to="/finanzas/cobrar" className="card p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-secondary-900">Por Cobrar</p>
              <p className="text-xs text-secondary-500">{cuentasCobrar.filter(c => c.estado !== 'pagada').length} pendientes</p>
            </div>
            <ArrowRight size={16} className="text-secondary-300 group-hover:text-primary-500 transition-colors" />
          </div>
        </Link>
        <Link to="/finanzas/pagar" className="card p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-secondary-900">Por Pagar</p>
              <p className="text-xs text-secondary-500">{cuentasPagar.filter(c => c.estado !== 'pagada').length} pendientes</p>
            </div>
            <ArrowRight size={16} className="text-secondary-300 group-hover:text-primary-500 transition-colors" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Transacciones Recientes</h3>
            <div className="flex gap-2">
              <Link to="/finanzas/ingresos">
                <Button variant="ghost" size="sm">Ver ingresos</Button>
              </Link>
              <Link to="/finanzas/egresos">
                <Button variant="ghost" size="sm">Ver egresos</Button>
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-secondary-400 py-8">No hay transacciones recientes</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    t.type === 'ingreso' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {t.type === 'ingreso' ? (
                      <TrendingUp size={18} className="text-green-600" />
                    ) : (
                      <TrendingDown size={18} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">{t.concepto}</p>
                    <div className="flex items-center gap-2 text-xs text-secondary-500">
                      <Calendar size={12} />
                      {formatDate(t.fecha)}
                      {'tipo' in t && (
                        <Badge variant={tipoIngresoColors[t.tipo as keyof typeof tipoIngresoColors] as any} size="sm">
                          {tipoIngresoLabels[t.tipo as keyof typeof tipoIngresoLabels]}
                        </Badge>
                      )}
                      {'categoria' in t && (
                        <Badge variant={categoriaEgresoColors[t.categoria as keyof typeof categoriaEgresoColors] as any} size="sm">
                          {categoriaEgresoLabels[t.categoria as keyof typeof categoriaEgresoLabels]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className={`font-semibold ${t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'ingreso' ? '+' : '-'}{formatCurrency(Number(t.monto))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Egresos by Category */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={18} className="text-secondary-500" />
              <h3 className="font-semibold text-secondary-900">Egresos por Categoría</h3>
            </div>
            <div className="space-y-3">
              {egresosPorCategoria.length === 0 ? (
                <p className="text-center text-secondary-400 py-4">Sin datos</p>
              ) : (
                egresosPorCategoria.map(([cat, monto]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={categoriaEgresoColors[cat as keyof typeof categoriaEgresoColors] as any} size="sm">
                        {categoriaEgresoLabels[cat as keyof typeof categoriaEgresoLabels]}
                      </Badge>
                      <span className="text-sm font-medium text-secondary-700">{formatCurrency(monto)}</span>
                    </div>
                    <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${(monto / stats.totalEgresos) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                <h3 className="font-semibold text-secondary-900">Próximos Pagos</h3>
              </div>
              <Link to="/finanzas/pagar">
                <Button variant="ghost" size="sm">Ver todo</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingPayments.length === 0 ? (
                <p className="text-center text-secondary-400 py-4">Sin pagos pendientes</p>
              ) : (
                upcomingPayments.map((c) => {
                  const isOverdue = c.fecha_vencimiento && new Date(c.fecha_vencimiento) < new Date()
                  return (
                    <div key={c.id} className={`p-3 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-secondary-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-secondary-900 text-sm truncate">{c.concepto}</p>
                        <Badge variant={isOverdue ? 'error' : 'warning'} size="sm">
                          {isOverdue ? 'Vencida' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary-500">
                          {c.fecha_vencimiento ? formatDate(c.fecha_vencimiento) : 'Sin vencimiento'}
                        </span>
                        <span className="font-semibold text-red-600">{formatCurrency(Number(c.saldo))}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Pending Collections */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-green-500" />
                <h3 className="font-semibold text-secondary-900">Por Cobrar</h3>
              </div>
              <Link to="/finanzas/cobrar">
                <Button variant="ghost" size="sm">Ver todo</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {pendingCollections.length === 0 ? (
                <p className="text-center text-secondary-400 py-4">Sin cuentas por cobrar</p>
              ) : (
                pendingCollections.map((c) => {
                  const isOverdue = c.fecha_vencimiento && new Date(c.fecha_vencimiento) < new Date()
                  return (
                    <div key={c.id} className={`p-3 rounded-lg ${isOverdue ? 'bg-amber-50' : 'bg-green-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-secondary-900 text-sm truncate">{c.concepto}</p>
                        <Badge variant={estadoCuentaColors[c.estado as keyof typeof estadoCuentaColors] as any} size="sm">
                          {c.estado}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary-500">
                          {c.fecha_vencimiento ? formatDate(c.fecha_vencimiento) : 'Sin vencimiento'}
                        </span>
                        <span className="font-semibold text-green-600">{formatCurrency(Number(c.saldo))}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
