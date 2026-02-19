import { useState, useMemo } from 'react'
import { ArrowLeft, Plus, X, Download, TrendingDown, Calendar, CreditCard, CheckCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEgresos, useCreateEgreso, useDeleteEgreso, useUpdateEgreso } from '@/services/finanzas.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { ColumnDef } from '@tanstack/react-table'
import type { Egreso, EgresoCreate, CategoriaEgreso, MetodoPago, EstadoPago } from '@/types/finanzas'
import { categoriaEgresoLabels, categoriaEgresoColors, metodoPagoLabels, estadoPagoLabels, estadoPagoColors } from '@/types/finanzas'
import * as XLSX from 'xlsx'

// Modal de formulario
function EgresoFormModal({
  open,
  onClose,
  egreso,
  onSave,
}: {
  open: boolean
  onClose: () => void
  egreso: Egreso | null
  onSave: (data: EgresoCreate) => Promise<void>
}) {
  const [form, setForm] = useState<EgresoCreate>({
    categoria: egreso?.categoria ?? 'otros',
    concepto: egreso?.concepto ?? '',
    monto: egreso?.monto ?? 0,
    fecha: egreso?.fecha?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    metodo_pago: egreso?.metodo_pago ?? undefined,
    referencia: egreso?.referencia ?? '',
    factura: egreso?.factura ?? '',
    notas: egreso?.notas ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.concepto || form.monto <= 0) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{egreso ? 'Editar Egreso' : 'Nuevo Egreso'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Categoría *</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value as CategoriaEgreso }))}
                className="input-field w-full"
              >
                {Object.entries(categoriaEgresoLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Concepto *</label>
              <input
                type="text"
                value={form.concepto}
                onChange={(e) => setForm((p) => ({ ...p, concepto: e.target.value }))}
                className="input-field w-full"
                placeholder="Descripción del egreso"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Monto *</label>
              <input
                type="number"
                value={form.monto || ''}
                onChange={(e) => setForm((p) => ({ ...p, monto: Number(e.target.value) }))}
                className="input-field w-full"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Método de pago</label>
              <select
                value={form.metodo_pago ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, metodo_pago: e.target.value as MetodoPago || undefined }))}
                className="input-field w-full"
              >
                <option value="">Sin especificar</option>
                {Object.entries(metodoPagoLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Referencia</label>
              <input
                type="text"
                value={form.referencia ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, referencia: e.target.value }))}
                className="input-field w-full"
                placeholder="# de transacción"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Factura</label>
              <input
                type="text"
                value={form.factura ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, factura: e.target.value }))}
                className="input-field w-full"
                placeholder="Número de factura"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Notas</label>
              <textarea
                value={form.notas ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                className="input-field w-full"
                rows={2}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : egreso ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Botón para marcar como pagado
function MarkAsPaidButton({ egreso, onUpdate }: { egreso: Egreso; onUpdate: () => void }) {
  const updateMutation = useUpdateEgreso()
  const [loading, setLoading] = useState(false)

  const handleMarkAsPaid = async () => {
    if (egreso.estado_pago === 'pagado') return
    setLoading(true)
    try {
      await updateMutation.mutateAsync({ id: egreso.id, data: { estado_pago: 'pagado' } })
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  if (egreso.estado_pago === 'pagado') {
    return <span className="text-xs text-success flex items-center gap-1"><CheckCircle size={12} /> Pagado</span>
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleMarkAsPaid}
      disabled={loading}
      className="text-xs py-1 px-2"
    >
      {loading ? '...' : 'Marcar pagado'}
    </Button>
  )
}

export default function EgresosPage() {
  const [categoria, setCategoria] = useState<string>('todos')
  const [skip, setSkip] = useState(0)
  const limit = 50

  const { data, isLoading, refetch } = useEgresos({
    skip,
    limit,
    categoria: categoria !== 'todos' ? categoria : undefined
  })
  const createMutation = useCreateEgreso()
  const deleteMutation = useDeleteEgreso()

  const [showForm, setShowForm] = useState(false)
  const [editingEgreso, setEditingEgreso] = useState<Egreso | null>(null)

  const items = data?.items ?? []
  const total = data?.total ?? 0

  // Stats
  const stats = useMemo(() => {
    const totalMonto = items.reduce((sum, e) => sum + Number(e.monto), 0)
    const esteMes = items.filter((e) => {
      const fecha = new Date(e.fecha)
      const now = new Date()
      return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear()
    }).reduce((sum, e) => sum + Number(e.monto), 0)
    const pendientes = items.filter((e) => e.estado_pago === 'pendiente').length
    const pagados = items.filter((e) => e.estado_pago === 'pagado').length

    return { totalMonto, esteMes, pendientes, pagados, totalRegistros: items.length }
  }, [items])

  // Por categoría
  const countByCategoria = useMemo(() => {
    const counts: Record<string, number> = { todos: items.length }
    items.forEach((e) => {
      counts[e.categoria] = (counts[e.categoria] || 0) + 1
    })
    return counts
  }, [items])

  const handleCreate = async (data: EgresoCreate) => {
    await createMutation.mutateAsync(data)
    refetch()
  }

  const handleDelete = async (egreso: Egreso) => {
    if (!confirm(`¿Eliminar egreso "${egreso.concepto}"?`)) return
    await deleteMutation.mutateAsync(egreso.id)
    refetch()
  }

  const exportToExcel = () => {
    const exportData = items.map((e) => ({
      Fecha: new Date(e.fecha).toLocaleDateString('es-MX'),
      Categoría: categoriaEgresoLabels[e.categoria],
      Concepto: e.concepto,
      Monto: Number(e.monto),
      'Estado Pago': estadoPagoLabels[e.estado_pago],
      'Método Pago': e.metodo_pago ? metodoPagoLabels[e.metodo_pago] : '',
      Referencia: e.referencia || '',
      Factura: e.factura || '',
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Egresos')
    XLSX.writeFile(wb, `egresos_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns: ColumnDef<Egreso>[] = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="text-secondary-600 text-sm">
          {new Date(row.original.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      accessorKey: 'categoria',
      header: 'Categoría',
      cell: ({ row }) => (
        <Badge variant={categoriaEgresoColors[row.original.categoria] as any}>
          {categoriaEgresoLabels[row.original.categoria]}
        </Badge>
      ),
    },
    {
      accessorKey: 'concepto',
      header: 'Concepto',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-secondary-800">{row.original.concepto}</p>
          {row.original.factura && (
            <p className="text-xs text-secondary-400">Factura: {row.original.factura}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'estado_pago',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={estadoPagoColors[row.original.estado_pago] as any}>
          {estadoPagoLabels[row.original.estado_pago]}
        </Badge>
      ),
    },
    {
      accessorKey: 'metodo_pago',
      header: 'Método',
      cell: ({ row }) => (
        <span className="text-secondary-600 text-sm">
          {row.original.metodo_pago ? metodoPagoLabels[row.original.metodo_pago] : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'monto',
      header: () => <span className="text-right block">Monto</span>,
      cell: ({ row }) => (
        <span className="font-semibold text-error block text-right">
          ${Number(row.original.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <MarkAsPaidButton egreso={row.original} onUpdate={refetch} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row.original)}
            className="text-secondary-400 hover:text-error"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const filteredItems = categoria === 'todos' ? items : items.filter((e) => e.categoria === categoria)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/finanzas" className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-secondary-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Egresos</h1>
            <p className="text-sm text-secondary-500">Registro de gastos y pagos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download size={16} className="mr-1" /> Exportar
          </Button>
          <Button onClick={() => { setEditingEgreso(null); setShowForm(true) }}>
            <Plus size={16} className="mr-1" /> Nuevo Egreso
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <TrendingDown className="text-error" size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Total Egresos</p>
              <p className="text-lg font-bold text-error">
                ${stats.totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Calendar className="text-warning" size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Este Mes</p>
              <p className="text-lg font-bold text-secondary-800">
                ${stats.esteMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <CreditCard className="text-secondary-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Registros</p>
              <p className="text-lg font-bold text-secondary-800">{stats.totalRegistros}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="text-warning" size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Pendientes</p>
              <p className="text-lg font-bold text-warning">{stats.pendientes}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="text-success" size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Pagados</p>
              <p className="text-lg font-bold text-success">{stats.pagados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs por categoría */}
      <Tabs value={categoria} onValueChange={(v) => { setCategoria(v); setSkip(0) }} className="mb-6">
        <TabsList>
          <TabsTrigger value="todos">
            Todos ({countByCategoria.todos || 0})
          </TabsTrigger>
          {Object.entries(categoriaEgresoLabels).map(([key, label]) => (
            countByCategoria[key] ? (
              <TabsTrigger key={key} value={key}>
                {label} ({countByCategoria[key]})
              </TabsTrigger>
            ) : null
          ))}
        </TabsList>

        <TabsContent value={categoria} className="mt-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={filteredItems}
                searchPlaceholder="Buscar egresos..."
                searchKey="concepto"
              />
              {total > limit && (
                <div className="flex items-center justify-between mt-4 text-sm text-secondary-500">
                  <span>Mostrando {skip + 1}–{Math.min(skip + limit, total)} de {total}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={skip === 0}
                      onClick={() => setSkip((s) => Math.max(0, s - limit))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={skip + limit >= total}
                      onClick={() => setSkip((s) => s + limit)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <EgresoFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        egreso={editingEgreso}
        onSave={handleCreate}
      />
    </div>
  )
}
