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
const UsuariosPage = lazy(() => import('@/pages/usuarios/UsuariosPage'))
const UnidadesPage = lazy(() => import('@/pages/unidades/UnidadesPage'))
const UnidadDetallePage = lazy(() => import('@/pages/unidades/UnidadDetallePage'))
const ProveedoresPage = lazy(() => import('@/pages/proveedores/ProveedoresPage'))
const ProveedorDetallePage = lazy(() => import('@/pages/proveedores/ProveedorDetallePage'))
const MaterialesPage = lazy(() => import('@/pages/materiales/MaterialesPage'))
const SolicitudesPage = lazy(() => import('@/pages/materiales/SolicitudesPage'))
const OrdenesPage = lazy(() => import('@/pages/materiales/OrdenesPage'))
const MaquinariaPage = lazy(() => import('@/pages/maquinaria/MaquinariaPage'))
const FinanzasDashboard = lazy(() => import('@/pages/finanzas/FinanzasDashboard'))
const IngresosPage = lazy(() => import('@/pages/finanzas/IngresosPage'))
const EgresosPage = lazy(() => import('@/pages/finanzas/EgresosPage'))
const CuentasCobrarPage = lazy(() => import('@/pages/finanzas/CuentasCobrarPage'))
const CuentasPagearPage = lazy(() => import('@/pages/finanzas/CuentasPagearPage'))
const ReportesPage = lazy(() => import('@/pages/reportes/ReportesPage'))
const ROIAnalysisPage = lazy(() => import('@/pages/roi/ROIAnalysisPage'))
const MiUnidadPage = lazy(() => import('@/pages/cliente/MiUnidadPage'))

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
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  // Verificar sesión existente al cargar
  const { data: user, isLoading: isLoadingUser, isError } = useGetMe()

  useEffect(() => {
    if (!isLoadingUser) {
      if (user && !isError) {
        setUser(user)
      } else {
        setLoading(false)
      }
    }
  }, [user, isLoadingUser, isError, setUser, setLoading])

  // Mostrar loading mientras verifica la sesión
  if (isLoadingUser) {
    return <LoadingSpinner />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta especial para clientes */}
        <Route
          path="/mi-unidad"
          element={
            <ProtectedRoute>
              <MiUnidadPage />
            </ProtectedRoute>
          }
        />

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

          {/* Clientes - Redirigir a Usuarios */}
          <Route path="clientes" element={<Navigate to="/usuarios" replace />} />
          <Route path="clientes/:id" element={<Navigate to="/usuarios" replace />} />

          {/* Unidades */}
          <Route path="unidades" element={<UnidadesPage />} />
          <Route path="unidades/:id" element={<UnidadDetallePage />} />

          {/* Usuarios */}
          <Route path="usuarios" element={<UsuariosPage />} />


          {/* Subcontratistas - Redirigir a Proveedores */}
          <Route path="subcontratistas" element={<Navigate to="/proveedores" replace />} />

          {/* Materiales */}
          <Route path="materiales" element={<MaterialesPage />} />
          <Route path="materiales/inventario" element={<MaterialesPage />} />
          <Route path="materiales/solicitudes" element={<SolicitudesPage />} />
          <Route path="materiales/ordenes" element={<OrdenesPage />} />

          {/* Maquinaria */}
          <Route path="maquinaria" element={<MaquinariaPage />} />

          {/* Finanzas */}
          <Route path="finanzas" element={<FinanzasDashboard />} />
          <Route path="finanzas/ingresos" element={<IngresosPage />} />
          <Route path="finanzas/egresos" element={<EgresosPage />} />
          <Route path="finanzas/cobrar" element={<CuentasCobrarPage />} />
          <Route path="finanzas/pagar" element={<CuentasPagearPage />} />
          <Route path="finanzas/roi" element={<ROIAnalysisPage />} />
          <Route path="finanzas/reportes" element={<ReportesPage />} />

          {/* Redirecciones antiguas */}
          <Route path="roi" element={<Navigate to="/finanzas/roi" replace />} />
          <Route path="reportes" element={<Navigate to="/finanzas/reportes" replace />} />

          {/* Proveedores */}
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="proveedores/:id" element={<ProveedorDetallePage />} />

          {/* Configuración (futuro) */}
          <Route path="configuracion" element={<PlaceholderPage title="Configuración" />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
