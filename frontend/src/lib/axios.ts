import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // Enviar cookies httpOnly
})

// Interceptor de respuesta para manejar 401 automáticamente
let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = []

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(undefined)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // No intentar refresh en estas rutas (solo login y refresh)
    const skipRefreshUrls = ['/api/v1/auth/login', '/api/v1/auth/refresh']
    const shouldSkipRefresh = skipRefreshUrls.some((url) => originalRequest.url?.includes(url))

    // Si es 401 y no estamos en un loop de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        // Si ya estamos refrescando, encolar esta petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Intentar renovar token
        await api.post('/api/v1/auth/refresh')
        processQueue()
        isRefreshing = false
        // Reintentar la petición original
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
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
