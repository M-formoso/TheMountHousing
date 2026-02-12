import { Rol } from './common'

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string | null
  telefono: string | null
  rol: Rol
  is_2fa_enabled: boolean
  activo: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  rol: Rol
  nombre: string
  email: string
  requires_2fa?: boolean
  user_id?: string
}

export interface RegisterRequest {
  email: string
  password: string
  nombre: string
  apellido?: string
  telefono?: string
  rol?: Rol
}
