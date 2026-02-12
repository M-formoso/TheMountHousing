export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

export interface ApiError {
  detail: string
  status_code: number
}

export type Rol =
  | 'super_admin'
  | 'administrador'
  | 'gerente_proyecto'
  | 'supervisor_obra'
  | 'contador'
  | 'compras'
  | 'cliente'
