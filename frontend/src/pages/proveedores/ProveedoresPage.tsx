import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus, Search, Building2, Phone, Mail, Star, Download, Filter,
  MoreVertical, Eye, Edit2, Trash2, Package, CheckCircle2, XCircle,
  AlertCircle, Heart, Wrench
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useProveedores, useDeleteProveedor } from '@/services/proveedores.service'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ProveedorFormModal } from '@/components/proveedores/ProveedorFormModal'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import type { Proveedor, CategoriaProveedor, EstadoProveedor } from '@/types/proveedor'
import {
  categoriaLabels, categoriaColors,
  estadoProveedorLabels, estadoProveedorColors,
  especialidadLabels
} from '@/types/proveedor'

type ViewMode = 'table' | 'cards'

export default function ProveedoresPage() {
  const navigate = useNavigate()
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState<string>('todos')
  const [estado, setEstado] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const { data, isLoading, refetch } = useProveedores({
    buscar: buscar || undefined,
    categoria: categoria !== 'todos' ? categoria : undefined,
    estado: estado || undefined,
    limit: 500,
  })
  const deleteMutation = useDeleteProveedor()

  const proveedores = data?.items ?? []

  // Statistics
  const stats = useMemo(() => {
    const activos = proveedores.filter(p => p.estado === 'activo').length
    const inactivos = proveedores.filter(p => p.estado === 'inactivo').length
    const suspendidos = proveedores.filter(p => p.estado === 'suspendido').length
    const totalPagado = proveedores.reduce((sum, p) => sum + p.total_pagado, 0)
    const totalPendiente = proveedores.reduce((sum, p) => sum + p.total_pendiente, 0)
    const preferidos = proveedores.filter(p => p.preferido).length
    return { activos, inactivos, suspendidos, totalPagado, totalPendiente, preferidos }
  }, [proveedores])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: proveedores.length }
    Object.keys(categoriaLabels).forEach(cat => {
      counts[cat] = proveedores.filter(p => p.categoria === cat).length
    })
    return counts
  }, [proveedores])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setShowForm(true)
    setMenuOpen(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProveedor(null)
    refetch()
  }

  const exportToExcel = () => {
    const exportData = proveedores.map(p => ({
      'Razón Social': p.razon_social,
      'Nombre Comercial': p.nombre_comercial || '',
      'RFC': p.rfc || '',
      'Categoría': categoriaLabels[p.categoria],
      'Estado': estadoProveedorLabels[p.estado],
      'Especialidad': p.especialidad ? especialidadLabels[p.especialidad] : '',
      'Contacto': p.contacto_principal,
      'Email': p.email,
      'Teléfono': p.telefono || '',
      'Ciudad': p.ciudad || '',
      'Calificación': p.calificacion,
      'Total Pagado': p.total_pagado,
      'Total Pendiente': p.total_pendiente,
      'Trabajos Completados': p.trabajos_completados,
      'Preferido': p.preferido ? 'Sí' : 'No',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores')
    XLSX.writeFile(wb, `proveedores_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  const columns: ColumnDef<Proveedor>[] = [
    {
      accessorKey: 'razon_social',
      header: 'Proveedor',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {row.original.categoria === 'mano_de_obra' ? (
              <Wrench size={18} className="text-primary-600" />
            ) : (
              <Building2 size={18} className="text-primary-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-secondary-900 flex items-center gap-2">
              {row.original.razon_social}
              {row.original.preferido && (
                <Heart size={14} className="fill-red-500 text-red-500" />
              )}
            </div>
            {row.original.nombre_comercial && (
              <div className="text-xs text-secondary-500">{row.original.nombre_comercial}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'categoria',
      header: 'Categoría',
      cell: ({ row }) => (
        <Badge variant={categoriaColors[row.original.categoria] as any}>
          {categoriaLabels[row.original.categoria]}
        </Badge>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={estadoProveedorColors[row.original.estado] as any}>
          {estadoProveedorLabels[row.original.estado]}
        </Badge>
      ),
    },
    {
      accessorKey: 'contacto_principal',
      header: 'Contacto',
      cell: ({ row }) => (
        <div>
          <div className="text-secondary-900">{row.original.contacto_principal}</div>
          <div className="text-xs text-secondary-500 flex items-center gap-1">
            <Mail size={12} /> {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'calificacion',
      header: 'Calificación',
      cell: ({ row }) => renderStars(row.original.calificacion),
    },
    {
      accessorKey: 'total_pagado',
      header: 'Total Pagado',
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          {formatCurrency(row.original.total_pagado)}
        </span>
      ),
    },
    {
      accessorKey: 'total_pendiente',
      header: 'Pendiente',
      cell: ({ row }) => (
        <span className={`font-medium ${row.original.total_pendiente > 0 ? 'text-amber-600' : 'text-secondary-400'}`}>
          {formatCurrency(row.original.total_pendiente)}
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
                  navigate(`/proveedores/${row.original.id}`)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2"
              >
                <Eye size={14} /> Ver Detalle
              </button>
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
    if (categoria === 'todos') return proveedores
    return proveedores.filter(p => p.categoria === categoria)
  }, [proveedores, categoria])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Proveedores</h1>
          <p className="text-secondary-500 mt-1">Gestiona proveedores y contratistas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.activos}</p>
              <p className="text-xs text-secondary-500">Activos</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.inactivos}</p>
              <p className="text-xs text-secondary-500">Inactivos</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.suspendidos}</p>
              <p className="text-xs text-secondary-500">Suspendidos</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{stats.preferidos}</p>
              <p className="text-xs text-secondary-500">Preferidos</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalPagado)}</p>
              <p className="text-xs text-secondary-500">Total Pagado</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-amber-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(stats.totalPendiente)}</p>
              <p className="text-xs text-secondary-500">Pendiente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, contacto o email..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Estado filter */}
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="input-field w-full lg:w-44"
          >
            <option value="">Todos los estados</option>
            {Object.entries(estadoProveedorLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-secondary-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm text-secondary-900' : 'text-secondary-600'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-sm text-secondary-900' : 'text-secondary-600'
              }`}
            >
              Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={categoria} onValueChange={setCategoria}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">
            Todos ({categoryCounts.todos})
          </TabsTrigger>
          {Object.entries(categoriaLabels).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label} ({categoryCounts[value] || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredData.length === 0 ? (
          <div className="card p-12 text-center">
            <Package size={48} className="mx-auto text-secondary-300 mb-4" />
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">
              No hay proveedores registrados
            </h3>
            <p className="text-secondary-500 mb-4">
              Agrega tu primer proveedor para comenzar
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Agregar Proveedor
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="card overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="razon_social"
              searchPlaceholder="Buscar en tabla..."
              pageSize={15}
              onRowClick={(row) => navigate(`/proveedores/${row.id}`)}
            />
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((proveedor) => (
              <div
                key={proveedor.id}
                className="card p-5 hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => navigate(`/proveedores/${proveedor.id}`)}
              >
                {/* Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(menuOpen === proveedor.id ? null : proveedor.id)
                    }}
                    className="p-1.5 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={18} className="text-secondary-500" />
                  </button>
                  {menuOpen === proveedor.id && (
                    <div className="absolute right-0 top-8 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/proveedores/${proveedor.id}`)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <Eye size={14} /> Ver Detalle
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(proveedor)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(proveedor.id)
                          setMenuOpen(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {proveedor.categoria === 'mano_de_obra' ? (
                      <Wrench size={24} className="text-primary-600" />
                    ) : (
                      <Building2 size={24} className="text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-semibold text-secondary-900 truncate flex items-center gap-2">
                      {proveedor.razon_social}
                      {proveedor.preferido && (
                        <Heart size={14} className="fill-red-500 text-red-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={categoriaColors[proveedor.categoria] as any} size="sm">
                        {categoriaLabels[proveedor.categoria]}
                      </Badge>
                      <Badge variant={estadoProveedorColors[proveedor.estado] as any} size="sm">
                        {estadoProveedorLabels[proveedor.estado]}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-secondary-600 truncate">
                    {proveedor.contacto_principal}
                  </p>
                  {proveedor.telefono && (
                    <p className="text-sm text-secondary-500 flex items-center gap-2">
                      <Phone size={14} />
                      {proveedor.telefono}
                    </p>
                  )}
                  <p className="text-sm text-secondary-500 flex items-center gap-2 truncate">
                    <Mail size={14} />
                    {proveedor.email}
                  </p>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  {renderStars(proveedor.calificacion)}
                </div>

                {/* Financial Totals */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-secondary-100">
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="text-xs text-green-600 mb-1">Total Pagado</p>
                    <p className="font-semibold text-green-700 text-sm">
                      {formatCurrency(proveedor.total_pagado)}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2.5">
                    <p className="text-xs text-amber-600 mb-1">Pendiente</p>
                    <p className="font-semibold text-amber-700 text-sm">
                      {formatCurrency(proveedor.total_pendiente)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Tabs>

      {/* Modal */}
      {showForm && (
        <ProveedorFormModal
          proveedor={editingProveedor}
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
