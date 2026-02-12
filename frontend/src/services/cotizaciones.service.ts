import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Cotizacion, CotizacionCreate, CotizacionUpdate } from '@/types/cotizacion'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'cotizaciones'

interface ListParams { skip?: number; limit?: number; activo?: boolean; buscar?: string; estado?: string; cliente_id?: string }

export function useCotizaciones(params?: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<PaginatedResponse<Cotizacion>>('/api/v1/cotizaciones', { params }).then((r) => r.data),
  })
}

export function useCotizacion(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Cotizacion>(`/api/v1/cotizaciones/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateCotizacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CotizacionCreate) => api.post<Cotizacion>('/api/v1/cotizaciones', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateCotizacion(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CotizacionUpdate) => api.put<Cotizacion>(`/api/v1/cotizaciones/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteCotizacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/cotizaciones/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
