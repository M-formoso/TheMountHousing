import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/services/auth.service'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const logoutStore = useAuthStore((state) => state.logout)
  const logoutMutation = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // Continuar aunque falle la llamada al backend
    }
    logoutStore()
    navigate('/login')
  }

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      administrador: 'Administrador',
      gerente_proyecto: 'Gerente de Proyecto',
      supervisor_obra: 'Supervisor de Obra',
      contador: 'Contador',
      compras: 'Compras',
      cliente: 'Cliente',
    }
    return labels[rol] || rol
  }

  return (
    <header className="bg-white border-b border-secondary-200 shadow-sm px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* Espacio para hamburger en móvil */}
      <div className="lg:hidden w-8" />

      {/* Título de página (se puede hacer dinámico con react-router) */}
      <div className="hidden lg:block">
        <h2 className="text-xl font-semibold text-secondary-800">Dashboard</h2>
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notificaciones */}
        <button className="relative p-2.5 rounded-xl hover:bg-secondary-100 text-secondary-600 transition-all hover:scale-105">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
        </button>

        {/* Info usuario */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
            <User size={18} />
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-secondary-800">{user?.nombre}</p>
            <p className="text-xs text-secondary-500">{user ? getRolLabel(user.rol) : ''}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl hover:bg-red-50 text-secondary-500 hover:text-error transition-all hover:scale-105"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
