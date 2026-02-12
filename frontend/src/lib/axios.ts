import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // Enviar cookies httpOnly
})

// Interceptor de respuesta para manejar 401 automáticamente
let isRefreshing = false

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // No intentar refresh en estas rutas
    const skipRefreshUrls = ['/api/v1/auth/login', '/api/v1/auth/refresh', '/api/v1/auth/me']
    const shouldSkipRefresh = skipRefreshUrls.some((url) => originalRequest.url?.includes(url))

    // Si es 401 y no estamos en un loop de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing && !shouldSkipRefresh) {
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Intentar renovar token
        await api.post('/api/v1/auth/refresh')
        isRefreshing = false
        // Reintentar la petición original
        return api(originalRequest)
      } catch {
        isRefreshing = false
        // Solo redirigir si no estamos ya en login
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
