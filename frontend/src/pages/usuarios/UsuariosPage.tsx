import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCog, Plus, Pencil, Trash2, Search, Home, Eye, EyeOff, Copy } from 'lucide-react'
import api from '@/lib/axios'

interface Unidad {
  id: string
  numero_unidad: string
  nombre?: string
  estado: string
  usuario_id?: string
}

interface Usuario {
  id: string
  email: string
  nombre: string
  apellido_paterno: string
  apellido_materno?: string
  telefono?: string
  rol: string
  activo: boolean
  created_at: string
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'gerente_proyecto', label: 'Gerente de Proyecto' },
  { value: 'supervisor_obra', label: 'Supervisor de Obra' },
  { value: 'contador', label: 'Contador' },
  { value: 'compras', label: 'Compras' },
  { value: 'cliente', label: 'Cliente' },
]

export default function UsuariosPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [selectedRol, setSelectedRol] = useState('cliente')
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showCredentials, setShowCredentials] = useState(false)
  const [newUserCredentials, setNewUserCredentials] = useState<{ email: string; password: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: usuarios = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const res = await api.get('/api/v1/usuarios')
      return res.data
    },
  })

  const { data: unidades = [] } = useQuery<Unidad[]>({
    queryKey: ['unidades'],
    queryFn: async () => {
      const res = await api.get('/api/v1/unidades')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/api/v1/usuarios', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['unidades'] })

      // Si es cliente, mostrar credenciales
      if (variables.rol === 'cliente') {
        setNewUserCredentials({
          email: variables.email as string,
          password: variables.password as string,
        })
        setShowCredentials(true)
      }

      setShowModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put(`/api/v1/usuarios/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
      setShowModal(false)
      setEditingUser(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/usuarios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
    },
  })

  const assignUnidadMutation = useMutation({
    mutationFn: ({ unidadId, usuarioId }: { unidadId: string; usuarioId: string }) =>
      api.put(`/api/v1/unidades/${unidadId}`, { usuario_id: usuarioId, estado: 'vendida' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })

  const filteredUsers = usuarios.filter((u) => {
    const matchSearch =
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.apellido_paterno.toLowerCase().includes(search.toLowerCase())
    const matchRol = !filterRol || u.rol === filterRol
    return matchSearch && matchRol
  })

  // Obtener la unidad asignada a un usuario
  const getUnidadAsignada = (userId: string) => {
    return unidades.find((u) => u.usuario_id === userId)
  }

  // Generar contraseña aleatoria
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let password = 'TM'
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
    return password
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = (formData.get('password') as string) || generatedPassword

    const data = {
      email: formData.get('email'),
      nombre: formData.get('nombre'),
      apellido_paterno: formData.get('apellido_paterno'),
      apellido_materno: formData.get('apellido_materno') || '',
      telefono: formData.get('telefono') || '',
      rol: formData.get('rol'),
      password: password || undefined,
    }

    if (editingUser) {
      const updateData = { ...data }
      if (!updateData.password) delete updateData.password
      updateMutation.mutate({ id: editingUser.id, data: updateData })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (user: Usuario) => {
    setEditingUser(user)
    setSelectedRol(user.rol)
    setGeneratedPassword('')
    setShowModal(true)
  }

  const handleDelete = (user: Usuario) => {
    if (confirm(`¿Eliminar usuario ${user.nombre}?`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const handleAssignUnidad = (userId: string, unidadId: string) => {
    if (unidadId) {
      assignUnidadMutation.mutate({ unidadId, usuarioId: userId })
    }
  }

  const getRolLabel = (rol: string) => {
    return ROLES.find((r) => r.value === rol)?.label || rol
  }

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700'
      case 'administrador':
        return 'bg-blue-100 text-blue-700'
      case 'cliente':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-primary-100 text-primary-700'
    }
  }

  // Unidades disponibles para asignar
  const unidadesDisponibles = unidades.filter(
    (u) => u.estado === 'disponible' || u.estado === 'vendida'
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-2">
            <UserCog className="text-primary-600" />
            Usuarios
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            Gestiona usuarios del sistema y asigna unidades a clientes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            setSelectedRol('cliente')
            setGeneratedPassword('')
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Todos los roles</option>
          {ROLES.map((rol) => (
            <option key={rol.value} value={rol.value}>
              {rol.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-secondary-500">Total Usuarios</p>
          <p className="text-2xl font-bold text-secondary-800">{usuarios.length}</p>
        </div>
        <div className="card p-4 bg-green-50">
          <p className="text-sm text-green-600">Clientes</p>
          <p className="text-2xl font-bold text-green-700">
            {usuarios.filter((u) => u.rol === 'cliente').length}
          </p>
        </div>
        <div className="card p-4 bg-blue-50">
          <p className="text-sm text-blue-600">Administradores</p>
          <p className="text-2xl font-bold text-blue-700">
            {usuarios.filter((u) => u.rol === 'administrador' || u.rol === 'super_admin').length}
          </p>
        </div>
        <div className="card p-4 bg-yellow-50">
          <p className="text-sm text-yellow-600">Con PH Asignado</p>
          <p className="text-2xl font-bold text-yellow-700">
            {usuarios.filter((u) => u.rol === 'cliente' && getUnidadAsignada(u.id)).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-secondary-500">Cargando usuarios...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-secondary-500">No hay usuarios</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary-700">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary-700">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary-700">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary-700">
                    PH Asignado
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-secondary-700">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-secondary-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filteredUsers.map((user) => {
                  const unidadAsignada = getUnidadAsignada(user.id)
                  return (
                    <tr key={user.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-secondary-800">
                          {user.nombre} {user.apellido_paterno}
                        </div>
                        {user.telefono && (
                          <div className="text-sm text-secondary-500">{user.telefono}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-secondary-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRolColor(user.rol)}`}>
                          {getRolLabel(user.rol)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.rol === 'cliente' ? (
                          unidadAsignada ? (
                            <div className="flex items-center gap-2">
                              <Home size={16} className="text-primary-600" />
                              <span className="font-medium text-primary-700">
                                {unidadAsignada.numero_unidad}
                              </span>
                            </div>
                          ) : (
                            <select
                              className="input-field py-1 text-sm"
                              defaultValue=""
                              onChange={(e) => handleAssignUnidad(user.id, e.target.value)}
                            >
                              <option value="">Asignar PH...</option>
                              {unidadesDisponibles
                                .filter((u) => !u.usuario_id || u.usuario_id === user.id)
                                .map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.numero_unidad} {u.nombre ? `- ${u.nombre}` : ''}
                                  </option>
                                ))}
                            </select>
                          )
                        ) : (
                          <span className="text-secondary-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg ml-1"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={selectedRol}
                  onChange={(e) => setSelectedRol(e.target.value)}
                  className="input-field"
                  required
                >
                  {ROLES.map((rol) => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser?.email}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={editingUser?.nombre}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    defaultValue={editingUser?.apellido_paterno}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido_materno"
                    defaultValue={editingUser?.apellido_materno || ''}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    defaultValue={editingUser?.telefono || ''}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={generatedPassword}
                      onChange={(e) => setGeneratedPassword(e.target.value)}
                      className="input-field pr-10"
                      required={!editingUser}
                      minLength={6}
                      placeholder={editingUser ? 'Nueva contraseña...' : 'Contraseña...'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {!editingUser && (
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="btn-secondary text-sm whitespace-nowrap"
                    >
                      Generar
                    </button>
                  )}
                </div>
                {generatedPassword && !editingUser && (
                  <p className="text-xs text-green-600 mt-1">
                    Contraseña generada. Recuerda guardarla para compartirla con el usuario.
                  </p>
                )}
              </div>

              {selectedRol === 'cliente' && !editingUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> Después de crear el usuario, podrás asignarle una unidad desde la tabla principal.
                  </p>
                </div>
              )}

              {(createMutation.error || updateMutation.error) && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  Error al guardar el usuario
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingUser(null)
                    setGeneratedPassword('')
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Credenciales */}
      {showCredentials && newUserCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b bg-green-50">
              <h2 className="text-lg font-semibold text-green-800">Usuario Creado Exitosamente</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-secondary-600">
                Comparte estas credenciales con el cliente:
              </p>

              <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {newUserCredentials.email}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(newUserCredentials.email)}
                      className="p-2 hover:bg-secondary-200 rounded"
                      title="Copiar"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-secondary-500 mb-1">Contraseña</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {newUserCredentials.password}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(newUserCredentials.password)}
                      className="p-2 hover:bg-secondary-200 rounded"
                      title="Copiar"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-secondary-400">
                No olvides asignar una unidad al cliente desde la tabla principal.
              </p>

              <button
                onClick={() => {
                  setShowCredentials(false)
                  setNewUserCredentials(null)
                }}
                className="w-full btn-primary"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
