import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useGetMe } from '@/services/auth.service'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

// Lazy loading de páginas
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ClientesPage = lazy(() => import('@/pages/clientes/ClientesPage'))
const ClienteDetallePage = lazy(() => import('@/pages/clientes/ClienteDetallePage'))
const ProyectosPage = lazy(() => import('@/pages/proyectos/ProyectosPage'))
const ProyectoDetallePage = lazy(() => import('@/pages/proyectos/ProyectoDetallePage'))
const UnidadesPage = lazy(() => import('@/pages/unidades/UnidadesPage'))
const EmpleadosPage = lazy(() => import('@/pages/empleados/EmpleadosPage'))
const EmpleadoDetallePage = lazy(() => import('@/pages/empleados/EmpleadoDetallePage'))
const SubcontratistasPage = lazy(() => import('@/pages/subcontratistas/SubcontratistasPage'))
const ProveedoresPage = lazy(() => import('@/pages/proveedores/ProveedoresPage'))
const CotizacionesPage = lazy(() => import('@/pages/cotizaciones/CotizacionesPage'))
const MaterialesPage = lazy(() => import('@/pages/materiales/MaterialesPage'))
const SolicitudesPage = lazy(() => import('@/pages/materiales/SolicitudesPage'))
const OrdenesPage = lazy(() => import('@/pages/materiales/OrdenesPage'))
const MaquinariaPage = lazy(() => import('@/pages/maquinaria/MaquinariaPage'))
const IngresosPage = lazy(() => import('@/pages/finanzas/IngresosPage'))
const EgresosPage = lazy(() => import('@/pages/finanzas/EgresosPage'))
const CuentasCobrarPage = lazy(() => import('@/pages/finanzas/CuentasCobrarPage'))
const CuentasPagearPage = lazy(() => import('@/pages/finanzas/CuentasPagearPage'))
const ReportesPage = lazy(() => import('@/pages/reportes/ReportesPage'))

// Placeholder para configuración
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-xl font-semibold text-secondary-700 mb-2">{title}</h1>
      <p className="text-secondary-400 text-sm">Módulo en desarrollo</p>
    </div>
  )
}

export default function App() {
  const setLoading = useAuthStore((state) => state.setLoading)

  // Desactivar loading inicial
  useEffect(() => {
    setLoading(false)
  }, [setLoading])

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Clientes */}
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="clientes/:id" element={<ClienteDetallePage />} />

          {/* Proyectos */}
          <Route path="proyectos" element={<ProyectosPage />} />
          <Route path="proyectos/:id" element={<ProyectoDetallePage />} />

          {/* Unidades */}
          <Route path="unidades" element={<UnidadesPage />} />
          <Route path="proyectos/:proyectoId/unidades" element={<UnidadesPage />} />

          {/* Cotizaciones */}
          <Route path="cotizaciones" element={<CotizacionesPage />} />

          {/* Empleados */}
          <Route path="empleados" element={<EmpleadosPage />} />
          <Route path="empleados/:id" element={<EmpleadoDetallePage />} />

          {/* Subcontratistas */}
          <Route path="subcontratistas" element={<SubcontratistasPage />} />

          {/* Materiales */}
          <Route path="materiales" element={<MaterialesPage />} />
          <Route path="materiales/inventario" element={<MaterialesPage />} />
          <Route path="materiales/solicitudes" element={<SolicitudesPage />} />
          <Route path="materiales/ordenes" element={<OrdenesPage />} />

          {/* Maquinaria */}
          <Route path="maquinaria" element={<MaquinariaPage />} />

          {/* Finanzas */}
          <Route path="finanzas" element={<Navigate to="/finanzas/ingresos" replace />} />
          <Route path="finanzas/ingresos" element={<IngresosPage />} />
          <Route path="finanzas/egresos" element={<EgresosPage />} />
          <Route path="finanzas/cobrar" element={<CuentasCobrarPage />} />
          <Route path="finanzas/pagar" element={<CuentasPagearPage />} />

          {/* Proveedores */}
          <Route path="proveedores" element={<ProveedoresPage />} />

          {/* Reportes */}
          <Route path="reportes" element={<ReportesPage />} />

          {/* Configuración (futuro) */}
          <Route path="configuracion" element={<PlaceholderPage title="Configuración" />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
