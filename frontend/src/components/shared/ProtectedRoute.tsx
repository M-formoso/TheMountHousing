import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { LoadingSpinner } from './LoadingSpinner'
import type { Rol } from '@/types/common'

interface Props {
  allowedRoles?: Rol[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: Props) {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const location = useLocation()

  if (isLoading) return <LoadingSpinner />

  if (!user) return <Navigate to="/login" replace />

  // Si es cliente y no está en su ruta especial, redirigir
  if (user.rol === 'cliente' && !location.pathname.startsWith('/mi-unidad')) {
    return <Navigate to="/mi-unidad" replace />
  }

  // Si no es cliente y trata de acceder a mi-unidad, redirigir al dashboard
  if (user.rol !== 'cliente' && location.pathname.startsWith('/mi-unidad')) {
    return <Navigate to="/dashboard" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol as Rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
