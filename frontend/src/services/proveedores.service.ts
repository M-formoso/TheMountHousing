import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type {
  Proveedor, ProveedorCreate, ProveedorUpdate,
  AccionProveedor, AccionProveedorCreate, AccionProveedorUpdate,
  AdjuntoCreate, Adjunto
} from '@/types/proveedor'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'proveedores'
const ACCIONES_KEY = 'acciones-proveedor'

// ==================== PROVEEDORES ====================

interface ListParams {
  skip?: number
  limit?: number
  activo?: boolean
  buscar?: string
  categoria?: string
  estado?: string
  especialidad?: string
  preferido?: boolean
}

export function useProveedores(params?: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<PaginatedResponse<Proveedor>>('/api/v1/proveedores', { params }).then((r) => r.data),
  })
}

export function useProveedor(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Proveedor>(`/api/v1/proveedores/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProveedorCreate) => api.post<Proveedor>('/api/v1/proveedores', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateProveedor(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProveedorUpdate) => api.put<Proveedor>(`/api/v1/proveedores/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: [KEY, id] })
    },
  })
}

export function useDeleteProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/proveedores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

// ==================== ACCIONES DE PROVEEDOR ====================

interface AccionesParams {
  skip?: number
  limit?: number
  tipo?: string
  estado?: string
}

export function useAccionesProveedor(proveedorId: string, params?: AccionesParams) {
  return useQuery({
    queryKey: [ACCIONES_KEY, proveedorId, params],
    queryFn: () =>
      api.get<PaginatedResponse<AccionProveedor>>(`/api/v1/proveedores/${proveedorId}/acciones`, { params })
        .then((r) => r.data),
    enabled: !!proveedorId,
  })
}

export function useCreateAccion(proveedorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AccionProveedorCreate) =>
      api.post<AccionProveedor>(`/api/v1/proveedores/${proveedorId}/acciones`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ACCIONES_KEY, proveedorId] })
      qc.invalidateQueries({ queryKey: [KEY, proveedorId] })
    },
  })
}

export function useUpdateAccion(proveedorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ accionId, data }: { accionId: string; data: AccionProveedorUpdate }) =>
      api.put<AccionProveedor>(`/api/v1/proveedores/${proveedorId}/acciones/${accionId}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ACCIONES_KEY, proveedorId] })
      qc.invalidateQueries({ queryKey: [KEY, proveedorId] })
    },
  })
}

export function useDeleteAccion(proveedorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (accionId: string) =>
      api.delete(`/api/v1/proveedores/${proveedorId}/acciones/${accionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ACCIONES_KEY, proveedorId] })
      qc.invalidateQueries({ queryKey: [KEY, proveedorId] })
    },
  })
}

// ==================== ADJUNTOS ====================

export function useAddAdjunto(proveedorId: string, accionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdjuntoCreate) =>
      api.post<Adjunto>(`/api/v1/proveedores/${proveedorId}/acciones/${accionId}/adjuntos`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACCIONES_KEY, proveedorId] }),
  })
}

export function useDeleteAdjunto(proveedorId: string, accionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (adjuntoId: string) =>
      api.delete(`/api/v1/proveedores/${proveedorId}/acciones/${accionId}/adjuntos/${adjuntoId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACCIONES_KEY, proveedorId] }),
  })
}
