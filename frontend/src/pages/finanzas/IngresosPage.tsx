import { useState, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus, Search, TrendingUp, DollarSign, Calendar, Download,
  MoreVertical, Edit2, Trash2, CreditCard, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useIngresos, useCreateIngreso, useDeleteIngreso } from '@/services/finanzas.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Ingreso, IngresoCreate, TipoIngreso, MetodoPago } from '@/types/finanzas'
import { tipoIngresoLabels, tipoIngresoColors, metodoPagoLabels } from '@/types/finanzas'

export default function IngresosPage() {
  const [tipo, setTipo] = useState<string>('todos')
  const [showForm, setShowForm] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const { data, isLoading, refetch } = useIngresos({
    tipo: tipo !== 'todos' ? tipo : undefined,
    limit: 500,
  })
  const deleteMutation = useDeleteIngreso()

  const ingresos = data?.items ?? []

  // Statistics
  const stats = useMemo(() => {
    const total = ingresos.reduce((sum, i) => sum + Number(i.monto), 0)
    const count = ingresos.length

    // This month
    const now = new Date()
    const thisMonth = ingresos.filter(i => {
      const date = new Date(i.fecha)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    const totalMes = thisMonth.reduce((sum, i) => sum + Number(i.monto), 0)

    return { total, count, totalMes, countMes: thisMonth.length }
  }, [ingresos])

  // Type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: ingresos.length }
    Object.keys(tipoIngresoLabels).forEach(t => {
      counts[t] = ingresos.filter(i => i.tipo === t).length
    })
    return counts
  }, [ingresos])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este ingreso?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
    setMenuOpen(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    refetch()
  }

  const exportToExcel = () => {
    const exportData = ingresos.map(i => ({
      'Tipo': tipoIngresoLabels[i.tipo],
      'Concepto': i.concepto,
      'Monto': Number(i.monto),
      'Fecha': formatDate(i.fecha),
      'Método de Pago': i.metodo_pago ? metodoPagoLabels[i.metodo_pago] : '',
      'Referencia': i.referencia || '',
      'Factura': i.factura || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ingresos')
    XLSX.writeFile(wb, `ingresos_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns: ColumnDef<Ingreso>[] = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-secondary-400" />
          <span className="text-secondary-700">{formatDate(row.original.fecha)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant={tipoIngresoColors[row.original.tipo] as any} size="sm">
          {tipoIngresoLabels[row.original.tipo]}
        </Badge>
      ),
    },
    {
      accessorKey: 'concepto',
      header: 'Concepto',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-secondary-900">{row.original.concepto}</p>
          {row.original.referencia && (
            <p className="text-xs text-secondary-500 font-mono">{row.original.referencia}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'metodo_pago',
      header: 'Método',
      cell: ({ row }) => (
        row.original.metodo_pago ? (
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-secondary-400" />
            <span className="text-secondary-600 capitalize">{metodoPagoLabels[row.original.metodo_pago]}</span>
          </div>
        ) : <span className="text-secondary-400">—</span>
      ),
    },
    {
      accessorKey: 'monto',
      header: 'Monto',
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          +{formatCurrency(Number(row.original.monto))}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(menuOpen === row.original.id ? null : row.original.id)
            }}
            className="p-1.5 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <MoreVertical size={16} className="text-secondary-500" />
          </button>
          {menuOpen === row.original.id && (
            <div className="absolute right-0 top-8 bg-white border border-secondary-200 rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(row.original.id)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          )}
        </div>
      ),
    },
  ]

  // Filter data based on selected type tab
  const filteredData = useMemo(() => {
    if (tipo === 'todos') return ingresos
    return ingresos.filter(i => i.tipo === tipo)
  }, [ingresos, tipo])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/finanzas" className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Ingresos</h1>
            <p className="text-secondary-500 mt-1">Registro de ingresos y pagos recibidos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.total)}</p>
              <p className="text-xs text-secondary-500">Total Ingresos</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalMes)}</p>
              <p className="text-xs text-secondary-500">Este Mes</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold">#</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.count}</p>
              <p className="text-xs text-secondary-500">Total Registros</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.countMes}</p>
              <p className="text-xs text-secondary-500">Registros Este Mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type Tabs */}
      <Tabs value={tipo} onValueChange={setTipo}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">
            Todos ({typeCounts.todos})
          </TabsTrigger>
          {Object.entries(tipoIngresoLabels).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label} ({typeCounts[value] || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredData.length === 0 ? (
          <div className="card p-12 text-center">
            <TrendingUp size={48} className="mx-auto text-secondary-300 mb-4" />
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">
              No hay ingresos registrados
            </h3>
            <p className="text-secondary-500 mb-4">
              Registra tu primer ingreso para comenzar
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Agregar Ingreso
            </Button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="concepto"
              searchPlaceholder="Buscar por concepto..."
              pageSize={15}
            />
          </div>
        )}
      </Tabs>

      {/* Modal */}
      {showForm && (
        <IngresoFormModal onClose={handleCloseForm} />
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  )
}

// Modal Form Component
function IngresoFormModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<IngresoCreate>({
    tipo: 'pago_cliente',
    concepto: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: undefined,
    referencia: '',
    factura: '',
    notas: '',
  })
  const [error, setError] = useState('')

  const createMutation = useCreateIngreso()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.concepto || form.monto <= 0) {
      setError('Complete los campos requeridos')
      return
    }

    try {
      await createMutation.mutateAsync(form)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">Nuevo Ingreso</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm(p => ({ ...p, tipo: e.target.value as TipoIngreso }))}
                className="input-field w-full"
              >
                {Object.entries(tipoIngresoLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha *</label>
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
            <label className="block text-sm font-medium text-secondary-700 mb-1">Concepto *</label>
            <input
              type="text"
              value={form.concepto}
              onChange={(e) => setForm(p => ({ ...p, concepto: e.target.value }))}
              className="input-field w-full"
              placeholder="Descripción del ingreso"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Monto *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.monto || ''}
                  onChange={(e) => setForm(p => ({ ...p, monto: parseFloat(e.target.value) || 0 }))}
                  className="input-field w-full pl-7"
                  min={0}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Método de Pago</label>
              <select
                value={form.metodo_pago || ''}
                onChange={(e) => setForm(p => ({ ...p, metodo_pago: e.target.value as MetodoPago || undefined }))}
                className="input-field w-full"
              >
                <option value="">Seleccionar...</option>
                {Object.entries(metodoPagoLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Referencia</label>
              <input
                type="text"
                value={form.referencia}
                onChange={(e) => setForm(p => ({ ...p, referencia: e.target.value }))}
                className="input-field w-full"
                placeholder="Nº de transacción"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Factura</label>
              <input
                type="text"
                value={form.factura}
                onChange={(e) => setForm(p => ({ ...p, factura: e.target.value }))}
                className="input-field w-full"
                placeholder="Nº de factura"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm(p => ({ ...p, notas: e.target.value }))}
              className="input-field w-full"
              rows={2}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Registrar Ingreso'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
