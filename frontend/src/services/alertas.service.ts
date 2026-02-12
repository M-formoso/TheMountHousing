import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Alerta } from '@/types/alerta'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'alertas'

export function useAlertas(params?: { skip?: number; limit?: number; leida?: boolean; tipo?: string }) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<PaginatedResponse<Alerta>>('/api/v1/alertas', { params }).then((r) => r.data),
  })
}

export function useAlertasNoLeidas() {
  return useQuery({
    queryKey: [KEY, 'contador'],
    queryFn: () => api.get<{ total: number }>('/api/v1/alertas/no-leidas/contador').then((r) => r.data),
    refetchInterval: 60000,
  })
}

export function useMarcarAlertaLeida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.put<Alerta>(`/api/v1/alertas/${id}/leer`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}

export function useMarcarTodasLeidas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.put('/api/v1/alertas/todas/leer').then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }) },
  })
}
