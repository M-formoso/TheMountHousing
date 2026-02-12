import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, FileText, Users, UserCheck,
  Wrench, Package, DollarSign, ShoppingBag,
  BarChart3, Settings, Menu, X, ChevronDown, ChevronRight, Home,
} from 'lucide-react'

interface NavChild {
  href: string
  label: string
}

interface NavItem {
  href: string
  label: string
  icon: React.FC<{ size?: number }>
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/proyectos', label: 'Proyectos', icon: FolderOpen },
  { href: '/unidades', label: 'Unidades / PH', icon: Home },
  { href: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/empleados', label: 'Empleados', icon: UserCheck },
  { href: '/subcontratistas', label: 'Subcontratistas', icon: Wrench },
  {
    href: '/materiales', label: 'Materiales', icon: Package,
    children: [
      { href: '/materiales/inventario', label: 'Inventario' },
      { href: '/materiales/solicitudes', label: 'Solicitudes' },
      { href: '/materiales/ordenes', label: 'Órdenes de Compra' },
    ],
  },
  {
    href: '/finanzas', label: 'Finanzas', icon: DollarSign,
    children: [
      { href: '/finanzas/ingresos', label: 'Ingresos' },
      { href: '/finanzas/egresos', label: 'Egresos' },
      { href: '/finanzas/cobrar', label: 'Cuentas por Cobrar' },
      { href: '/finanzas/pagar', label: 'Cuentas por Pagar' },
    ],
  },
  { href: '/proveedores', label: 'Proveedores', icon: ShoppingBag },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
    )
  }

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
          {/* Marca - Más grande y llamativa */}
          <div className="px-6 py-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Constructora Pro</h1>
                <p className="text-xs text-gray-400">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          {/* Items de navegación - Más espaciados y grandes */}
          <ul className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedItems.includes(item.href)

              return (
                <li key={item.href}>
                  <div className="flex items-center gap-1">
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
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
                    {hasChildren && (
                      <button
                        onClick={() => toggleExpand(item.href)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    )}
                  </div>

                  {/* Sub-items - Animados */}
                  {hasChildren && isExpanded && (
                    <ul className="ml-8 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {item.children!.map((child) => (
                        <li key={child.href}>
                          <NavLink
                            to={child.href}
                            className={({ isActive }) =>
                              `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-primary-600 text-white shadow-md'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                              }`
                            }
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-gray-600'}`}></span>
                              {child.label}
                            </span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
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
