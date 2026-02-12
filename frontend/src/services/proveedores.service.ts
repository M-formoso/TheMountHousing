import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '@/types/proveedor'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'proveedores'

interface ListParams { skip?: number; limit?: number; activo?: boolean; buscar?: string; tipo?: string }

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/proveedores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
