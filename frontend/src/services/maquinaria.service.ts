import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Maquinaria, MaquinariaCreate, MaquinariaUpdate, MantenimientoMaquinaria, MantenimientoCreate } from '@/types/maquinaria'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'maquinaria'

interface ListParams { skip?: number; limit?: number; activo?: boolean; buscar?: string; tipo?: string; estado?: string }

export function useMaquinarias(params?: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<PaginatedResponse<Maquinaria>>('/api/v1/maquinaria', { params }).then((r) => r.data),
  })
}

export function useMaquinaria(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Maquinaria>(`/api/v1/maquinaria/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateMaquinaria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MaquinariaCreate) => api.post<Maquinaria>('/api/v1/maquinaria', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateMaquinaria(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MaquinariaUpdate) => api.put<Maquinaria>(`/api/v1/maquinaria/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteMaquinaria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/maquinaria/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useMaquinariaMantenimientos(id: string) {
  return useQuery({
    queryKey: [KEY, id, 'mantenimientos'],
    queryFn: () => api.get<MantenimientoMaquinaria[]>(`/api/v1/maquinaria/${id}/mantenimientos`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateMantenimiento(maquinariaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MantenimientoCreate) => api.post<MantenimientoMaquinaria>(`/api/v1/maquinaria/${maquinariaId}/mantenimientos`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY, maquinariaId, 'mantenimientos'] }); qc.invalidateQueries({ queryKey: [KEY, maquinariaId] }) },
  })
}
