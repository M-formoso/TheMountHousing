# Constructora Pro - Sistema de Gestion para Empresas Constructoras

Sistema integral de gestion empresarial disenado especificamente para empresas constructoras. Maneja proyectos, clientes, empleados, materiales, maquinaria, finanzas y mas, todo en una plataforma moderna y eficiente.

## Caracteristicas Principales

### Modulos Disponibles

- **Gestion de Clientes** - Registro y seguimiento de clientes individuales y empresariales
- **Gestion de Proyectos** - Control completo de obras con fases, bitacora y documentos
- **Cotizaciones** - Generacion y seguimiento de presupuestos con partidas detalladas
- **Empleados** - Administracion de personal con datos laborales y medicos
- **Subcontratistas** - Registro de empresas subcontratadas por especialidad
- **Proveedores** - Control de proveedores con calificaciones e historial
- **Materiales** - Inventario, movimientos, solicitudes y ordenes de compra
- **Maquinaria** - Control de equipo con mantenimientos y costos
- **Finanzas** - Ingresos, egresos, cuentas por cobrar/pagar
- **Reportes** - Analisis financiero por proyecto y categoria
- **Alertas** - Notificaciones automaticas de eventos importantes

### Funcionalidades Destacadas

- Autenticacion y autorizacion con JWT y cookies httpOnly
- 7 roles de usuario (Super Admin, Administrador, Gerente Proyecto, Supervisor, Contador, Compras, Empleado)
- Control de acceso basado en roles (RBAC)
- Generacion automatica de codigos unicos para entidades
- Paginacion y busqueda en todos los listados
- Calculos automaticos (totales, saldos, IVA, etc.)
- Soft-delete para todas las entidades
- Responsive design optimizado para movil y desktop
- Lazy loading de paginas para mejor rendimiento
- Estado global con Zustand y React Query
- Validacion de formularios con React Hook Form + Zod

## Stack Tecnologico

### Backend
- **Framework**: FastAPI 0.104+
- **Base de datos**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0 con Alembic
- **Validacion**: Pydantic v2
- **Autenticacion**: JWT con cookies httpOnly
- **Cache/Tareas**: Redis + Celery
- **Testing**: Pytest
- **Linting**: Black, isort, flake8

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build tool**: Vite 5
- **Routing**: React Router v6
- **Estado**: Zustand + TanStack Query
- **Estilos**: Tailwind CSS 3
- **HTTP Client**: Axios
- **Validacion**: React Hook Form + Zod
- **Iconos**: Lucide React

### DevOps
- **Containerizacion**: Docker + Docker Compose
- **Servidor web**: Nginx (proxy reverso)
- **App server**: Gunicorn + Uvicorn workers

## Estructura del Proyecto

```
.
├── backend/
│   ├── alembic/                 # Migraciones de base de datos
│   │   └── versions/            # Scripts de migracion
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/   # Endpoints de la API
│   │   │       └── api.py       # Router principal
│   │   ├── core/                # Configuracion y seguridad
│   │   ├── db/                  # Base de datos y sesiones
│   │   ├── models/              # Modelos SQLAlchemy
│   │   ├── schemas/             # Esquemas Pydantic
│   │   ├── services/            # Logica de negocio
│   │   └── main.py              # Punto de entrada FastAPI
│   ├── tests/                   # Tests del backend
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── layout/          # Layouts (MainLayout, Sidebar, etc.)
│   │   │   └── shared/          # Componentes compartidos
│   │   ├── pages/               # Paginas de la aplicacion
│   │   │   ├── auth/            # Login, registro
│   │   │   ├── clientes/        # Gestion de clientes
│   │   │   ├── proyectos/       # Gestion de proyectos
│   │   │   ├── empleados/       # Gestion de empleados
│   │   │   ├── materiales/      # Inventario y compras
│   │   │   ├── maquinaria/      # Control de equipo
│   │   │   ├── finanzas/        # Modulo financiero
│   │   │   └── reportes/        # Reportes y analisis
│   │   ├── services/            # Servicios API (React Query)
│   │   ├── stores/              # Estado global (Zustand)
│   │   ├── types/               # Tipos TypeScript
│   │   ├── lib/                 # Utilidades (axios, etc.)
│   │   ├── App.tsx              # Componente principal
│   │   └── main.tsx             # Punto de entrada
│   ├── public/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── nginx/                       # Configuracion Nginx
│   ├── nginx.conf
│   └── ssl/                     # Certificados SSL (produccion)
│
├── docker-compose.yml           # Desarrollo
├── docker-compose.prod.yml      # Produccion
├── .env.example
├── .env.prod.example
└── README.md
```

## Requisitos Previos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 20 (solo para desarrollo local sin Docker)
- **Python** >= 3.11 (solo para desarrollo local sin Docker)
- **PostgreSQL** >= 15 (solo para desarrollo local sin Docker)

## Instalacion y Configuracion

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd "The Mount housing Construccion"
```

### 2. Configurar variables de entorno

#### Para desarrollo:

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# Base de datos
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=constructora_dev

# Seguridad
SECRET_KEY=tu-secret-key-muy-seguro-de-32-caracteres-minimo
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Servicios externos (opcional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

#### Para produccion:

```bash
cp .env.prod.example .env.prod
```

Asegurate de cambiar **TODOS** los valores sensibles en `.env.prod`.

### 3. Levantar servicios con Docker Compose

#### Modo desarrollo:

```bash
docker-compose up -d
```

Esto levantara:
- PostgreSQL en puerto 5432
- Redis en puerto 6379
- Backend (FastAPI) en http://localhost:8000
- Frontend (Vite) en http://localhost:3000
- Celery Worker y Beat

#### Modo produccion:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Esto levantara todos los servicios optimizados para produccion con Nginx como proxy reverso en el puerto 80/443.

### 4. Ejecutar migraciones de base de datos

```bash
# Dentro del contenedor backend
docker exec -it constructora_backend alembic upgrade head
```

O si estas en desarrollo local sin Docker:

```bash
cd backend
alembic upgrade head
```

### 5. Crear usuario administrador inicial

```bash
docker exec -it constructora_backend python -m app.scripts.create_admin
```

Esto creara un usuario con:
- **Email**: admin@constructora.com
- **Password**: Admin123!
- **Rol**: SUPER_ADMIN

**IMPORTANTE**: Cambia esta contrasena inmediatamente despues del primer inicio de sesion.

## Uso de la Aplicacion

### Acceso

- **Frontend**: http://localhost:3000 (desarrollo) o http://tu-dominio.com (produccion)
- **API Docs**: http://localhost:8000/docs (desarrollo)
- **ReDoc**: http://localhost:8000/redoc

### Credenciales iniciales

```
Email: admin@constructora.com
Password: Admin123!
```

### Endpoints principales de la API

```
POST   /api/v1/auth/login               # Iniciar sesion
POST   /api/v1/auth/refresh             # Refrescar token
POST   /api/v1/auth/logout              # Cerrar sesion
GET    /api/v1/auth/me                  # Obtener usuario actual

GET    /api/v1/clientes                 # Listar clientes
POST   /api/v1/clientes                 # Crear cliente
GET    /api/v1/clientes/{id}            # Obtener cliente
PUT    /api/v1/clientes/{id}            # Actualizar cliente
DELETE /api/v1/clientes/{id}            # Eliminar cliente

GET    /api/v1/proyectos                # Listar proyectos
POST   /api/v1/proyectos                # Crear proyecto
GET    /api/v1/proyectos/{id}           # Obtener proyecto
GET    /api/v1/proyectos/{id}/fases     # Obtener fases
POST   /api/v1/proyectos/{id}/bitacora  # Agregar entrada bitacora

# ... (similar para empleados, materiales, maquinaria, finanzas, etc.)
```

Ver documentacion completa en `/docs` cuando el backend este corriendo.

## Desarrollo

### Backend

#### Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

#### Correr en modo desarrollo

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Ejecutar tests

```bash
pytest
pytest --cov=app tests/  # Con cobertura
```

#### Crear nueva migracion

```bash
alembic revision --autogenerate -m "Descripcion del cambio"
alembic upgrade head
```

### Frontend

#### Instalar dependencias

```bash
cd frontend
npm install
```

#### Correr en modo desarrollo

```bash
npm run dev
```

#### Build para produccion

```bash
npm run build
```

#### Linting

```bash
npm run lint
```

## Base de Datos

### Esquema principal

El sistema incluye 31 tablas organizadas en los siguientes modulos:

1. **Usuarios y Autenticacion** (1 tabla)
2. **Clientes** (1 tabla)
3. **Proyectos** (5 tablas)
4. **Empleados** (1 tabla)
5. **Subcontratistas** (1 tabla)
6. **Proveedores** (1 tabla)
7. **Cotizaciones** (2 tablas)
8. **Materiales** (6 tablas)
9. **Maquinaria** (2 tablas)
10. **Finanzas** (6 tablas)
11. **Alertas** (1 tabla)

### Relaciones clave

- Cliente → Proyectos (1:N)
- Proyecto → Fases (1:N)
- Proyecto → Bitacora (1:N)
- Proyecto → Empleados (N:M)
- Material → Movimientos (1:N)
- SolicitudCompra → OrdenCompra (1:1)
- CuentaPorCobrar → Pagos (1:N)

## Despliegue en Produccion

### Con Docker Compose (Recomendado)

1. Configura tu servidor con Docker y Docker Compose
2. Copia el proyecto al servidor
3. Configura `.env.prod` con valores de produccion
4. Ejecuta:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. Configura SSL (ver seccion SSL abajo)

### Configuracion SSL con Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Auto-renovacion (ya configurada por defecto)
sudo certbot renew --dry-run
```

Descomentar la seccion HTTPS en `nginx/nginx.conf`.

## Seguridad

### Mejores practicas implementadas

- Contrasenas hasheadas con bcrypt
- JWT con cookies httpOnly (proteccion contra XSS)
- CORS configurado correctamente
- Rate limiting en Nginx
- Headers de seguridad (CSP, X-Frame-Options, etc.)
- SQL injection prevenido con SQLAlchemy ORM
- Validacion de entrada con Pydantic
- Soft-delete en lugar de eliminacion fisica

### Recomendaciones adicionales

- Cambiar SECRET_KEY en produccion
- Usar HTTPS en produccion (obligatorio)
- Configurar firewall en el servidor
- Actualizar dependencias regularmente
- Realizar backups de base de datos
- Monitorear logs y alertas

## Monitoreo y Logs

### Ver logs en Docker

```bash
# Todos los servicios
docker-compose logs -f

# Servicio especifico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Logs en archivos

Los logs se almacenan en:
- Backend: `/var/log/gunicorn/`
- Nginx: `/var/log/nginx/`

## Mantenimiento

### Backup de base de datos

```bash
# Backup
docker exec constructora_db_prod pg_dump -U postgres constructora_prod > backup_$(date +%Y%m%d).sql

# Restaurar
docker exec -i constructora_db_prod psql -U postgres constructora_prod < backup_20240205.sql
```

### Actualizar aplicacion

```bash
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
docker exec -it constructora_backend alembic upgrade head
```

## Troubleshooting

### Backend no conecta a la base de datos

- Verificar que PostgreSQL este corriendo: `docker ps`
- Verificar variables de entorno en `.env`
- Verificar logs: `docker-compose logs backend`

### Frontend no puede hacer requests al backend

- Verificar CORS en `backend/app/core/config.py`
- Verificar `VITE_API_URL` en el frontend
- Verificar que backend este corriendo

### Error de migracion Alembic

```bash
# Ver estado actual
docker exec -it constructora_backend alembic current

# Volver a version anterior
docker exec -it constructora_backend alembic downgrade -1

# Aplicar migraciones
docker exec -it constructora_backend alembic upgrade head
```

## Licencia

Este proyecto esta bajo la licencia MIT.

---

**Constructora Pro** - Sistema de gestion integral para empresas constructoras
