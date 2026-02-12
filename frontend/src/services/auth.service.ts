import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { LoginRequest, LoginResponse, Usuario, RegisterRequest } from '@/types/usuario'

export function useGetMe(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<Usuario>('/api/v1/auth/me').then((r) => r.data),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => api.post<LoginResponse>('/api/v1/auth/login', data).then((r) => r.data),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => api.post<Usuario>('/api/v1/auth/register', data).then((r) => r.data),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api.post('/api/v1/auth/logout'),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => api.post('/api/v1/auth/forgot-password', data).then((r) => r.data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; new_password: string }) =>
      api.post('/api/v1/auth/reset-password', data).then((r) => r.data),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.put('/api/v1/auth/change-password', data).then((r) => r.data),
  })
}
