import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin, useGetMe } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [userId2FA, setUserId2FA] = useState('')

  const loginMutation = useLogin()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()
  const { refetch: refetchMe } = useGetMe(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await loginMutation.mutateAsync({ email, password })

      if (response.requires_2fa && response.user_id) {
        setRequires2FA(true)
        setUserId2FA(response.user_id)
        return
      }

      // Login exitoso - refetchear usuario
      try {
        const { data } = await refetchMe()
        if (data) {
          setUser(data)
          navigate('/dashboard')
        } else {
          setError('Error al obtener datos del usuario')
        }
      } catch {
        // Si falla obtener el usuario, intentar navegar igual
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || 'Error al iniciar sesión')
    }
  }

  if (requires2FA) {
    return <TwoFAPage userId={userId2FA} onSuccess={() => navigate('/dashboard')} />
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8">
        {/* Logo / Marca */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="Logo Constructora Pro"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary-800">Constructora Pro</h1>
          <p className="text-secondary-500 text-sm mt-1">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@constructora.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Olvidaste contraseña */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={loginMutation.isPending} className="btn-primary w-full">
            {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente 2FA incrustado
function TwoFAPage({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((state) => state.setUser)
  const { refetch: refetchMe } = useGetMe()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/api/v1/auth/verify-2fa', { user_id: userId, code })
      const { data } = await refetchMe()
      if (data) setUser(data)
      onSuccess()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail || 'Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-secondary-800">Verificación 2FA</h1>
          <p className="text-secondary-500 text-sm mt-1">Ingresa el código de tu aplicación de autenticación</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Código de 6 dígitos</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="input-field text-center text-lg tracking-widest"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      </div>
    </div>
  )
}
