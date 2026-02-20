import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, Rol } from '@/types/usuario'

interface AuthState {
  user: Usuario | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  setUser: (user: Usuario | null) => void
  setTokens: (accessToken: string | null, refreshToken: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  isRole: (roles: Rol[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      isRole: (roles) => {
        const { user } = get()
        if (!user) return false
        return roles.includes(user.rol as Rol)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }),
    }
  )
)
