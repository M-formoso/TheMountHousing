# Skill: Frontend React - Patrones y Convenciones

## Estructura de una Página (template)

```tsx
// pages/{modulo}/{Modulo}Page.tsx
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { use{Modulo}s } from "@/services/{modulo}.service"
import { {Modulo}Table } from "@/components/{modulo}/{Modulo}Table"
import { {Modulo}Form } from "@/components/{modulo}/{Modulo}Form"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

export default function {Modulo}Page() {
  const { data, isLoading, error } = use{Modulo}s()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error.message} />

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-800">{Modulo}s</h1>
        <Button onClick={() => setIsOpen(true)}>Nuevo {Modulo}</Button>
      </div>
      <{Modulo}Table data={data?.items ?? []} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <{Modulo}Form onSubmit={handleSubmit} onCancel={() => setIsOpen(false)} />
      </Dialog>
    </div>
  )
}
```

## Servicio API (template)

```tsx
// services/{modulo}.service.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { {Modulo}, {Modulo}Create, {Modulo}Update, PaginatedResponse } from "@/types/{modulo}"

const QUERY_KEY = "{modulo}s"

// GET - Listar
export function use{Modulo}s(params?: { skip?: number; limit?: number; activo?: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.get<PaginatedResponse<{Modulo}>>("/api/v1/{modulo}s", { params }).then(r => r.data),
  })
}

// GET - Obtener uno
export function use{Modulo}(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<{Modulo}>(`/api/v1/{modulo}s/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

// POST - Crear
export function useCreate{Modulo}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {Modulo}Create) => api.post<{Modulo}>("/api/v1/{modulo}s", data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

// PUT - Actualizar
export function useUpdate{Modulo}(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {Modulo}Update) => api.put<{Modulo}>(`/api/v1/{modulo}s/${id}`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

// DELETE - Eliminar (soft)
export function useDelete{Modulo}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/{modulo}s/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
```

## Custom Hook de ejemplo

```tsx
// hooks/useDebounce.ts
import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

## Formulario con React Hook Form + Zod (template)

```tsx
// components/{modulo}/{Modulo}Form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormField, FormControl, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255),
  descripcion: z.string().optional(),
  // ... más campos
})

type FormValues = z.infer<typeof formSchema>

interface {Modulo}FormProps {
  onSubmit: (data: FormValues) => void
  onCancel: () => void
  defaultValues?: Partial<FormValues>
}

export function {Modulo}Form({ onSubmit, onCancel, defaultValues }: {Modulo}FormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? { nombre: "", descripcion: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nombre" render={({ field }) => (
          <div>
            <FormLabel>Nombre</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </div>
        )} />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  )
}
```

## Zustand Store (template)

```tsx
// stores/{modulo}.store.ts
import { create } from "zustand"
import type { {Modulo} } from "@/types/{modulo}"

interface {Modulo}Store {
  selected{Modulo}: {Modulo} | null
  set{Modulo}: (item: {Modulo} | null) => void
  filters: { activo: boolean }
  setFilters: (filters: Partial<{ activo: boolean }>) => void
}

export const use{Modulo}Store = create<{Modulo}Store>((set) => ({
  selected{Modulo}: null,
  set{Modulo}: (item) => set({ selected{Modulo}: item }),
  filters: { activo: true },
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}))
```

## Axios interceptor (en lib/axios.ts)

```tsx
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // Para cookies httpOnly
})

// Interceptor de respuesta - manejar 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh token automáticamente
      // Si falla, redirigir a login
    }
    return Promise.reject(error)
  }
)

export default api
```

## Tipos compartidos

```tsx
// types/common.ts
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

export interface ApiError {
  detail: string
  status_code: number
}
```

## Enrutamiento (React Router v6)
- Rutas protegidas con componente `<ProtectedRoute>` que verifica auth
- Rutas por rol: `<RoleRoute allowedRoles={[...]}>`
- Layout principal con Sidebar siempre presente (excepto auth pages)
