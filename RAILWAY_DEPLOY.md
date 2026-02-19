# Guía de Deploy en Railway - Constructora Pro

## Estructura de Deploy

El proyecto se despliega como **2 servicios separados** en Railway:

1. **Backend** (FastAPI + PostgreSQL + Redis)
2. **Frontend** (React + Nginx)

---

## Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) y crea una cuenta o inicia sesión
2. Click en "New Project"
3. Selecciona "Empty Project"

---

## Paso 2: Agregar Base de Datos PostgreSQL

1. En tu proyecto, click en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente la variable `DATABASE_URL`

---

## Paso 3: Agregar Redis (Opcional - para Celery)

Si necesitas las tareas programadas (Celery):

1. Click en "+ New"
2. Selecciona "Database" → "Add Redis"
3. Railway creará automáticamente la variable `REDIS_URL`

---

## Paso 4: Deploy del Backend

1. Click en "+ New" → "GitHub Repo"
2. Selecciona tu repositorio
3. En la configuración del servicio:
   - **Root Directory**: `backend`
   - Railway detectará el `railway.json` automáticamente

### Variables de Entorno Requeridas (Backend)

Configura estas variables en la pestaña "Variables" del servicio backend:

```env
# Requeridas
SECRET_KEY=<genera-una-clave-secreta-de-32-caracteres-minimo>
DATABASE_URL=${{Postgres.DATABASE_URL}}
DEBUG=false

# CORS - URL de tu frontend en Railway
FRONTEND_URL=https://tu-frontend.up.railway.app
CORS_ORIGINS=https://tu-frontend.up.railway.app

# Opcional - si usas Redis para Celery
REDIS_URL=${{Redis.REDIS_URL}}

# Opcional - Cloudinary para subir archivos
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Opcional - Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password

# Opcional - Sentry para monitoreo de errores
SENTRY_DSN=https://...@sentry.io/...
```

> **Nota**: `${{Postgres.DATABASE_URL}}` es la sintaxis de Railway para referenciar variables de otros servicios.

---

## Paso 5: Deploy del Frontend

1. Click en "+ New" → "GitHub Repo"
2. Selecciona el mismo repositorio
3. En la configuración del servicio:
   - **Root Directory**: `frontend`
   - Railway detectará el `railway.json` automáticamente

### Variables de Entorno Requeridas (Frontend)

Configura estas variables en la pestaña "Variables" del servicio frontend:

```env
# URL del backend - IMPORTANTE: se usa en build time
VITE_API_URL=https://tu-backend.up.railway.app
```

> **Importante**: `VITE_API_URL` se inyecta durante el build. Si la cambias, necesitas hacer redeploy.

---

## Paso 6: Configurar Dominios

### Backend
1. Ve a Settings → Networking
2. Genera un dominio público o agrega tu dominio personalizado

### Frontend
1. Ve a Settings → Networking
2. Genera un dominio público o agrega tu dominio personalizado

---

## Paso 7: Configurar CORS (Importante)

Una vez que tengas los dominios, actualiza la variable `FRONTEND_URL` del backend:

```env
FRONTEND_URL=https://tu-frontend.up.railway.app
```

Si tienes dominio personalizado:
```env
CORS_ORIGINS=https://tu-frontend.up.railway.app,https://tudominio.com
FRONTEND_URL=https://tudominio.com
```

---

## Verificación del Deploy

### Backend
- Accede a `https://tu-backend.up.railway.app/health` - debe retornar `{"status": "ok"}`
- Accede a `https://tu-backend.up.railway.app/docs` para ver la documentación de la API

### Frontend
- Accede a `https://tu-frontend.up.railway.app` - debe cargar la aplicación

---

## Comandos Útiles

### Ver logs en Railway
- Ve a tu servicio → "Deployments" → Click en el deployment → "View Logs"

### Ejecutar migraciones manualmente
Railway ejecuta las migraciones automáticamente al iniciar (configurado en `railway.json`), pero si necesitas ejecutarlas manualmente:

1. Ve al servicio backend
2. Click en "..." → "Execute Command"
3. Ejecuta: `alembic upgrade head`

---

## Troubleshooting

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté correctamente referenciada: `${{Postgres.DATABASE_URL}}`
- Railway cambia el formato de la URL automáticamente

### Error de CORS
- Asegúrate de que `FRONTEND_URL` coincida exactamente con la URL de tu frontend (incluyendo `https://`)
- No incluyas `/` al final de las URLs

### El frontend no conecta con el backend
- Verifica que `VITE_API_URL` apunte al dominio correcto del backend
- Haz redeploy del frontend después de cambiar `VITE_API_URL`

### Build del frontend falla
- Verifica que no haya errores de TypeScript: `npm run build` localmente
- Revisa los logs de build en Railway

---

## Costos Estimados

Railway tiene un plan gratuito con:
- 500 horas de ejecución/mes
- 100 GB de bandwidth
- PostgreSQL gratuito (con límites)

Para producción, considera el plan Pro ($20/mes) que incluye:
- Ejecución ilimitada
- Más recursos
- Mejor soporte

---

## Arquitectura Final

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Project                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │   Frontend   │   │   Backend    │   │  PostgreSQL  │ │
│  │   (React)    │──▶│  (FastAPI)   │──▶│              │ │
│  │   + Nginx    │   │  + Alembic   │   │              │ │
│  └──────────────┘   └──────────────┘   └──────────────┘ │
│                            │                             │
│                            ▼                             │
│                     ┌──────────────┐                    │
│                     │    Redis     │                    │
│                     │  (Opcional)  │                    │
│                     └──────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```
