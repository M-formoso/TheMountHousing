# Sistema de Gestión para Empresa de Construcción

## 📋 Información del Proyecto

**Nombre:** Sistema de Gestión Constructora Pro  
**Versión:** 1.0.0  
**Usuarios estimados:** ~150 (empleados + clientes + subcontratistas)  
**Tipo:** Sistema de gestión integral para empresas constructoras  
**Entorno:** Web responsive (desktop + mobile)

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework:** FastAPI 0.104+
- **Lenguaje:** Python 3.11+
- **ORM:** SQLAlchemy 2.0
- **Migraciones:** Alembic
- **Validación:** Pydantic v2
- **Autenticación:** python-jose (JWT) + passlib
- **Base de Datos:** PostgreSQL 15+
- **Workers:** Celery + Redis
- **Storage:** Cloudinary (imágenes de proyectos, planos, documentos)
- **Testing:** Pytest + pytest-asyncio

### Frontend
- **Framework:** React 18 + Vite
- **Lenguaje:** TypeScript 5+
- **Styling:** Tailwind CSS
- **Componentes UI:** shadcn/ui + lucide-react
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Formularios:** React Hook Form + Zod
- **Tablas:** TanStack Table
- **Router:** React Router v6
- **HTTP Client:** Axios
- **Colores principales:** Beige y Gris para botones y elementos UI

### Infraestructura
- **Containerización:** Docker + Docker Compose
- **Proxy Reverso:** Nginx (producción)
- **Deploy:** VPS (Railway/DigitalOcean)
- **Monitoreo:** Sentry
- **CI/CD:** GitHub Actions (opcional)

### Desarrollo
- **Linting:** Ruff (Python) + ESLint (TypeScript)
- **Formatting:** Black + Prettier
- **Pre-commit:** husky + lint-staged
- **Version Control:** Git + GitHub

---

## 📁 Estructura del Proyecto (Monorepo)

```
constructora-pro/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # Header, Sidebar, Footer
│   │   │   ├── proyectos/       # Componentes módulo proyectos
│   │   │   ├── clientes/        # Componentes módulo clientes
│   │   │   ├── cotizaciones/    # Componentes módulo cotizaciones
│   │   │   ├── empleados/       # Componentes módulo empleados
│   │   │   ├── subcontratistas/ # Componentes módulo subcontratistas
│   │   │   ├── materiales/      # Componentes módulo materiales
│   │   │   ├── maquinaria/      # Componentes módulo maquinaria
│   │   │   ├── finanzas/        # Componentes módulo finanzas
│   │   │   ├── alertas/         # Componentes de notificaciones
│   │   │   └── shared/          # Componentes compartidos
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Dashboards por rol
│   │   │   ├── proyectos/       # CRUD proyectos
│   │   │   ├── clientes/        # CRUD clientes
│   │   │   ├── cotizaciones/    # CRUD cotizaciones
│   │   │   ├── empleados/       # CRUD empleados
│   │   │   ├── subcontratistas/ # CRUD subcontratistas
│   │   │   ├── materiales/      # Gestión de materiales
│   │   │   ├── maquinaria/      # Gestión de maquinaria
│   │   │   ├── finanzas/        # Gestión financiera
│   │   │   ├── reportes/        # Reportes y analytics
│   │   │   └── configuracion/   # Settings del sistema
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API calls
│   │   ├── stores/              # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utilidades
│   │   ├── constants/           # Constantes
│   │   └── lib/                 # Config shadcn/ui
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── proyectos.py
│   │   │   │   │   ├── clientes.py
│   │   │   │   │   ├── cotizaciones.py
│   │   │   │   │   ├── empleados.py
│   │   │   │   │   ├── subcontratistas.py
│   │   │   │   │   ├── materiales.py
│   │   │   │   │   ├── maquinaria.py
│   │   │   │   │   ├── finanzas.py
│   │   │   │   │   ├── alertas.py
│   │   │   │   │   ├── reportes.py
│   │   │   │   │   └── upload.py
│   │   │   │   └── api.py       # Router principal
│   │   ├── core/
│   │   │   ├── config.py        # Settings con Pydantic
│   │   │   ├── security.py      # JWT, hashing
│   │   │   ├── deps.py          # Dependencies FastAPI
│   │   │   └── celery_app.py    # Celery config
│   │   ├── db/
│   │   │   ├── base.py          # Base SQLAlchemy
│   │   │   ├── session.py       # DB session
│   │   │   └── init_db.py       # Datos iniciales
│   │   ├── models/
│   │   │   ├── base.py          # Base model
│   │   │   ├── usuario.py
│   │   │   ├── proyecto.py
│   │   │   ├── cliente.py
│   │   │   ├── cotizacion.py
│   │   │   ├── empleado.py
│   │   │   ├── subcontratista.py
│   │   │   ├── material.py
│   │   │   ├── maquinaria.py
│   │   │   ├── finanzas.py
│   │   │   ├── alerta.py
│   │   │   └── asociaciones.py  # Tablas intermedias
│   │   ├── schemas/
│   │   │   ├── usuario.py       # Pydantic schemas
│   │   │   ├── proyecto.py
│   │   │   ├── cliente.py
│   │   │   ├── cotizacion.py
│   │   │   ├── empleado.py
│   │   │   ├── subcontratista.py
│   │   │   ├── material.py
│   │   │   ├── maquinaria.py
│   │   │   ├── finanzas.py
│   │   │   ├── alerta.py
│   │   │   └── common.py        # Schemas compartidos
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── proyecto_service.py
│   │   │   ├── cliente_service.py
│   │   │   ├── cotizacion_service.py
│   │   │   ├── empleado_service.py
│   │   │   ├── subcontratista_service.py
│   │   │   ├── material_service.py
│   │   │   ├── maquinaria_service.py
│   │   │   ├── finanzas_service.py
│   │   │   ├── alerta_service.py
│   │   │   ├── reporte_service.py
│   │   │   └── upload_service.py
│   │   ├── tasks/               # Celery tasks
│   │   │   ├── alertas.py       # Envío de alertas
│   │   │   ├── emails.py        # Envío de emails
│   │   │   └── reportes.py      # Generación reportes
│   │   ├── utils/
│   │   │   ├── email.py
│   │   │   ├── validators.py
│   │   │   ├── pdf_generator.py # Generador de PDFs (cotizaciones, contratos)
│   │   │   └── helpers.py
│   │   └── main.py              # App FastAPI
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/
│   │   ├── api/
│   │   ├── services/
│   │   └── conftest.py
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   └── pyproject.toml
│
├── docs/
│   ├── agent.md                 # Instrucciones para Claude Code
│   ├── skills/
│   │   ├── fastapi-crud.md      # Skill: Generar CRUDs
│   │   ├── react-forms.md       # Skill: Formularios React
│   │   ├── database-design.md   # Skill: Diseño BD
│   │   ├── auth-flow.md         # Skill: Autenticación
│   │   └── docker-setup.md      # Skill: Docker config
│   ├── api-documentation.md     # Docs de la API
│   ├── database-schema.md       # Esquema de BD
│   └── deployment.md            # Guía de deployment
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🗂️ Módulos del Sistema

### 1. Autenticación y Usuarios

**Descripción:** Sistema de login, roles y permisos

**Roles:**
- **Super Admin:** Acceso total al sistema
- **Administrador:** Gestión completa de la constructora
- **Gerente de Proyecto:** Acceso a proyectos asignados
- **Supervisor de Obra:** Seguimiento de obras en campo
- **Contador:** Acceso a módulo financiero
- **Compras:** Gestión de materiales y proveedores
- **Cliente:** Panel personal con info de su proyecto

**Funcionalidades:**
- ✅ Registro de usuarios con validación de email
- ✅ Login con JWT (access token + refresh token)
- ✅ Recuperación de contraseña por email
- ✅ Cambio de contraseña
- ✅ Gestión de permisos por rol
- ✅ Logs de actividad de usuarios
- ✅ Sesiones activas y cierre de sesión múltiple
- ✅ Autenticación de dos factores (2FA) opcional

**Endpoints:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
PUT    /api/v1/auth/change-password
POST   /api/v1/auth/enable-2fa
POST   /api/v1/auth/verify-2fa
```

---

### 2. Gestión de Proyectos

**Descripción:** CRUD completo de proyectos de construcción con seguimiento de avance

**Funcionalidades:**
- ✅ Registro de proyectos (nombre, descripción, tipo de obra)
- ✅ Tipos de proyecto (residencial, comercial, industrial, remodelación, obra civil)
- ✅ Asignación de cliente
- ✅ Asignación de gerente de proyecto y equipo
- ✅ Ubicación del proyecto (dirección, coordenadas GPS)
- ✅ Fechas de inicio, fin estimado y fin real
- ✅ Presupuesto total y gastado
- ✅ Estado del proyecto (cotización, adjudicado, en construcción, pausado, finalizado, cancelado)
- ✅ Fases/etapas del proyecto con % de avance
- ✅ Galería de fotos por fecha (antes, durante, después)
- ✅ Documentos asociados (planos, permisos, contratos, licencias)
- ✅ Cronograma/Gantt chart del proyecto
- ✅ Bitácora de obra digital
- ✅ Control de calidad (checklist, inspecciones)
- ✅ Seguimiento de certificaciones y permisos
- ✅ Dashboard con KPIs del proyecto
- ✅ Alertas de retrasos y sobrecostos
- ✅ Exportar reportes a PDF/Excel

**Campos del Modelo:**
```python
class Proyecto:
    id: UUID
    codigo: str  # Código único del proyecto (ej: OBRA-2024-001)
    nombre: str
    descripcion: str
    tipo: TipoProyecto  # Enum
    estado: EstadoProyecto  # Enum
    cliente_id: UUID
    gerente_proyecto_id: UUID
    direccion: str
    ciudad: str
    estado_provincia: str
    codigo_postal: str
    latitud: float
    longitud: float
    fecha_inicio: date
    fecha_fin_estimada: date
    fecha_fin_real: date (nullable)
    presupuesto_total: Decimal
    costo_real: Decimal
    margen_ganancia_esperado: Decimal  # %
    area_construccion_m2: float
    progreso_general: int  # 0-100%
    notas: str
    activo: bool
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    cliente: Cliente
    gerente: Empleado
    equipo: List[Empleado]
    fases: List[FaseProyecto]
    materiales: List[MaterialProyecto]
    maquinaria: List[MaquinariaProyecto]
    subcontratistas: List[SubcontratistaProyecto]
    documentos: List[DocumentoProyecto]
    fotos: List[FotoProyecto]
    bitacora: List[EntradaBitacora]
    gastos: List[Gasto]
    pagos_cliente: List[PagoCliente]
```

**Endpoints:**
```
GET    /api/v1/proyectos              # Listar con filtros
POST   /api/v1/proyectos              # Crear
GET    /api/v1/proyectos/{id}         # Ver detalle
PUT    /api/v1/proyectos/{id}         # Actualizar
DELETE /api/v1/proyectos/{id}         # Eliminar (soft delete)
GET    /api/v1/proyectos/{id}/dashboard
POST   /api/v1/proyectos/{id}/fases
PUT    /api/v1/proyectos/{id}/fases/{fase_id}
POST   /api/v1/proyectos/{id}/fotos
POST   /api/v1/proyectos/{id}/documentos
GET    /api/v1/proyectos/{id}/bitacora
POST   /api/v1/proyectos/{id}/bitacora
GET    /api/v1/proyectos/{id}/cronograma
PUT    /api/v1/proyectos/{id}/cronograma
GET    /api/v1/proyectos/{id}/reporte-pdf
```

---

### 3. Gestión de Clientes

**Descripción:** CRUD de clientes de la constructora

**Funcionalidades:**
- ✅ Registro de clientes (persona física o moral)
- ✅ Datos personales/empresariales completos
- ✅ Tipos de cliente (particular, empresa, gobierno)
- ✅ Historial de proyectos del cliente
- ✅ Documentos del cliente (identificación, RFC, comprobantes)
- ✅ Estado de cuenta (pagos, adeudos)
- ✅ Contratos digitales
- ✅ Contactos adicionales del cliente
- ✅ Notas y observaciones
- ✅ Calificación del cliente (1-5 estrellas)
- ✅ Búsqueda y filtros
- ✅ Envío de emails y notificaciones

**Campos del Modelo:**
```python
class Cliente:
    id: UUID
    tipo: TipoCliente  # persona_fisica, persona_moral, gobierno
    nombre: str  # Nombre completo o razón social
    rfc: str
    email: str
    telefono: str
    telefono_alternativo: str
    direccion: str
    ciudad: str
    estado: str
    codigo_postal: str
    
    # Campos para persona física
    fecha_nacimiento: date (nullable)
    
    # Campos para persona moral
    representante_legal: str (nullable)
    giro_empresarial: str (nullable)
    
    calificacion: int  # 1-5
    estado_cuenta: EstadoCuenta  # al_dia, debe, credito
    limite_credito: Decimal
    descuento_especial: Decimal  # %
    forma_pago_preferida: FormaPago
    
    notas: str
    activo: bool
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    proyectos: List[Proyecto]
    contactos_adicionales: List[ContactoCliente]
    documentos: List[DocumentoCliente]
    pagos: List[PagoCliente]
```

**Endpoints:**
```
GET    /api/v1/clientes
POST   /api/v1/clientes
GET    /api/v1/clientes/{id}
PUT    /api/v1/clientes/{id}
DELETE /api/v1/clientes/{id}
GET    /api/v1/clientes/{id}/proyectos
GET    /api/v1/clientes/{id}/estado-cuenta
POST   /api/v1/clientes/{id}/contactos
POST   /api/v1/clientes/{id}/documentos
```

---

### 4. Gestión de Cotizaciones

**Descripción:** Sistema completo de cotizaciones y presupuestos

**Funcionalidades:**
- ✅ Creación de cotizaciones detalladas
- ✅ Partidas y conceptos de obra
- ✅ Cálculo automático de materiales
- ✅ Cálculo de mano de obra
- ✅ Inclusión de maquinaria y equipo
- ✅ Subcontrataciones
- ✅ Márgenes de utilidad configurables
- ✅ Impuestos (IVA, retenciones)
- ✅ Versiones de cotización
- ✅ Comparativa de cotizaciones
- ✅ Generación de PDF profesional
- ✅ Envío por email al cliente
- ✅ Firma digital del cliente
- ✅ Conversión a proyecto al ser aceptada
- ✅ Vigencia de cotización
- ✅ Seguimiento de cotizaciones (pendiente, enviada, revisión, aceptada, rechazada, vencida)

**Campos del Modelo:**
```python
class Cotizacion:
    id: UUID
    numero: str  # COT-2024-001
    version: int  # Para revisiones
    fecha_emision: date
    fecha_vigencia: date
    estado: EstadoCotizacion
    
    cliente_id: UUID
    proyecto_nombre: str
    proyecto_descripcion: str
    proyecto_ubicacion: str
    
    # Totales
    subtotal: Decimal
    iva: Decimal
    total: Decimal
    margen_utilidad: Decimal  # %
    
    condiciones_pago: str
    tiempo_ejecucion_dias: int
    garantia: str
    notas: str
    
    elaborada_por_id: UUID  # Empleado
    aprobada_por_id: UUID (nullable)
    fecha_aprobacion: datetime (nullable)
    
    # Firma digital
    firma_cliente_url: str (nullable)
    fecha_firma: datetime (nullable)
    
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    cliente: Cliente
    partidas: List[PartidaCotizacion]
    proyecto: Proyecto (nullable)  # Si fue convertida
    
class PartidaCotizacion:
    id: UUID
    cotizacion_id: UUID
    numero_partida: int
    concepto: str
    descripcion: str
    unidad: str
    cantidad: float
    precio_unitario: Decimal
    importe: Decimal
    incluye_material: bool
    incluye_mano_obra: bool
    incluye_maquinaria: bool
    
    # Desglose opcional
    materiales: List[MaterialPartida]
    mano_obra_horas: float
    costo_mano_obra: Decimal
```

**Endpoints:**
```
GET    /api/v1/cotizaciones
POST   /api/v1/cotizaciones
GET    /api/v1/cotizaciones/{id}
PUT    /api/v1/cotizaciones/{id}
DELETE /api/v1/cotizaciones/{id}
POST   /api/v1/cotizaciones/{id}/duplicar
POST   /api/v1/cotizaciones/{id}/nueva-version
GET    /api/v1/cotizaciones/{id}/pdf
POST   /api/v1/cotizaciones/{id}/enviar-email
PUT    /api/v1/cotizaciones/{id}/firmar
POST   /api/v1/cotizaciones/{id}/convertir-proyecto
GET    /api/v1/cotizaciones/{id}/comparar/{id2}
```

---

### 5. Gestión de Empleados

**Descripción:** CRUD de empleados de la constructora

**Funcionalidades:**
- ✅ Registro de empleados con datos completos
- ✅ Puestos y departamentos
- ✅ Asignación de proyectos
- ✅ Control de asistencia
- ✅ Nómina (opcional, integración futura)
- ✅ Documentos personales
- ✅ Capacitaciones y certificaciones
- ✅ Evaluaciones de desempeño
- ✅ Historial laboral
- ✅ Equipos de seguridad asignados
- ✅ Contactos de emergencia
- ✅ Calendario de vacaciones y permisos

**Campos del Modelo:**
```python
class Empleado:
    id: UUID
    numero_empleado: str
    usuario_id: UUID (nullable)  # Si tiene acceso al sistema
    
    nombre: str
    apellido_paterno: str
    apellido_materno: str
    fecha_nacimiento: date
    rfc: str
    curp: str
    nss: str
    
    email: str
    telefono: str
    telefono_emergencia: str
    contacto_emergencia_nombre: str
    contacto_emergencia_relacion: str
    
    direccion: str
    ciudad: str
    estado: str
    codigo_postal: str
    
    puesto: str
    departamento: Departamento  # Enum
    fecha_ingreso: date
    fecha_baja: date (nullable)
    tipo_contrato: TipoContrato  # planta, obra, honorarios
    salario_diario: Decimal
    
    tipo_sangre: str
    alergias: str
    enfermedades: str
    
    activo: bool
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    proyectos_asignados: List[Proyecto]
    asistencias: List[Asistencia]
    capacitaciones: List[Capacitacion]
    evaluaciones: List[Evaluacion]
    documentos: List[DocumentoEmpleado]
```

**Endpoints:**
```
GET    /api/v1/empleados
POST   /api/v1/empleados
GET    /api/v1/empleados/{id}
PUT    /api/v1/empleados/{id}
DELETE /api/v1/empleados/{id}
GET    /api/v1/empleados/{id}/proyectos
POST   /api/v1/empleados/{id}/asistencia
GET    /api/v1/empleados/{id}/asistencias
POST   /api/v1/empleados/{id}/capacitaciones
GET    /api/v1/empleados/reporte-asistencia
```

---

### 6. Gestión de Subcontratistas

**Descripción:** CRUD de subcontratistas y proveedores de servicios

**Funcionalidades:**
- ✅ Registro de subcontratistas
- ✅ Especialidades (plomería, electricidad, acabados, etc.)
- ✅ Calificación de desempeño
- ✅ Historial de trabajos realizados
- ✅ Documentos (contratos, seguros, certificaciones)
- ✅ Asignación a proyectos
- ✅ Control de pagos y adeudos
- ✅ Evaluación de trabajos
- ✅ Lista negra/lista blanca
- ✅ Comparativa de costos

**Campos del Modelo:**
```python
class Subcontratista:
    id: UUID
    razon_social: str
    nombre_comercial: str
    rfc: str
    
    contacto_principal: str
    email: str
    telefono: str
    telefono_alternativo: str
    
    especialidad: EspecialidadSubcontratista
    subespecialidades: List[str]
    
    direccion: str
    ciudad: str
    estado: str
    
    banco: str
    cuenta_bancaria: str
    clabe: str
    
    calificacion: int  # 1-5
    precio_rango: RangoPrecio  # economico, medio, premium
    
    certificaciones: List[str]
    seguro_responsabilidad_civil: bool
    seguro_vigencia: date (nullable)
    
    notas: str
    en_lista_negra: bool
    razon_lista_negra: str (nullable)
    activo: bool
    
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    trabajos_realizados: List[TrabajoSubcontratista]
    evaluaciones: List[EvaluacionSubcontratista]
    documentos: List[DocumentoSubcontratista]
    pagos: List[PagoSubcontratista]
```

**Endpoints:**
```
GET    /api/v1/subcontratistas
POST   /api/v1/subcontratistas
GET    /api/v1/subcontratistas/{id}
PUT    /api/v1/subcontratistas/{id}
DELETE /api/v1/subcontratistas/{id}
GET    /api/v1/subcontratistas/{id}/trabajos
POST   /api/v1/subcontratistas/{id}/evaluacion
GET    /api/v1/subcontratistas/comparativa
```

---

### 7. Gestión de Materiales e Inventario

**Descripción:** Control de materiales de construcción y almacén

**Funcionalidades:**
- ✅ Catálogo de materiales
- ✅ Control de inventario en almacén
- ✅ Categorías de materiales (cemento, arena, varilla, block, etc.)
- ✅ Proveedores por material
- ✅ Precios históricos
- ✅ Solicitudes de compra
- ✅ Órdenes de compra
- ✅ Recepción de materiales
- ✅ Asignación de materiales a proyectos
- ✅ Consumo de materiales por proyecto
- ✅ Alertas de stock mínimo
- ✅ Reportes de consumo y costos
- ✅ Comparativa de precios entre proveedores
- ✅ Mermas y desperdicios

**Campos del Modelo:**
```python
class Material:
    id: UUID
    codigo: str  # SKU
    nombre: str
    descripcion: str
    categoria: CategoriaMaterial
    subcategoria: str
    
    unidad_medida: UnidadMedida  # m2, m3, kg, ton, pieza, etc.
    precio_unitario_actual: Decimal
    
    # Inventario
    stock_actual: float
    stock_minimo: float
    stock_maximo: float
    ubicacion_almacen: str
    
    proveedor_principal_id: UUID
    proveedores_alternos: List[UUID]
    
    activo: bool
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    proveedor_principal: Proveedor
    movimientos: List[MovimientoInventario]
    precios_historicos: List[PrecioMaterial]
    
class MovimientoInventario:
    id: UUID
    material_id: UUID
    tipo: TipoMovimiento  # entrada, salida, ajuste, merma
    cantidad: float
    proyecto_id: UUID (nullable)
    orden_compra_id: UUID (nullable)
    usuario_id: UUID
    fecha: datetime
    costo_unitario: Decimal
    costo_total: Decimal
    notas: str
    
class SolicitudCompra:
    id: UUID
    numero: str
    proyecto_id: UUID
    solicitante_id: UUID
    fecha_solicitud: date
    fecha_requerida: date
    estado: EstadoSolicitud
    prioridad: Prioridad
    
    items: List[ItemSolicitud]
    total_estimado: Decimal
    
class OrdenCompra:
    id: UUID
    numero: str
    solicitud_compra_id: UUID (nullable)
    proveedor_id: UUID
    fecha_orden: date
    fecha_entrega_esperada: date
    estado: EstadoOrdenCompra
    
    subtotal: Decimal
    iva: Decimal
    total: Decimal
    
    condiciones_pago: str
    notas: str
    
    items: List[ItemOrdenCompra]
    recepciones: List[RecepcionMaterial]
```

**Endpoints:**
```
GET    /api/v1/materiales
POST   /api/v1/materiales
GET    /api/v1/materiales/{id}
PUT    /api/v1/materiales/{id}
DELETE /api/v1/materiales/{id}
GET    /api/v1/materiales/inventario
POST   /api/v1/materiales/{id}/movimiento
GET    /api/v1/materiales/{id}/precios-historicos
GET    /api/v1/materiales/stock-bajo

POST   /api/v1/solicitudes-compra
GET    /api/v1/solicitudes-compra
PUT    /api/v1/solicitudes-compra/{id}/aprobar
PUT    /api/v1/solicitudes-compra/{id}/rechazar

POST   /api/v1/ordenes-compra
GET    /api/v1/ordenes-compra
GET    /api/v1/ordenes-compra/{id}/pdf
POST   /api/v1/ordenes-compra/{id}/recepcion
```

---

### 8. Gestión de Maquinaria y Equipo

**Descripción:** Control de maquinaria, vehículos y equipo de construcción

**Funcionalidades:**
- ✅ Catálogo de maquinaria y equipo
- ✅ Tipos (propia, rentada, de subcontratista)
- ✅ Asignación a proyectos
- ✅ Calendario de uso
- ✅ Mantenimientos preventivos y correctivos
- ✅ Bitácora de uso (horómetro, odómetro)
- ✅ Costos de operación
- ✅ Seguros y permisos
- ✅ Operadores asignados
- ✅ Alertas de mantenimiento
- ✅ Historial de reparaciones
- ✅ Depreciación

**Campos del Modelo:**
```python
class Maquinaria:
    id: UUID
    codigo: str
    nombre: str
    tipo: TipoMaquinaria  # excavadora, retroexcavadora, camion, revolvedora, etc.
    marca: str
    modelo: str
    año: int
    
    tipo_propiedad: TipoPropiedad  # propia, rentada, subcontratista
    proveedor_renta_id: UUID (nullable)
    
    numero_serie: str
    numero_economico: str
    placas: str (nullable)
    
    estado: EstadoMaquinaria  # operativa, mantenimiento, descompuesta, baja
    ubicacion_actual: str
    proyecto_asignado_id: UUID (nullable)
    
    # Costos
    costo_adquisicion: Decimal (nullable)
    costo_renta_dia: Decimal (nullable)
    costo_operacion_hora: Decimal
    
    # Seguros y permisos
    poliza_seguro: str
    vigencia_seguro: date
    verificacion_vigencia: date (nullable)
    
    # Operación
    horometro_actual: int
    odometro_actual: int (nullable)
    capacidad: str
    combustible: TipoCombustible
    
    fecha_ultimo_mantenimiento: date
    proxima_mantenimiento: date
    kilometros_horas_prox_mant: int
    
    activo: bool
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    mantenimientos: List[MantenimientoMaquinaria]
    operadores: List[Empleado]
    asignaciones: List[AsignacionMaquinaria]
    bitacora: List[BitacoraMaquinaria]
```

**Endpoints:**
```
GET    /api/v1/maquinaria
POST   /api/v1/maquinaria
GET    /api/v1/maquinaria/{id}
PUT    /api/v1/maquinaria/{id}
DELETE /api/v1/maquinaria/{id}
POST   /api/v1/maquinaria/{id}/mantenimiento
GET    /api/v1/maquinaria/{id}/historial
POST   /api/v1/maquinaria/{id}/asignar-proyecto
GET    /api/v1/maquinaria/calendario
GET    /api/v1/maquinaria/alertas-mantenimiento
```

---

### 9. Módulo Financiero

**Descripción:** Control financiero completo de la constructora

**Funcionalidades:**
- ✅ Ingresos por proyecto (pagos de clientes)
- ✅ Egresos por categorías
- ✅ Flujo de efectivo
- ✅ Cuentas por cobrar
- ✅ Cuentas por pagar
- ✅ Presupuesto vs Real por proyecto
- ✅ Gastos generales de la empresa
- ✅ Nómina (resumen)
- ✅ Impuestos
- ✅ Reportes financieros (P&L, Balance)
- ✅ Dashboard financiero
- ✅ Alertas de vencimientos
- ✅ Conciliación bancaria
- ✅ Centro de costos por proyecto

**Modelos:**

```python
class Ingreso:
    id: UUID
    tipo: TipoIngreso  # pago_cliente, anticipo, finiquito, otros
    concepto: str
    monto: Decimal
    fecha: date
    
    proyecto_id: UUID (nullable)
    cliente_id: UUID (nullable)
    
    metodo_pago: MetodoPago
    referencia: str
    factura: str (nullable)
    comprobante_url: str (nullable)
    
    notas: str
    registrado_por_id: UUID
    created_at: datetime

class Egreso:
    id: UUID
    categoria: CategoriaEgreso  # materiales, mano_obra, subcontratistas, maquinaria, gastos_generales, etc.
    subcategoria: str
    concepto: str
    monto: Decimal
    fecha: date
    
    proyecto_id: UUID (nullable)
    proveedor_id: UUID (nullable)
    subcontratista_id: UUID (nullable)
    empleado_id: UUID (nullable)
    
    metodo_pago: MetodoPago
    referencia: str
    factura: str (nullable)
    comprobante_url: str (nullable)
    
    autorizado_por_id: UUID
    estado_pago: EstadoPago  # pendiente, pagado, parcial
    
    notas: str
    created_at: datetime

class CuentaPorCobrar:
    id: UUID
    cliente_id: UUID
    proyecto_id: UUID
    concepto: str
    monto_total: Decimal
    monto_pagado: Decimal
    saldo: Decimal
    fecha_emision: date
    fecha_vencimiento: date
    estado: EstadoCuentaCobrar  # pendiente, parcial, pagada, vencida
    
    pagos: List[PagoCuentaCobrar]

class CuentaPorPagar:
    id: UUID
    proveedor_id: UUID (nullable)
    subcontratista_id: UUID (nullable)
    proyecto_id: UUID (nullable)
    concepto: str
    monto_total: Decimal
    monto_pagado: Decimal
    saldo: Decimal
    fecha_emision: date
    fecha_vencimiento: date
    estado: EstadoCuentaPagar
    prioridad: Prioridad
    
    pagos: List[PagoCuentaPagar]
```

**Endpoints:**
```
POST   /api/v1/finanzas/ingresos
GET    /api/v1/finanzas/ingresos
POST   /api/v1/finanzas/egresos
GET    /api/v1/finanzas/egresos

GET    /api/v1/finanzas/cuentas-por-cobrar
GET    /api/v1/finanzas/cuentas-por-pagar
POST   /api/v1/finanzas/cuentas-por-cobrar/{id}/pago
POST   /api/v1/finanzas/cuentas-por-pagar/{id}/pago

GET    /api/v1/finanzas/dashboard
GET    /api/v1/finanzas/flujo-efectivo
GET    /api/v1/finanzas/presupuesto-vs-real/{proyecto_id}
GET    /api/v1/finanzas/reporte-proyecto/{proyecto_id}
GET    /api/v1/finanzas/estado-resultados
GET    /api/v1/finanzas/balance-general
GET    /api/v1/finanzas/proyeccion-flujo
```

---

### 10. Proveedores

**Descripción:** Gestión de proveedores de materiales

**Funcionalidades:**
- ✅ Registro de proveedores
- ✅ Catálogo de productos por proveedor
- ✅ Calificación de proveedores
- ✅ Historial de compras
- ✅ Comparativa de precios
- ✅ Condiciones comerciales
- ✅ Tiempos de entrega
- ✅ Documentos (contratos, fichas técnicas)
- ✅ Evaluación de desempeño
- ✅ Contactos múltiples

**Campos del Modelo:**
```python
class Proveedor:
    id: UUID
    razon_social: str
    nombre_comercial: str
    rfc: str
    
    tipo: TipoProveedor  # materiales, servicios, ambos
    categorias_suministro: List[str]  # cemento, acero, acabados, etc.
    
    contacto_principal: str
    email: str
    telefono: str
    telefono_alternativo: str
    
    direccion: str
    ciudad: str
    estado: str
    codigo_postal: str
    sitio_web: str
    
    banco: str
    cuenta_bancaria: str
    clabe: str
    
    condiciones_pago: str
    dias_credito: int
    descuento_pronto_pago: Decimal
    tiempo_entrega_dias: int
    
    calificacion_calidad: int  # 1-5
    calificacion_precio: int  # 1-5
    calificacion_servicio: int  # 1-5
    calificacion_general: float  # Promedio
    
    volumen_compra_anual: Decimal
    
    activo: bool
    preferido: bool
    notas: str
    
    created_at: datetime
    updated_at: datetime
    
    # Relaciones
    productos: List[ProductoProveedor]
    compras: List[OrdenCompra]
    evaluaciones: List[EvaluacionProveedor]
    contactos_adicionales: List[ContactoProveedor]
```

**Endpoints:**
```
GET    /api/v1/proveedores
POST   /api/v1/proveedores
GET    /api/v1/proveedores/{id}
PUT    /api/v1/proveedores/{id}
DELETE /api/v1/proveedores/{id}
GET    /api/v1/proveedores/{id}/productos
POST   /api/v1/proveedores/{id}/evaluacion
GET    /api/v1/proveedores/comparativa-precios
```

---

### 11. Sistema de Alertas y Notificaciones

**Descripción:** Sistema automatizado de alertas

**Tipos de Alertas:**
- ✅ Proyectos con retraso
- ✅ Sobrecostos en proyectos
- ✅ Stock bajo de materiales
- ✅ Mantenimientos de maquinaria pendientes
- ✅ Vencimientos de seguros y permisos
- ✅ Pagos a proveedores próximos a vencer
- ✅ Cuentas por cobrar vencidas
- ✅ Cotizaciones por vencer
- ✅ Inspecciones de calidad pendientes
- ✅ Certificaciones de empleados por vencer
- ✅ Contratos próximos a finalizar

**Campos del Modelo:**
```python
class Alerta:
    id: UUID
    tipo: TipoAlerta
    prioridad: Prioridad  # baja, media, alta, critica
    titulo: str
    mensaje: str
    
    usuario_id: UUID (nullable)  # Si es para usuario específico
    rol_destinatario: Rol (nullable)  # Si es para todos de un rol
    
    entidad_tipo: str  # proyecto, material, maquinaria, etc.
    entidad_id: UUID
    
    leida: bool
    fecha_lectura: datetime (nullable)
    
    accion_url: str (nullable)
    accion_texto: str (nullable)
    
    created_at: datetime
    expira_en: datetime (nullable)
```

**Endpoints:**
```
GET    /api/v1/alertas
GET    /api/v1/alertas/no-leidas
PUT    /api/v1/alertas/{id}/marcar-leida
PUT    /api/v1/alertas/marcar-todas-leidas
DELETE /api/v1/alertas/{id}
GET    /api/v1/alertas/count
```

**Tareas Celery para Alertas:**
```python
# Ejecutar diariamente
@celery_app.task
def verificar_retrasos_proyectos():
    # Buscar proyectos con fecha estimada pasada y no finalizados
    pass

@celery_app.task
def verificar_stock_materiales():
    # Buscar materiales bajo stock mínimo
    pass

@celery_app.task
def verificar_mantenimientos_maquinaria():
    # Verificar maquinaria próxima a mantenimiento
    pass

@celery_app.task
def verificar_vencimientos():
    # Seguros, permisos, certificaciones próximas a vencer
    pass

@celery_app.task
def verificar_cuentas_cobrar_vencidas():
    # Cuentas por cobrar con fecha vencida
    pass
```

---

### 12. Reportes y Analytics

**Descripción:** Sistema de reportes y análisis de datos

**Reportes Disponibles:**

**Por Proyecto:**
- ✅ Reporte de avance de obra
- ✅ Presupuesto vs Real detallado
- ✅ Consumo de materiales
- ✅ Uso de maquinaria
- ✅ Horas hombre trabajadas
- ✅ Subcontratistas involucrados
- ✅ Fotografías de progreso
- ✅ Bitácora de obra

**Financieros:**
- ✅ Estado de resultados por período
- ✅ Balance general
- ✅ Flujo de efectivo
- ✅ Rentabilidad por proyecto
- ✅ Costos por categoría
- ✅ Análisis de gastos
- ✅ Proyección financiera

**Operativos:**
- ✅ Inventario de materiales
- ✅ Órdenes de compra pendientes
- ✅ Utilización de maquinaria
- ✅ Productividad de empleados
- ✅ Desempeño de subcontratistas
- ✅ Evaluación de proveedores

**Comerciales:**
- ✅ Cotizaciones enviadas vs aceptadas
- ✅ Proyectos por estado
- ✅ Cartera de clientes
- ✅ Proyectos por tipo
- ✅ Ticket promedio por proyecto

**Endpoints:**
```
GET    /api/v1/reportes/proyecto/{id}/avance-obra-pdf
GET    /api/v1/reportes/proyecto/{id}/presupuesto-real-pdf
GET    /api/v1/reportes/financiero/estado-resultados
GET    /api/v1/reportes/financiero/flujo-efectivo
GET    /api/v1/reportes/operativo/inventario
GET    /api/v1/reportes/comercial/cotizaciones
GET    /api/v1/reportes/dashboard/kpis
GET    /api/v1/reportes/custom
```

---

### 13. Dashboard Principal

**Descripción:** Vista principal con KPIs y métricas importantes

**Widgets del Dashboard:**

**Para Administradores:**
- ✅ Total de proyectos activos
- ✅ Proyectos en retraso
- ✅ Proyectos con sobrecosto
- ✅ Ingresos del mes
- ✅ Gastos del mes
- ✅ Utilidad del mes
- ✅ Cuentas por cobrar vencidas
- ✅ Cuentas por pagar próximas
- ✅ Gráfica de ingresos vs gastos (últimos 6 meses)
- ✅ Top 5 proyectos por inversión
- ✅ Alertas pendientes
- ✅ Cotizaciones pendientes de respuesta
- ✅ Materiales con stock bajo
- ✅ Maquinaria en mantenimiento

**Para Gerentes de Proyecto:**
- ✅ Mis proyectos asignados
- ✅ Avance general de proyectos
- ✅ Presupuesto vs real de proyectos
- ✅ Tareas pendientes
- ✅ Próximas entregas
- ✅ Alertas de mis proyectos

**Para Clientes:**
- ✅ Estado de mi proyecto
- ✅ Avance con fotos
- ✅ Próximos pagos
- ✅ Documentos del proyecto
- ✅ Contacto con gerente

**Endpoint:**
```
GET    /api/v1/dashboard/admin
GET    /api/v1/dashboard/gerente
GET    /api/v1/dashboard/cliente
```

---

### 14. Configuración del Sistema

**Descripción:** Configuraciones generales de la aplicación

**Funcionalidades:**
- ✅ Datos de la empresa
- ✅ Logo y colores corporativos
- ✅ Configuración de email (SMTP)
- ✅ Plantillas de documentos (cotizaciones, contratos)
- ✅ Catálogos personalizables
- ✅ Tasas de impuestos
- ✅ Tipos de cambio
- ✅ Márgenes de utilidad por defecto
- ✅ Configuración de alertas
- ✅ Backup automático
- ✅ Roles y permisos personalizados

**Campos del Modelo:**
```python
class ConfiguracionEmpresa:
    id: UUID
    nombre_empresa: str
    rfc: str
    direccion: str
    telefono: str
    email: str
    sitio_web: str
    logo_url: str
    
    # Financiero
    moneda_principal: str  # MXN, USD
    iva_porcentaje: Decimal
    retencion_iva: Decimal
    retencion_isr: Decimal
    margen_utilidad_default: Decimal
    
    # Email
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str (encrypted)
    
    # Plantillas
    plantilla_cotizacion: str
    plantilla_contrato: str
    plantilla_orden_compra: str
    
    updated_at: datetime
```

**Endpoints:**
```
GET    /api/v1/configuracion
PUT    /api/v1/configuracion
POST   /api/v1/configuracion/logo
GET    /api/v1/configuracion/catalogos
PUT    /api/v1/configuracion/catalogos/{tipo}
```

---

## 🎨 Diseño de Interfaz (UI/UX)

### Paleta de Colores

```typescript
// tailwind.config.js
colors: {
  primary: {
    50: '#F5F3F0',   // Beige muy claro
    100: '#E8E4DE',
    200: '#D1C9BD',
    300: '#BAAE9C',
    400: '#A3937B',
    500: '#8C785A',  // Beige principal
    600: '#70604B',
    700: '#54483C',
    800: '#38302D',
    900: '#1C181E',
  },
  secondary: {
    50: '#F7F7F7',   // Gris muy claro
    100: '#EFEFEF',
    200: '#DFDFDF',
    300: '#CFCFCF',
    400: '#BFBFBF',
    500: '#808080',  // Gris principal
    600: '#666666',
    700: '#4D4D4D',
    800: '#333333',
    900: '#1A1A1A',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}
```

### Componentes Base (shadcn/ui)

- Button (variantes: default, outline, ghost en beige/gris)
- Card
- Table
- Form (con React Hook Form)
- Dialog / Modal
- Dropdown Menu
- Tabs
- Badge
- Alert
- Calendar
- Select
- Input
- Textarea
- Checkbox
- Radio Group
- Switch
- Toast

### Layouts

**Sidebar Navigation:**
```
- Dashboard
- Proyectos
- Cotizaciones
- Clientes
- Empleados
- Subcontratistas
- Materiales
  - Inventario
  - Solicitudes de Compra
  - Órdenes de Compra
- Maquinaria
- Finanzas
  - Ingresos
  - Egresos
  - Cuentas por Cobrar
  - Cuentas por Pagar
- Proveedores
- Reportes
- Configuración
```

---

## 📊 Base de Datos - Esquema Principal

### Tablas Core

```sql
-- Usuarios y Autenticación
usuarios
roles_permisos

-- Módulo Clientes
clientes
contactos_clientes
documentos_clientes

-- Módulo Proyectos
proyectos
fases_proyecto
documentos_proyecto
fotos_proyecto
bitacora_proyecto

-- Módulo Cotizaciones
cotizaciones
partidas_cotizacion
materiales_partida

-- Módulo Empleados
empleados
asistencias
capacitaciones
evaluaciones_empleado
documentos_empleado

-- Módulo Subcontratistas
subcontratistas
trabajos_subcontratista
evaluaciones_subcontratista
documentos_subcontratista

-- Módulo Materiales
materiales
categorias_material
movimientos_inventario
precios_material_historico
solicitudes_compra
items_solicitud_compra
ordenes_compra
items_orden_compra
recepciones_material

-- Módulo Proveedores
proveedores
productos_proveedor
contactos_proveedor
evaluaciones_proveedor

-- Módulo Maquinaria
maquinaria
mantenimientos_maquinaria
asignaciones_maquinaria
bitacora_maquinaria

-- Módulo Financiero
ingresos
egresos
cuentas_por_cobrar
pagos_cuenta_cobrar
cuentas_por_pagar
pagos_cuenta_pagar

-- Sistema
alertas
configuracion_empresa
logs_actividad
```

### Relaciones Importantes

```
clientes 1:N proyectos
proyectos 1:N fases_proyecto
proyectos 1:N documentos_proyecto
proyectos 1:N fotos_proyecto
proyectos 1:N bitacora_proyecto
proyectos 1:N egresos
proyectos 1:N ingresos

cotizaciones 1:N partidas_cotizacion
cotizaciones N:1 clientes
cotizaciones 1:1 proyectos (nullable)

empleados N:M proyectos (asignaciones)
proyectos N:M subcontratistas
proyectos N:M materiales (consumo)
proyectos N:M maquinaria (asignaciones)

materiales N:M proveedores
ordenes_compra N:1 proveedores
ordenes_compra 1:N recepciones_material
```

---

## 🔒 Seguridad

### Autenticación
- JWT con access token (15 min) y refresh token (7 días)
- Tokens almacenados en httpOnly cookies
- CSRF protection
- Rate limiting en endpoints de auth

### Autorización
- RBAC (Role-Based Access Control)
- Middleware de permisos por endpoint
- Validación de propiedad de recursos

### Datos Sensibles
- Encriptación de contraseñas con bcrypt
- Encriptación de datos bancarios en BD
- Enmascaramiento de datos sensibles en logs
- Variables de entorno para credenciales

### Uploads
- Validación de tipos de archivo
- Límite de tamaño por archivo
- Escaneo de malware (ClamAV opcional)
- Storage en Cloudinary con URLs firmadas

---

## 📱 Responsive Design

### Breakpoints
```
sm: 640px   // Móvil grande
md: 768px   // Tablet
lg: 1024px  // Desktop pequeño
xl: 1280px  // Desktop grande
2xl: 1536px // Desktop muy grande
```

### Estrategia Mobile-First
- Sidebar colapsable en móvil (hamburger menu)
- Tablas con scroll horizontal en móvil
- Cards apiladas en móvil, grid en desktop
- Formularios de una columna en móvil
- Modals fullscreen en móvil

---

## 🧪 Testing

### Backend (Pytest)
```python
# tests/api/test_proyectos.py
def test_crear_proyecto(client, auth_headers):
    response = client.post(
        "/api/v1/proyectos",
        headers=auth_headers,
        json={
            "nombre": "Residencial Las Palmas",
            "tipo": "residencial",
            "cliente_id": "..."
        }
    )
    assert response.status_code == 201
```

### Frontend (Vitest + React Testing Library)
```typescript
// components/proyectos/ProyectoForm.test.tsx
describe('ProyectoForm', () => {
  it('should submit form with valid data', async () => {
    // Test implementation
  });
});
```

---

## 🚀 Deployment

### Docker Compose (Producción)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: constructora_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db/constructora_db
      REDIS_URL: redis://redis:6379
    restart: always

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.core.celery_app worker -l info
    depends_on:
      - db
      - redis
    restart: always

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.core.celery_app beat -l info
    depends_on:
      - db
      - redis
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${API_URL}
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: always

volumes:
  postgres_data:
```

---

## 📋 Checklist de Implementación

### Fase 1: Setup Inicial (Semana 1-2)
- [ ] Crear estructura de carpetas
- [ ] Configurar Docker Compose
- [ ] Configurar PostgreSQL
- [ ] Configurar Redis
- [ ] Setup backend FastAPI
- [ ] Setup frontend React + Vite
- [ ] Configurar Tailwind + shadcn/ui
- [ ] Implementar sistema de autenticación JWT
- [ ] Implementar roles y permisos

### Fase 2: Módulos Core (Semana 3-6)
- [ ] CRUD Clientes
- [ ] CRUD Empleados
- [ ] CRUD Proyectos completo
  - [ ] Fases
  - [ ] Documentos
  - [ ] Galería
  - [ ] Bitácora
- [ ] CRUD Cotizaciones
  - [ ] Partidas
  - [ ] Generación PDF
  - [ ] Conversión a proyecto
- [ ] Dashboard principal

### Fase 3: Módulos Operativos (Semana 7-10)
- [ ] CRUD Subcontratistas
- [ ] CRUD Proveedores
- [ ] Módulo de Materiales
  - [ ] Inventario
  - [ ] Solicitudes de compra
  - [ ] Órdenes de compra
- [ ] Módulo de Maquinaria
  - [ ] Asignaciones
  - [ ] Mantenimientos

### Fase 4: Módulo Financiero (Semana 11-13)
- [ ] Ingresos
- [ ] Egresos
- [ ] Cuentas por cobrar
- [ ] Cuentas por pagar
- [ ] Dashboard financiero
- [ ] Reportes financieros

### Fase 5: Alertas y Reportes (Semana 14-15)
- [ ] Sistema de alertas
- [ ] Tareas Celery programadas
- [ ] Reportes de proyectos
- [ ] Reportes financieros
- [ ] Reportes operativos
- [ ] Exportación a PDF/Excel

### Fase 6: Testing y Deploy (Semana 16-17)
- [ ] Tests unitarios backend
- [ ] Tests de integración
- [ ] Tests frontend
- [ ] Configuración CI/CD
- [ ] Deploy a producción
- [ ] Monitoreo y logging
- [ ] Documentación final

---

## 🎯 Funcionalidades Destacadas

### 1. Timeline de Proyecto (Gantt Chart)
```typescript
// Usando react-gantt-chart o similar
<GanttChart
  tasks={fases}
  onTaskChange={handleFaseUpdate}
  viewMode="Month"
/>
```

### 2. Mapa de Proyectos
```typescript
// Usando react-leaflet
<MapContainer center={[19.432, -99.133]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {proyectos.map(proyecto => (
    <Marker 
      key={proyecto.id}
      position={[proyecto.latitud, proyecto.longitud]}
      onClick={() => navigate(`/proyectos/${proyecto.id}`)}
    >
      <Popup>{proyecto.nombre}</Popup>
    </Marker>
  ))}
</MapContainer>
```

### 3. Comparador de Cotizaciones
```typescript
// Vista lado a lado de múltiples cotizaciones
<CotizacionComparator
  cotizaciones={[cot1, cot2, cot3]}
  onSelect={handleSelectCotizacion}
/>
```

### 4. Galería de Fotos con Comparación Antes/Después
```typescript
// Slider de comparación de fotos
<BeforeAfterSlider
  before={fotoInicio}
  after={fotoActual}
/>
```

### 5. Generador de Reportes Personalizados
```typescript
// Constructor de reportes con drag & drop
<ReportBuilder
  availableFields={campos}
  onGenerate={handleGenerate}
  exportFormats={['PDF', 'Excel', 'CSV']}
/>
```

---

## 📚 Recursos Adicionales

### Documentación Recomendada
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Herramientas Útiles
- **Postman/Insomnia:** Testing de API
- **DBeaver:** Cliente PostgreSQL
- **Redis Commander:** Visualizar Redis
- **Sentry:** Monitoreo de errores
- **Cloudinary:** Storage de imágenes

---

## 🔄 Actualizaciones Futuras

### Versión 1.1
- [ ] App móvil nativa (React Native)
- [ ] Integración con contabilidad (SAT)
- [ ] OCR para facturas
- [ ] Firma electrónica avanzada

### Versión 1.2
- [ ] IA para estimación de costos
- [ ] Reconocimiento de imagen para inspecciones
- [ ] Chatbot para clientes
- [ ] Dashboard predictivo con ML

### Versión 2.0
- [ ] Multi-empresa
- [ ] Franquicias
- [ ] API pública para integraciones
- [ ] Marketplace de subcontratistas

---

## ✅ Comandos Rápidos

```bash
# Desarrollo
docker-compose up -d
docker-compose logs -f backend

# Migraciones
docker-compose exec backend alembic upgrade head
docker-compose exec backend alembic revision --autogenerate -m "mensaje"

# Tests
docker-compose exec backend pytest
docker-compose exec backend pytest --cov=app

# Frontend
cd frontend && npm run dev
cd frontend && npm run build

# Producción
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

---

**¿Listo para empezar a construir? 🏗️**

Este sistema está diseñado para escalar y adaptarse a las necesidades de cualquier empresa constructora, desde pequeños contratistas hasta grandes constructoras con múltiples proyectos simultáneos.


- Credentials: admin@constructora.com / Admin123!