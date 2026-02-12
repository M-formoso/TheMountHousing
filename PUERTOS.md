# Configuración de Puertos - Constructora Pro

Para evitar conflictos con el sistema del Club Hípico, este proyecto usa los siguientes puertos:

## Club Hípico (Ya en uso)
- Frontend: `5173`
- Backend: `8000`
- PostgreSQL: `5432`
- Redis: `6379`

## Constructora Pro (Nuevos puertos)
- **Frontend Dev (npm run dev)**: `5176` → http://localhost:5176
- **Frontend Docker**: `5174` → http://localhost:5174
- **Backend**: `8001` → http://localhost:8001
- **PostgreSQL**: `5433`
- **Redis**: `6380`

## Archivos Modificados

### Backend
- `docker-compose.yml` - Puertos actualizados
- `backend/.env` - DATABASE_URL y REDIS_URL con nuevos puertos

### Frontend
- `docker-compose.yml` - Puerto 5174
- `frontend/.env` - VITE_API_URL apuntando a puerto 8001
- `frontend/vite.config.ts` - Dev server en puerto 5174

## Comandos para Levantar

```bash
# Backend (desde raíz del proyecto)
docker-compose up -d

# Frontend (desde carpeta frontend)
npm run dev
```

## Verificación
- **Frontend**: http://localhost:5176 (dev server)
- **Backend API Docs**: http://localhost:8001/docs
- **Backend Health**: http://localhost:8001/health
- **Backend Admin**: admin@constructora.com / Admin123!

## Estado de Servicios

Puedes verificar el estado con:
```bash
docker-compose ps
```

Para ver logs:
```bash
docker-compose logs -f backend
docker-compose logs -f db
```
