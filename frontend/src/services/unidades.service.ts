import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

const QUERY_KEY = 'unidades'

export interface Unidad {
  id: string
  numero_unidad: string
  proyecto_id: string
  tipo_casa: string | null
  metros_cuadrados: number
  precio_por_m2: number | null
  precio_total: number | null
  estado: 'disponible' | 'reservada' | 'vendida' | 'en_construccion'
  cliente_id: string | null
  descripcion: string | null
  caracteristicas: string | null
  nivel: string | null
  habitaciones: number | null
  banos: number | null
  estacionamientos: number | null
  notas: string | null
  imagen_url: string | null
  plano_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface UnidadCreate {
  numero_unidad: string
  proyecto_id: string
  tipo_casa?: string | null
  metros_cuadrados: number
  precio_por_m2?: number | null
  precio_total?: number | null
  estado?: string
  cliente_id?: string | null
  descripcion?: string | null
  caracteristicas?: string | null
  nivel?: string | null
  habitaciones?: number | null
  banos?: number | null
  estacionamientos?: number | null
  notas?: string | null
  imagen_url?: string | null
  plano_url?: string | null
}

export interface UnidadUpdate extends Partial<UnidadCreate> {}

interface ListParams {
  skip?: number
  limit?: number
  proyecto_id?: string
  estado?: string
}

export function useUnidades(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.get<Unidad[]>('/api/v1/unidades', { params }).then((r) => r.data),
  })
}

export function useUnidadesDisponibles(proyecto_id?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'disponibles', proyecto_id],
    queryFn: () => api.get<Unidad[]>('/api/v1/unidades/disponibles', { params: { proyecto_id } }).then((r) => r.data),
  })
}

export function useUnidad(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Unidad>(`/api/v1/unidades/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateUnidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UnidadCreate) => api.post<Unidad>('/api/v1/unidades', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateUnidad(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UnidadUpdate) => api.put<Unidad>(`/api/v1/unidades/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useDeleteUnidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/unidades/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useAsignarCliente(unidadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cliente_id: string) =>
      api.post<Unidad>(`/api/v1/unidades/${unidadId}/asignar-cliente`, { cliente_id }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, unidadId] })
    },
  })
}

export function useLiberarUnidad(unidadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Unidad>(`/api/v1/unidades/${unidadId}/liberar`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, unidadId] })
    },
  })
}
