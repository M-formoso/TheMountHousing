import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Material, MaterialCreate, MaterialUpdate, MovimientoCreate, MovimientoInventario, SolicitudCompra, SolicitudCompraCreate, OrdenCompra, OrdenCompraCreate } from '@/types/material'
import type { PaginatedResponse } from '@/types/common'

const KEY = 'materiales'

interface ListParams { skip?: number; limit?: number; activo?: boolean; buscar?: string; categoria?: string }

export function useMateriales(params?: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<PaginatedResponse<Material>>('/api/v1/materiales', { params }).then((r) => r.data),
  })
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Material>(`/api/v1/materiales/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MaterialCreate) => api.post<Material>('/api/v1/materiales', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateMaterial(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MaterialUpdate) => api.put<Material>(`/api/v1/materiales/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/materiales/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

// --- Movimientos ---
export function useMaterialMovimientos(materialId: string) {
  return useQuery({
    queryKey: [KEY, materialId, 'movimientos'],
    queryFn: () => api.get<MovimientoInventario[]>(`/api/v1/materiales/${materialId}/movimientos`).then((r) => r.data),
    enabled: !!materialId,
  })
}

export function useCreateMovimiento(materialId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MovimientoCreate) => api.post<MovimientoInventario>(`/api/v1/materiales/${materialId}/movimientos`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY, materialId, 'movimientos'] }); qc.invalidateQueries({ queryKey: [KEY, materialId] }) },
  })
}

// --- Solicitudes ---
export function useSolicitudesCompra(params?: { skip?: number; limit?: number; estado?: string }) {
  return useQuery({
    queryKey: ['solicitudes', params],
    queryFn: () => api.get<PaginatedResponse<SolicitudCompra>>('/api/v1/materiales/solicitudes', { params }).then((r) => r.data),
  })
}

export function useCreateSolicitud() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SolicitudCompraCreate) => api.post<SolicitudCompra>('/api/v1/materiales/solicitudes', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['solicitudes'] }),
  })
}

export function useUpdateSolicitud(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { estado?: string }) => api.put<SolicitudCompra>(`/api/v1/materiales/solicitudes/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['solicitudes'] }),
  })
}

// --- Órdenes ---
export function useOrdenesCompra(params?: { skip?: number; limit?: number; estado?: string }) {
  return useQuery({
    queryKey: ['ordenes', params],
    queryFn: () => api.get<PaginatedResponse<OrdenCompra>>('/api/v1/materiales/ordenes', { params }).then((r) => r.data),
  })
}

export function useCreateOrden() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrdenCompraCreate) => api.post<OrdenCompra>('/api/v1/materiales/ordenes', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  })
}

export function useUpdateOrden(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { estado?: string }) => api.put<OrdenCompra>(`/api/v1/materiales/ordenes/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  })
}
