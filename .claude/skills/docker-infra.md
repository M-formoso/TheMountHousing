# Skill: Docker e Infraestructura

## docker-compose.yml (Desarrollo)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: constructora_db
    environment:
      POSTGRES_DB: constructora_dev
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: constructora_redis
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: constructora_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/constructora_dev
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY:-dev-secret-key-change-in-production}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: constructora_celery_worker
    command: celery -A app.core.celery_app worker -l info --concurrency=4
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/constructora_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: constructora_celery_beat
    command: celery -A app.core.celery_app beat -l info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/constructora_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: constructora_frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

volumes:
  pgdata:
```

## docker-compose.prod.yml (Producción)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: constructora_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    restart: always
    networks:
      - internal

  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - internal

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/constructora_prod
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - SENTRY_DSN=${SENTRY_DSN}
    restart: always
    networks:
      - internal
      - external
    depends_on:
      - db
      - redis

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    command: celery -A app.core.celery_app worker -l info --concurrency=8
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/constructora_prod
      - REDIS_URL=redis://redis:6379
    restart: always
    networks:
      - internal
    depends_on:
      - db
      - redis

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    command: celery -A app.core.celery_app beat -l info
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/constructora_prod
      - REDIS_URL=redis://redis:6379
    restart: always
    networks:
      - internal
    depends_on:
      - db
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${API_URL}
    restart: always
    networks:
      - internal
      - external
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    restart: always
    networks:
      - external
    depends_on:
      - backend
      - frontend

volumes:
  pgdata_prod:

networks:
  internal:
  external:
```

## Dockerfile Backend

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim AS base

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Desarrollo (por defecto)
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Producción
FROM base AS production
RUN pip install --no-cache-dir gunicorn
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

## Dockerfile Frontend

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

# Producción (multi-stage)
FROM dev AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## nginx.conf (Producción)

```nginx
server {
    listen 80;
    listen 443 ssl;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cookie_httponly $upstream_http_set_cookie;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Comandos Útiles de Desarrollo

```bash
# Levantar todo
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# Ejecutar migraciones
docker-compose exec backend alembic upgrade head

# Crear nueva migración
docker-compose exec backend alembic revision --autogenerate -m "descripcion"

# Ejecutar tests
docker-compose exec backend pytest

# Entrar al contenedor backend
docker-compose exec backend bash

# Reiniciar solo backend
docker-compose restart backend

# Producción
docker-compose -f docker-compose.prod.yml up -d
```
