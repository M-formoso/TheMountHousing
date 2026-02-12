import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Cliente, ClienteCreate, ClienteUpdate, ContactoCliente } from '@/types/cliente'
import type { PaginatedResponse } from '@/types/common'

const QUERY_KEY = 'clientes'

interface ListParams {
  skip?: number
  limit?: number
  activo?: boolean
  buscar?: string
  tipo?: string
}

export function useClientes(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Cliente>>('/api/v1/clientes', { params }).then((r) => r.data),
  })
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Cliente>(`/api/v1/clientes/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClienteCreate) => api.post<Cliente>('/api/v1/clientes', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useUpdateCliente(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClienteUpdate) => api.put<Cliente>(`/api/v1/clientes/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useDeleteCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/clientes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export function useClienteProyectos(clienteId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, clienteId, 'proyectos'],
    queryFn: () => api.get(`/api/v1/clientes/${clienteId}/proyectos`).then((r) => r.data),
    enabled: !!clienteId,
  })
}

export function useClienteContactos(clienteId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, clienteId, 'contactos'],
    queryFn: () => api.get<ContactoCliente[]>(`/api/v1/clientes/${clienteId}/contactos`).then((r) => r.data),
    enabled: !!clienteId,
  })
}

export function useCreateContacto(clienteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { nombre: string; puesto?: string; email?: string; telefono?: string; es_principal?: boolean }) =>
      api.post<ContactoCliente>(`/api/v1/clientes/${clienteId}/contactos`, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY, clienteId, 'contactos'] }),
  })
}
