import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type {
  Proyecto, ProyectoCreate, ProyectoUpdate,
  FaseProyecto, FaseCreate, FaseUpdate,
  EntradaBitacora, EntradaBitacoraCreate,
} from '@/types/proyecto'
import type { PaginatedResponse } from '@/types/common'

const QUERY_KEY = 'proyectos'

interface ListParams {
  skip?: number
  limit?: number
  activo?: boolean
  buscar?: string
  estado?: string
  tipo?: string
  cliente_id?: string
}

export function useProyectos(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Proyecto>>('/api/v1/proyectos', { params }).then((r) => r.data),
  })
}

export function useProyecto(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Proyecto>(`/api/v1/proyectos/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateProyecto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProyectoCreate) => api.post<Proyecto>('/api/v1/proyectos', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateProyecto(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProyectoUpdate) => api.put<Proyecto>(`/api/v1/proyectos/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useDeleteProyecto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/proyectos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

// --- Fases ---
export function useProyectoFases(proyectoId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, proyectoId, 'fases'],
    queryFn: () => api.get<FaseProyecto[]>(`/api/v1/proyectos/${proyectoId}/fases`).then((r) => r.data),
    enabled: !!proyectoId,
  })
}

export function useCreateFase(proyectoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FaseCreate) => api.post<FaseProyecto>(`/api/v1/proyectos/${proyectoId}/fases`, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY, proyectoId, 'fases'] }),
  })
}

export function useUpdateFase(proyectoId: string, faseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FaseUpdate) => api.put<FaseProyecto>(`/api/v1/proyectos/${proyectoId}/fases/${faseId}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, proyectoId, 'fases'] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, proyectoId] })
    },
  })
}

// --- Bitácora ---
export function useProyectoBitacora(proyectoId: string, params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: [QUERY_KEY, proyectoId, 'bitacora', params],
    queryFn: () => api.get<EntradaBitacora[]>(`/api/v1/proyectos/${proyectoId}/bitacora`, { params }).then((r) => r.data),
    enabled: !!proyectoId,
  })
}

export function useCreateBitacora(proyectoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EntradaBitacoraCreate) => api.post<EntradaBitacora>(`/api/v1/proyectos/${proyectoId}/bitacora`, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY, proyectoId, 'bitacora'] }),
  })
}

// --- Dashboard ---
export function useProyectoDashboard(proyectoId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, proyectoId, 'dashboard'],
    queryFn: () => api.get(`/api/v1/proyectos/${proyectoId}/dashboard`).then((r) => r.data),
    enabled: !!proyectoId,
  })
}
