import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Empleado, EmpleadoCreate, EmpleadoUpdate } from '@/types/empleado'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'empleados'

interface ListParams { skip?: number; limit?: number; activo?: boolean; buscar?: string; departamento?: string }

export function useEmpleados(params?: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<PaginatedResponse<Empleado>>('/api/v1/empleados', { params }).then((r) => r.data),
  })
}

export function useEmpleado(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Empleado>(`/api/v1/empleados/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmpleadoCreate) => api.post<Empleado>('/api/v1/empleados', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateEmpleado(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmpleadoUpdate) => api.put<Empleado>(`/api/v1/empleados/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/empleados/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
