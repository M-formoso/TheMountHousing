import { useState, useMemo, Fragment } from 'react'
import { ArrowLeft, Plus, X, Download, DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCuentasCobrar, useCreateCuentaCobrar } from '@/services/finanzas.service'
import { useClientes } from '@/services/clientes.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { ColumnDef } from '@tanstack/react-table'
import type { CuentaPorCobrar, CuentaCobrarCreate, PagoCreate, MetodoPago } from '@/types/finanzas'
import { estadoCuentaLabels, estadoCuentaColors, metodoPagoLabels } from '@/types/finanzas'
import * as XLSX from 'xlsx'

// Modal de formulario
function CuentaFormModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: CuentaCobrarCreate) => Promise<void>
}) {
  const { data: clientesData } = useClientes({ skip: 0, limit: 100 })
  const clientes = clientesData?.items ?? []

  const [form, setForm] = useState<CuentaCobrarCreate>({
    cliente_id: '',
    concepto: '',
    monto_total: 0,
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.concepto || form.monto_total <= 0) return
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
          <h2 className="text-lg font-semibold">Nueva Cuenta por Cobrar</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Cliente</label>
              <select
                value={form.cliente_id}
                onChange={(e) => setForm((p) => ({ ...p, cliente_id: e.target.value }))}
                className="input-field w-full"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
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
                placeholder="Descripción de la cuenta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Monto Total *</label>
              <input
                type="number"
                value={form.monto_total || ''}
                onChange={(e) => setForm((p) => ({ ...p, monto_total: Number(e.target.value) }))}
                className="input-field w-full"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha Emisión *</label>
              <input
                type="date"
                value={form.fecha_emision}
                onChange={(e) => setForm((p) => ({ ...p, fecha_emision: e.target.value }))}
                className="input-field w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha Vencimiento</label>
              <input
                type="date"
                value={form.fecha_vencimiento || ''}
                onChange={(e) => setForm((p) => ({ ...p, fecha_vencimiento: e.target.value }))}
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Row expandible para registrar pago
function PaymentRow({ cuenta, onPaid }: { cuenta: CuentaPorCobrar; onPaid: () => void }) {
  const [showPayment, setShowPayment] = useState(false)
  const [pagoForm, setPagoForm] = useState<PagoCreate>({
    monto: cuenta.saldo,
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: undefined,
    referencia: '',
    notas: '',
  })
  const [saving, setSaving] = useState(false)

  const handlePago = async () => {
    if (pagoForm.monto <= 0) return
    setSaving(true)
    try {
      const { default: api } = await import('@/lib/axios')
      await api.post(`/api/v1/finanzas/cobrar/${cuenta.id}/pagos`, pagoForm)
      setShowPayment(false)
      onPaid()
    } finally {
      setSaving(false)
    }
  }

  if (cuenta.estado === 'pagada') {
    return <span className="text-xs text-success flex items-center gap-1"><CheckCircle size={12} /> Pagada</span>
  }

  if (!showPayment) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowPayment(true)}
        className="text-xs"
      >
        Registrar Pago
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap bg-secondary-50 p-2 rounded-lg">
      <input
        type="number"
        value={pagoForm.monto || ''}
        onChange={(e) => setPagoForm((p) => ({ ...p, monto: Number(e.target.value) }))}
        className="input-field w-28"
        placeholder="Monto"
        step="0.01"
      />
      <input
        type="date"
        value={pagoForm.fecha}
        onChange={(e) => setPagoForm((p) => ({ ...p, fecha: e.target.value }))}
        className="input-field w-36"
      />
      <select
        value={pagoForm.metodo_pago ?? ''}
        onChange={(e) => setPagoForm((p) => ({ ...p, metodo_pago: e.target.value as MetodoPago || undefined }))}
        className="input-field w-32"
      >
        <option value="">Método</option>
        {Object.entries(metodoPagoLabels).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <Button size="sm" onClick={handlePago} disabled={saving}>
        {saving ? '...' : 'Confirmar'}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setShowPayment(false)}>
        Cancelar
      </Button>
    </div>
  )
}

export default function CuentasCobrarPage() {
  const [estado, setEstado] = useState<string>('todos')
  const [skip, setSkip] = useState(0)
  const limit = 50

  const { data, isLoading, refetch } = useCuentasCobrar({
    skip,
    limit,
    estado: estado !== 'todos' ? estado : undefined,
  })
  const createMutation = useCreateCuentaCobrar()
  const [showForm, setShowForm] = useState(false)

  const items = data?.items ?? []
  const total = data?.total ?? 0

  // Stats
  const stats = useMemo(() => {
    const totalCobrar = items.reduce((sum, c) => sum + Number(c.saldo), 0)
    const vencidas = items.filter((c) => c.estado === 'vencida')
    const montoVencido = vencidas.reduce((sum, c) => sum + Number(c.saldo), 0)
    const pendientes = items.filter((c) => c.estado === 'pendiente' || c.estado === 'parcial').length
    const pagadas = items.filter((c) => c.estado === 'pagada').length

    return { totalCobrar, montoVencido, vencidasCount: vencidas.length, pendientes, pagadas, totalRegistros: items.length }
  }, [items])

  // Por estado
  const countByEstado = useMemo(() => {
    const counts: Record<string, number> = { todos: items.length }
    items.forEach((c) => {
      counts[c.estado] = (counts[c.estado] || 0) + 1
    })
    return counts
  }, [items])

  const handleCreate = async (data: CuentaCobrarCreate) => {
    await createMutation.mutateAsync(data)
    refetch()
  }

  const exportToExcel = () => {
    const exportData = items.map((c) => ({
      'Fecha Emisión': new Date(c.fecha_emision).toLocaleDateString('es-MX'),
      'Fecha Vencimiento': c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-MX') : '',
      Concepto: c.concepto,
      Estado: estadoCuentaLabels[c.estado as keyof typeof estadoCuentaLabels] || c.estado,
      'Monto Total': Number(c.monto_total),
      'Monto Pagado': Number(c.monto_pagado),
      Saldo: Number(c.saldo),
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Cuentas por Cobrar')
    XLSX.writeFile(wb, `cuentas_cobrar_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns: ColumnDef<CuentaPorCobrar>[] = [
    {
      accessorKey: 'fecha_emision',
      header: 'Fecha',
      cell: ({ row }) => (
        <div>
          <p className="text-sm text-secondary-700">
            {new Date(row.original.fecha_emision).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </p>
          {row.original.fecha_vencimiento && (
            <p className="text-xs text-secondary-400">
              Vence: {new Date(row.original.fecha_vencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'concepto',
      header: 'Concepto',
      cell: ({ row }) => (
        <p className="font-medium text-secondary-800">{row.original.concepto}</p>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={estadoCuentaColors[row.original.estado as keyof typeof estadoCuentaColors] as any || 'secondary'}>
          {estadoCuentaLabels[row.original.estado as keyof typeof estadoCuentaLabels] || row.original.estado}
        </Badge>
      ),
    },
    {
      accessorKey: 'monto_total',
      header: () => <span className="text-right block">Total</span>,
      cell: ({ row }) => (
        <span className="text-secondary-700 block text-right">
          ${Number(row.original.monto_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: 'monto_pagado',
      header: () => <span className="text-right block">Pagado</span>,
      cell: ({ row }) => (
        <span className="text-success block text-right">
          ${Number(row.original.monto_pagado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: 'saldo',
      header: () => <span className="text-right block">Saldo</span>,
      cell: ({ row }) => (
        <span className="font-semibold text-secondary-800 block text-right">
          ${Number(row.original.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => <PaymentRow cuenta={row.original} onPaid={refetch} />,
    },
  ]

  const filteredItems = estado === 'todos' ? items : items.filter((c) => c.estado === estado)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/finanzas" className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-secondary-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Cuentas por Cobrar</h1>
            <p className="text-sm text-secondary-500">Gestión de cobros pendientes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download size={16} className="mr-1" /> Exportar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-1" /> Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="text-success" size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Por Cobrar</p>
              <p className="text-lg font-bold text-success">
                ${stats.totalCobrar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <AlertTriangle className="text-error" size={20} />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Vencido ({stats.vencidasCount})</p>
              <p className="text-lg font-bold text-error">
                ${stats.montoVencido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
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
              <p className="text-xs text-secondary-500">Pagadas</p>
              <p className="text-lg font-bold text-success">{stats.pagadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs por estado */}
      <Tabs value={estado} onValueChange={(v) => { setEstado(v); setSkip(0) }} className="mb-6">
        <TabsList>
          <TabsTrigger value="todos">
            Todos ({countByEstado.todos || 0})
          </TabsTrigger>
          {Object.entries(estadoCuentaLabels).map(([key, label]) => (
            countByEstado[key] ? (
              <TabsTrigger key={key} value={key}>
                {label} ({countByEstado[key]})
              </TabsTrigger>
            ) : null
          ))}
        </TabsList>

        <TabsContent value={estado} className="mt-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={filteredItems}
                searchPlaceholder="Buscar cuentas..."
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
      <CuentaFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleCreate}
      />
    </div>
  )
}
