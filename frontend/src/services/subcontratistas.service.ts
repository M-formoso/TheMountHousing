import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Subcontratista, SubcontratistaCreate, SubcontratistaUpdate } from '@/types/subcontratista'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'subcontratistas'

interface ListParams { skip?: number; limit?: number; activo?: boolean; buscar?: string; especialidad?: string }

export function useSubcontratistas(params?: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<PaginatedResponse<Subcontratista>>('/api/v1/subcontratistas', { params }).then((r) => r.data),
  })
}

export function useSubcontratista(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Subcontratista>(`/api/v1/subcontratistas/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateSubcontratista() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubcontratistaCreate) => api.post<Subcontratista>('/api/v1/subcontratistas', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateSubcontratista(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubcontratistaUpdate) => api.put<Subcontratista>(`/api/v1/subcontratistas/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteSubcontratista() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/subcontratistas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
