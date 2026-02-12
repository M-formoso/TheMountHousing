# Skill: UI - Tailwind + shadcn/ui + Diseño

## Paleta de Colores (tailwind.config.js)

```js
// tailwind.config.js
const colors = {
  primary: {
    50: '#F5F3F0',   // Beige muy claro (fondos)
    100: '#E8E4DE',
    200: '#D1C9BD',
    300: '#BAAE9C',
    400: '#A3937B',
    500: '#8C785A',  // Beige principal (botones, accentes)
    600: '#70604B',
    700: '#54483C',  // Hover de botones
    800: '#38302D',  // Texto oscuro
    900: '#1C181E',
  },
  secondary: {
    50: '#F7F7F7',
    100: '#EFEFEF',  // Fondos de cards
    200: '#DFDFDF',
    300: '#CFCFCF',  // Borders
    400: '#BFBFBF',
    500: '#808080',  // Gris principal
    600: '#666666',
    700: '#4D4D4D',  // Texto secundario
    800: '#333333',  // Texto principal
    900: '#1A1A1A',
  },
  success: '#10B981',   // Verde
  warning: '#F59E0B',   // Ámbar
  error: '#EF4444',     // Rojo
  info: '#3B82F6',      // Azul
}
```

## Uso de Colores en Componentes

```tsx
{/* Botón primario */}
<button className="bg-primary-500 hover:bg-primary-700 text-white px-4 py-2 rounded-md">
  Guardar
</button>

{/* Botón outline */}
<button className="border border-primary-500 text-primary-500 hover:bg-primary-50 px-4 py-2 rounded-md">
  Cancelar
</button>

{/* Card */}
<div className="bg-white border border-secondary-200 rounded-lg shadow-sm p-6">
  ...
</div>

{/* Badge de estado */}
<span className="bg-success/10 text-success text-xs font-medium px-2.5 py-0.5 rounded-full">
  Activo
</span>

{/* Texto */}
<h1 className="text-secondary-800 text-2xl font-bold">Título</h1>
<p className="text-secondary-600 text-sm">Descripción secundaria</p>
```

## Layout Principal

```tsx
// components/layout/MainLayout.tsx
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Outlet } from "react-router-dom"

export function MainLayout() {
  return (
    <div className="flex h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

## Sidebar (mobile responsive)

```tsx
// components/layout/Sidebar.tsx
import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, X, LayoutDashboard, FolderOpen, Users, ... } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/proyectos", label: "Proyectos", icon: FolderOpen },
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/empleados", label: "Empleados", icon: UserCheck },
  { href: "/subcontratistas", label: "Subcontratistas", icon: Wrench },
  {
    href: "/materiales", label: "Materiales", icon: Package,
    children: [
      { href: "/materiales/inventario", label: "Inventario" },
      { href: "/materiales/solicitudes", label: "Solicitudes" },
      { href: "/materiales/ordenes", label: "Órdenes de Compra" },
    ]
  },
  { href: "/maquinaria", label: "Maquinaria", icon: Truck },
  {
    href: "/finanzas", label: "Finanzas", icon: DollarSign,
    children: [
      { href: "/finanzas/ingresos", label: "Ingresos" },
      { href: "/finanzas/egresos", label: "Egresos" },
      { href: "/finanzas/cobrar", label: "Cuentas por Cobrar" },
      { href: "/finanzas/pagar", label: "Cuentas por Pagar" },
    ]
  },
  { href: "/proveedores", label: "Proveedores", icon: ShoppingBag },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false) // Mobile

  return (
    <>
      {/* Mobile toggle */}
      <button className="lg:hidden fixed top-4 left-4 z-50" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64
        bg-secondary-900 text-white
        transform transition-transform
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <nav className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-secondary-700">
            <h1 className="text-xl font-bold text-primary-300">Constructora Pro</h1>
          </div>
          {/* Nav items */}
          <ul className="flex-1 overflow-y-auto p-2 space-y-1">
            {navItems.map(item => (
              <li key={item.href}>
                <NavLink to={item.href} className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-primary-500 text-white" : "text-secondary-300 hover:bg-secondary-700"
                  }`
                }>
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
                {/* Sub-items si existen */}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
```

## Componentes Reutilizables

### Tabla con TanStack Table
```tsx
// components/shared/DataTable.tsx
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"

export function DataTable({ data, columns }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-lg border border-secondary-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary-100">
          <tr>
            {table.getHeaderGroups().map(headerGroup =>
              headerGroup.headers.map(header => (
                <th key={header.id} className="text-left px-4 py-3 font-semibold text-secondary-700">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t border-secondary-200 hover:bg-secondary-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 text-secondary-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### LoadingSpinner
```tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>
  )
}
```

### ErrorMessage
```tsx
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-error/10 text-error rounded-lg">
      <AlertCircle size={20} />
      <p>{message}</p>
    </div>
  )
}
```

## Responsive: Mobile-first
- `p-4 lg:p-6` - padding menor en móvil
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` - cards apiladas en móvil
- `overflow-x-auto` en tablas para scroll horizontal en móvil
- Modals: `w-full sm:max-w-lg` para fullscreen en móvil
- Sidebar colapsable en móvil (hamburger menu)

## shadcn/ui - Instalación
```bash
npx shadcn-ui@latest init
# Luego agregar componentes necesarios:
npx shadcn-ui@latest add button card dialog form input label select table badge alert tabs checkbox radio-group switch textarea toast calendar dropdown-menu
```
