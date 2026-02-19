import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type {
  Ingreso, IngresoCreate,
  Egreso, EgresoCreate,
  CuentaPorCobrar, CuentaCobrarCreate, PagoCreate,
  CuentaPorPagar, CuentaPagearCreate,
} from '@/types/finanzas'
import type { PaginatedResponse } from '@/types/common'

// --- Ingresos ---
export function useIngresos(params?: { skip?: number; limit?: number; proyecto_id?: string; tipo?: string }) {
  return useQuery({
    queryKey: ['ingresos', params],
    queryFn: () => api.get<PaginatedResponse<Ingreso>>('/api/v1/finanzas/ingresos', { params }).then((r) => r.data),
  })
}

export function useCreateIngreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: IngresoCreate) => api.post<Ingreso>('/api/v1/finanzas/ingresos', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingresos'] }),
  })
}

export function useDeleteIngreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/finanzas/ingresos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingresos'] }),
  })
}

// --- Egresos ---
export function useEgresos(params?: { skip?: number; limit?: number; proyecto_id?: string; categoria?: string; estado_pago?: string }) {
  return useQuery({
    queryKey: ['egresos', params],
    queryFn: () => api.get<PaginatedResponse<Egreso>>('/api/v1/finanzas/egresos', { params }).then((r) => r.data),
  })
}

export function useCreateEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EgresoCreate) => api.post<Egreso>('/api/v1/finanzas/egresos', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['egresos'] }),
  })
}

export function useUpdateEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EgresoCreate> & { estado_pago?: string } }) =>
      api.put<Egreso>(`/api/v1/finanzas/egresos/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['egresos'] }),
  })
}

export function useDeleteEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/finanzas/egresos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['egresos'] }),
  })
}

// --- Cuentas por Cobrar ---
export function useCuentasCobrar(params?: { skip?: number; limit?: number; estado?: string }) {
  return useQuery({
    queryKey: ['cuentas_cobrar', params],
    queryFn: () => api.get<PaginatedResponse<CuentaPorCobrar>>('/api/v1/finanzas/cobrar', { params }).then((r) => r.data),
  })
}

export function useCreateCuentaCobrar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CuentaCobrarCreate) => api.post<CuentaPorCobrar>('/api/v1/finanzas/cobrar', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuentas_cobrar'] }),
  })
}

export function usePagarCuentaCobrar(cuentaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PagoCreate) => api.post(`/api/v1/finanzas/cobrar/${cuentaId}/pagos`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuentas_cobrar'] }),
  })
}

// --- Cuentas por Pagar ---
export function useCuentasPagar(params?: { skip?: number; limit?: number; estado?: string }) {
  return useQuery({
    queryKey: ['cuentas_pagar', params],
    queryFn: () => api.get<PaginatedResponse<CuentaPorPagar>>('/api/v1/finanzas/pagar', { params }).then((r) => r.data),
  })
}

export function useCreateCuentaPagar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CuentaPagearCreate) => api.post<CuentaPorPagar>('/api/v1/finanzas/pagar', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuentas_pagar'] }),
  })
}

export function usePagarCuentaPagar(cuentaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PagoCreate) => api.post(`/api/v1/finanzas/pagar/${cuentaId}/pagos`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuentas_pagar'] }),
  })
}
