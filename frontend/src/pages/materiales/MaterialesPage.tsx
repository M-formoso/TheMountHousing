import { useState, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus, Search, Package, AlertTriangle, DollarSign, Layers, Download,
  MoreVertical, Eye, Edit2, Trash2, TrendingUp, TrendingDown, Box
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useMateriales, useDeleteMaterial, useCreateMaterial, useUpdateMaterial } from '@/services/materiales.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import type { Material, MaterialCreate, CategoriaMaterial, UnidadMedida } from '@/types/material'
import { categoriaLabels, categoriaColors, unidadLabels } from '@/types/material'

export default function MaterialesPage() {
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState<string>('todos')
  const [showForm, setShowForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const { data, isLoading, refetch } = useMateriales({
    buscar: buscar || undefined,
    categoria: categoria !== 'todos' ? categoria : undefined,
    limit: 500,
  })
  const deleteMutation = useDeleteMaterial()

  const materiales = data?.items ?? []

  // Statistics
  const stats = useMemo(() => {
    const total = materiales.length
    const stockBajo = materiales.filter(m => m.stock_actual <= m.stock_minimo && m.stock_minimo > 0).length
    const sinStock = materiales.filter(m => m.stock_actual === 0).length
    const valorInventario = materiales.reduce((sum, m) => sum + (m.stock_actual * Number(m.precio_unitario_actual)), 0)
    return { total, stockBajo, sinStock, valorInventario }
  }, [materiales])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: materiales.length }
    Object.keys(categoriaLabels).forEach(cat => {
      counts[cat] = materiales.filter(m => m.categoria === cat).length
    })
    return counts
  }, [materiales])

  // Low stock materials
  const lowStockMaterials = useMemo(() => {
    return materiales.filter(m => m.stock_actual <= m.stock_minimo && m.stock_minimo > 0)
  }, [materiales])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este material?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setShowForm(true)
    setMenuOpen(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMaterial(null)
    refetch()
  }

  const exportToExcel = () => {
    const exportData = materiales.map(m => ({
      'Código': m.codigo,
      'Nombre': m.nombre,
      'Categoría': categoriaLabels[m.categoria],
      'Unidad': unidadLabels[m.unidad_medida],
      'Stock Actual': m.stock_actual,
      'Stock Mínimo': m.stock_minimo,
      'Stock Máximo': m.stock_maximo,
      'Precio Unitario': Number(m.precio_unitario_actual),
      'Valor Inventario': m.stock_actual * Number(m.precio_unitario_actual),
      'Ubicación': m.ubicacion_almacen || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Materiales')
    XLSX.writeFile(wb, `inventario_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns: ColumnDef<Material>[] = [
    {
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-secondary-100 px-2 py-1 rounded">
          {row.original.codigo}
        </span>
      ),
    },
    {
      accessorKey: 'nombre',
      header: 'Material',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-secondary-900">{row.original.nombre}</div>
            {row.original.descripcion && (
              <div className="text-xs text-secondary-500 truncate max-w-[200px]">
                {row.original.descripcion}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'categoria',
      header: 'Categoría',
      cell: ({ row }) => (
        <Badge variant={categoriaColors[row.original.categoria] as any} size="sm">
          {categoriaLabels[row.original.categoria]}
        </Badge>
      ),
    },
    {
      accessorKey: 'stock_actual',
      header: 'Stock',
      cell: ({ row }) => {
        const stockBajo = row.original.stock_actual <= row.original.stock_minimo && row.original.stock_minimo > 0
        const sinStock = row.original.stock_actual === 0
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${sinStock ? 'text-red-600' : stockBajo ? 'text-amber-600' : 'text-secondary-900'}`}>
              {row.original.stock_actual}
            </span>
            <span className="text-xs text-secondary-400">{unidadLabels[row.original.unidad_medida]}</span>
            {stockBajo && !sinStock && (
              <AlertTriangle size={14} className="text-amber-500" />
            )}
            {sinStock && (
              <Badge variant="error" size="sm">Sin stock</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'stock_minimo',
      header: 'Mín/Máx',
      cell: ({ row }) => (
        <div className="text-xs text-secondary-500">
          {row.original.stock_minimo} / {row.original.stock_maximo || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'precio_unitario_actual',
      header: 'Precio Unit.',
      cell: ({ row }) => (
        <span className="font-medium text-secondary-900">
          {formatCurrency(Number(row.original.precio_unitario_actual))}
        </span>
      ),
    },
    {
      id: 'valor',
      header: 'Valor Inv.',
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          {formatCurrency(row.original.stock_actual * Number(row.original.precio_unitario_actual))}
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
            <div className="absolute right-0 top-8 bg-white border border-secondary-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(row.original)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2"
              >
                <Edit2 size={14} /> Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(row.original.id)
                  setMenuOpen(null)
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

  // Filter data based on selected category tab
  const filteredData = useMemo(() => {
    if (categoria === 'todos') return materiales
    return materiales.filter(m => m.categoria === categoria)
  }, [materiales, categoria])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Inventario de Materiales</h1>
          <p className="text-secondary-500 mt-1">Gestiona el inventario y stock de materiales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo Material
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
              <p className="text-xs text-secondary-500">Total Materiales</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.stockBajo}</p>
              <p className="text-xs text-secondary-500">Stock Bajo</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Box size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.sinStock}</p>
              <p className="text-xs text-secondary-500">Sin Stock</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.valorInventario)}</p>
              <p className="text-xs text-secondary-500">Valor Inventario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <div className="card p-4 mb-6 border-l-4 border-amber-500 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2">Alerta de Stock Bajo</h3>
              <div className="flex flex-wrap gap-2">
                {lowStockMaterials.slice(0, 5).map(m => (
                  <Badge key={m.id} variant="warning" size="sm">
                    {m.nombre}: {m.stock_actual} {unidadLabels[m.unidad_medida]}
                  </Badge>
                ))}
                {lowStockMaterials.length > 5 && (
                  <Badge variant="secondary" size="sm">
                    +{lowStockMaterials.length - 5} más
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={categoria} onValueChange={setCategoria}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="todos">
            Todos ({categoryCounts.todos})
          </TabsTrigger>
          {Object.entries(categoriaLabels).map(([value, label]) => (
            categoryCounts[value] > 0 && (
              <TabsTrigger key={value} value={value}>
                {label} ({categoryCounts[value]})
              </TabsTrigger>
            )
          ))}
        </TabsList>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredData.length === 0 ? (
          <div className="card p-12 text-center">
            <Package size={48} className="mx-auto text-secondary-300 mb-4" />
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">
              No hay materiales registrados
            </h3>
            <p className="text-secondary-500 mb-4">
              Agrega tu primer material para comenzar
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Agregar Material
            </Button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="nombre"
              searchPlaceholder="Buscar en tabla..."
              pageSize={15}
            />
          </div>
        )}
      </Tabs>

      {/* Modal */}
      {showForm && (
        <MaterialFormModal
          material={editingMaterial}
          onClose={handleCloseForm}
        />
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuOpen(null)}
        />
      )}
    </div>
  )
}

// Modal Form Component
function MaterialFormModal({
  material,
  onClose
}: {
  material: Material | null
  onClose: () => void
}) {
  const isEditing = !!material

  const [form, setForm] = useState<MaterialCreate>({
    nombre: material?.nombre || '',
    descripcion: material?.descripcion || '',
    categoria: material?.categoria || 'otro',
    subcategoria: material?.subcategoria || '',
    unidad_medida: material?.unidad_medida || 'pieza',
    precio_unitario_actual: material?.precio_unitario_actual || 0,
    stock_minimo: material?.stock_minimo || 0,
    stock_maximo: material?.stock_maximo || 0,
    ubicacion_almacen: material?.ubicacion_almacen || '',
  })
  const [stockActual, setStockActual] = useState(material?.stock_actual || 0)
  const [error, setError] = useState('')

  const createMutation = useCreateMaterial()
  const updateMutation = useUpdateMaterial(material?.id || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.nombre) {
      setError('El nombre es requerido')
      return
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ ...form, stock_actual: stockActual })
      } else {
        await createMutation.mutateAsync(form)
      }
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">
              {isEditing ? 'Editar Material' : 'Nuevo Material'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          {/* Info básica */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
              <Layers size={16} /> Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nombre del Material *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Ej: Cemento Portland"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  className="input-field w-full"
                  rows={2}
                  placeholder="Descripción adicional..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm(p => ({ ...p, categoria: e.target.value as CategoriaMaterial }))}
                  className="input-field w-full"
                >
                  {Object.entries(categoriaLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Unidad de Medida *
                </label>
                <select
                  value={form.unidad_medida}
                  onChange={(e) => setForm(p => ({ ...p, unidad_medida: e.target.value as UnidadMedida }))}
                  className="input-field w-full"
                >
                  {Object.entries(unidadLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
              <Box size={16} /> Inventario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockActual}
                    onChange={(e) => setStockActual(parseFloat(e.target.value) || 0)}
                    className="input-field w-full"
                    min={0}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.stock_minimo}
                  onChange={(e) => setForm(p => ({ ...p, stock_minimo: parseFloat(e.target.value) || 0 }))}
                  className="input-field w-full"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Stock Máximo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.stock_maximo}
                  onChange={(e) => setForm(p => ({ ...p, stock_maximo: parseFloat(e.target.value) || 0 }))}
                  className="input-field w-full"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Ubicación en Almacén
                </label>
                <input
                  type="text"
                  value={form.ubicacion_almacen}
                  onChange={(e) => setForm(p => ({ ...p, ubicacion_almacen: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Ej: Pasillo A, Estante 3"
                />
              </div>
            </div>
          </div>

          {/* Precio */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
              <DollarSign size={16} /> Precio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Precio Unitario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio_unitario_actual}
                    onChange={(e) => setForm(p => ({ ...p, precio_unitario_actual: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-full pl-7"
                    min={0}
                  />
                </div>
              </div>
              {isEditing && stockActual > 0 && (
                <div className="flex items-end">
                  <div className="bg-green-50 rounded-lg p-3 w-full">
                    <p className="text-xs text-green-600 mb-1">Valor en Inventario</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(stockActual * (form.precio_unitario_actual || 0))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
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
                : isEditing ? 'Guardar Cambios' : 'Agregar Material'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
