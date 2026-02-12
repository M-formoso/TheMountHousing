# Constructora Pro - Agent Instructions

## Proyecto
Sistema de Gestión Integral para empresas constructoras. Monorepo con backend FastAPI + frontend React.
~150 usuarios (empleados, clientes, subcontratistas). Web responsive.

## Tech Stack
| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI 0.104+, Python 3.11+, Pydantic v2 |
| ORM | SQLAlchemy 2.0 + Alembic |
| Auth | python-jose (JWT) + passlib (bcrypt) |
| DB | PostgreSQL 15+ |
| Workers | Celery + Redis |
| Storage | Cloudinary |
| Frontend | React 18 + Vite + TypeScript 5+ |
| Styling | Tailwind CSS + shadcn/ui + lucide-react |
| State | Zustand |
| Data | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Router | React Router v6 |
| HTTP | Axios |
| Infra | Docker + Docker Compose + Nginx |

## Estructura del Monorepo
```
constructora-pro/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Routers por módulo
│   │   ├── core/               # config, security, deps, celery
│   │   ├── db/                 # base, session, init_db
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── services/           # Business logic
│   │   ├── tasks/              # Celery tasks
│   │   ├── utils/              # helpers, email, pdf
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/         # UI reusables + módulos
│   │   ├── pages/              # Vistas por módulo
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # Axios API calls
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/
│   │   ├── constants/
│   │   └── lib/                # shadcn config
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

## Módulos del Sistema (prioridad de desarrollo)
1. **Auth/Usuarios** - JWT, roles (SuperAdmin, Administrador, GerenteProy, SupervisorObra, Contador, Compras, Cliente), 2FA
2. **Proyectos** - CRUD + fases, bitácora, galería, cronograma, KPIs
3. **Clientes** - CRUD persona física/moral, estado de cuenta
4. **Cotizaciones** - Partidas, PDF, firma, conversión a proyecto
5. **Empleados** - CRUD + asistencia, capacitaciones
6. **Subcontratistas** - CRUD + calificación, lista negra
7. **Materiales/Inventario** - Stock, solicitudes/órdenes de compra
8. **Maquinaria** - Asignaciones, mantenimientos, bitácora
9. **Proveedores** - CRUD + evaluaciones, comparativa precios
10. **Finanzas** - Ingresos, egresos, cuentas cobrar/pagar, P&L
11. **Alertas** - Celery tasks diarias, notificaciones
12. **Reportes** - PDF, Excel, dashboards por rol
13. **Configuración** - Datos empresa, SMTP, plantillas

## Convenciones de Código

### Backend
- Todas las IDs son UUID (uuid4)
- Soft delete: campo `activo: bool` (no DELETE físico)
- Campos `created_at` y `updated_at` automáticos en todos los modelos
- Servicios en capa separada (no lógica en endpoints)
- Endpoints retornan schemas Pydantic (nunca modelos ORM directamente)
- Errores HTTP con mensajes en español
- Paginación por defecto: `skip=0, limit=20`
- Filtros opcionales en todos los listar

### Frontend
- Componentes en PascalCase, hooks en camelCase con prefijo `use`
- Cada módulo tiene su carpeta en components/ y pages/
- Colores: Beige primary (#8C785A), Gris secondary (#808080)
- Todas las llamadas API pasan por services/
- Zustand stores separados por módulo
- React Query para server state, Zustand para client state
- Formularios siempre con React Hook Form + Zod validation
- Responsive mobile-first

### Seguridad
- JWT: access token 15 min, refresh token 7 días
- Tokens en httpOnly cookies
- RBAC en cada endpoint con dependency
- Rate limiting en auth endpoints
- Encriptar datos bancarios en BD
- Validar tipos de archivo en uploads (Cloudinary)

## Skills Disponibles
Referencia los archivos en `/skills/` para patrones específicos:
- `backend-fastapi.md` - Patrones de endpoints, servicios, errores
- `frontend-react.md` - Patrones de componentes, hooks, stores, API
- `database-sqlalchemy.md` - Modelos, relaciones, migraciones
- `auth-security.md` - JWT, RBAC, 2FA
- `docker-infra.md` - Compose, nginx, env
- `ui-components.md` - Tailwind, shadcn, colores, responsive
