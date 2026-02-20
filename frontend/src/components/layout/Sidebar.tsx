import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, UserCog,
  Package, DollarSign, ShoppingBag,
  Settings, Menu, X, Home, TrendingUp,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.FC<{ size?: number }>
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/unidades', label: 'Unidades / PH', icon: Home },
  { href: '/usuarios', label: 'Usuarios', icon: UserCog },
  { href: '/proveedores', label: 'Proveedores', icon: ShoppingBag },
  { href: '/materiales', label: 'Materiales', icon: Package },
  { href: '/finanzas', label: 'Finanzas', icon: DollarSign },
  { href: '/finanzas/roi', label: 'Análisis ROI', icon: TrendingUp },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botón hamburger (móvil) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md hover:bg-secondary-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-black text-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gray-800">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>

          {/* Items de navegación */}
          <ul className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={22} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>

          {/* Footer con info adicional */}
          <div className="p-4 border-t border-gray-800">
            <div className="px-4 py-3 bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-400">Versión 1.0.0</p>
              <p className="text-xs text-gray-500 mt-1">© 2025 The Mount Housing</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
