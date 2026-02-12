import { create } from 'zustand'
import type { Usuario, Rol } from '@/types/usuario'

interface AuthState {
  user: Usuario | null
  isLoading: boolean
  setUser: (user: Usuario | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  isRole: (roles: Rol[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
  isRole: (roles) => {
    const { user } = get()
    if (!user) return false
    return roles.includes(user.rol as Rol)
  },
}))
