import { Navigate } from 'react-router-dom'
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

  if (isLoading) return <LoadingSpinner />

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.rol as Rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
