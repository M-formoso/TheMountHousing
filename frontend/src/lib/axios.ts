import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// Interceptor de petición para agregar token de autorización
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta para manejar 401 automáticamente
let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = []

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // No intentar refresh en estas rutas
    const skipRefreshUrls = ['/api/v1/auth/login', '/api/v1/auth/refresh']
    const shouldSkipRefresh = skipRefreshUrls.some((url) => originalRequest.url?.includes(url))

    // Si es 401 y no estamos en un loop de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await api.post('/api/v1/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })

        const { access_token, refresh_token } = response.data
        useAuthStore.getState().setTokens(access_token, refresh_token)

        processQueue(null, access_token)
        isRefreshing = false

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false
        useAuthStore.getState().logout()
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default api
