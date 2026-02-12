"""Initial migration with all models

Revision ID: 001
Revises:
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Usuarios
    op.create_table('usuarios',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('apellido_paterno', sa.String(length=100), nullable=False),
        sa.Column('apellido_materno', sa.String(length=100), nullable=True),
        sa.Column('telefono', sa.String(length=20), nullable=True),
        sa.Column('rol', sa.String(length=30), nullable=True),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('ultimo_acceso', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_usuarios_email'), 'usuarios', ['email'], unique=True)

    # Clientes
    op.create_table('clientes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('numero_cliente', sa.String(length=20), nullable=False),
        sa.Column('tipo', sa.String(length=10), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('apellido_paterno', sa.String(length=100), nullable=True),
        sa.Column('apellido_materno', sa.String(length=100), nullable=True),
        sa.Column('razon_social', sa.String(length=255), nullable=True),
        sa.Column('rfc', sa.String(length=13), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=True),
        sa.Column('telefono_alternativo', sa.String(length=20), nullable=True),
        sa.Column('direccion', sa.String(length=500), nullable=True),
        sa.Column('ciudad', sa.String(length=100), nullable=True),
        sa.Column('estado', sa.String(length=100), nullable=True),
        sa.Column('codigo_postal', sa.String(length=10), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_clientes_numero_cliente'), 'clientes', ['numero_cliente'], unique=True)

    # Empleados
    op.create_table('empleados',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('numero_empleado', sa.String(length=20), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('apellido_paterno', sa.String(length=100), nullable=False),
        sa.Column('apellido_materno', sa.String(length=100), nullable=True),
        sa.Column('fecha_nacimiento', sa.Date(), nullable=True),
        sa.Column('genero', sa.String(length=1), nullable=True),
        sa.Column('rfc', sa.String(length=13), nullable=True),
        sa.Column('curp', sa.String(length=18), nullable=True),
        sa.Column('nss', sa.String(length=11), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=False),
        sa.Column('telefono_emergencia', sa.String(length=20), nullable=True),
        sa.Column('contacto_emergencia', sa.String(length=255), nullable=True),
        sa.Column('direccion', sa.String(length=500), nullable=True),
        sa.Column('ciudad', sa.String(length=100), nullable=True),
        sa.Column('estado', sa.String(length=100), nullable=True),
        sa.Column('codigo_postal', sa.String(length=10), nullable=True),
        sa.Column('puesto', sa.String(length=100), nullable=False),
        sa.Column('departamento', sa.String(length=30), nullable=False),
        sa.Column('fecha_ingreso', sa.Date(), nullable=True),
        sa.Column('fecha_baja', sa.Date(), nullable=True),
        sa.Column('tipo_contrato', sa.String(length=20), nullable=True),
        sa.Column('salario_diario', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('tipo_sangre', sa.String(length=5), nullable=True),
        sa.Column('alergias', sa.String(), nullable=True),
        sa.Column('foto_url', sa.String(length=500), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_empleados_numero_empleado'), 'empleados', ['numero_empleado'], unique=True)

    # Proyectos
    op.create_table('proyectos',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('codigo', sa.String(length=30), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('estado', sa.String(length=20), nullable=True),
        sa.Column('cliente_id', sa.String(length=36), nullable=False),
        sa.Column('gerente_proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('direccion', sa.String(length=500), nullable=True),
        sa.Column('ciudad', sa.String(length=100), nullable=True),
        sa.Column('estado_geo', sa.String(length=100), nullable=True),
        sa.Column('codigo_postal', sa.String(length=10), nullable=True),
        sa.Column('latitud', sa.Float(), nullable=True),
        sa.Column('longitud', sa.Float(), nullable=True),
        sa.Column('fecha_inicio', sa.Date(), nullable=True),
        sa.Column('fecha_fin_estimada', sa.Date(), nullable=True),
        sa.Column('fecha_fin_real', sa.Date(), nullable=True),
        sa.Column('presupuesto_total', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('costo_real', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('margen_ganancia_esperado', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('area_construccion_m2', sa.Float(), nullable=True),
        sa.Column('progreso_general', sa.Integer(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
        sa.ForeignKeyConstraint(['gerente_proyecto_id'], ['empleados.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_proyectos_codigo'), 'proyectos', ['codigo'], unique=True)

    # Tabla intermedia proyecto_empleados
    op.create_table('proyecto_empleados',
        sa.Column('proyecto_id', sa.String(length=36), nullable=False),
        sa.Column('empleado_id', sa.String(length=36), nullable=False),
        sa.ForeignKeyConstraint(['empleado_id'], ['empleados.id'], ),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.PrimaryKeyConstraint('proyecto_id', 'empleado_id')
    )

    # Fases de Proyecto
    op.create_table('fases_proyecto',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=False),
        sa.Column('numero_fase', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('fecha_inicio', sa.Date(), nullable=True),
        sa.Column('fecha_fin_estimada', sa.Date(), nullable=True),
        sa.Column('fecha_fin_real', sa.Date(), nullable=True),
        sa.Column('progreso', sa.Integer(), nullable=True),
        sa.Column('estado', sa.String(length=30), nullable=True),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Documentos Proyecto
    op.create_table('documentos_proyecto',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('notas', sa.String(), nullable=True),
        sa.Column('subido_por_id', sa.String(length=36), nullable=True),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.ForeignKeyConstraint(['subido_por_id'], ['usuarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Fotos Proyecto
    op.create_table('fotos_proyecto',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('url_thumbnail', sa.String(length=500), nullable=True),
        sa.Column('etapa', sa.String(length=30), nullable=True),
        sa.Column('fecha_foto', sa.Date(), nullable=True),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('subido_por_id', sa.String(length=36), nullable=True),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.ForeignKeyConstraint(['subido_por_id'], ['usuarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Bitácora Proyecto
    op.create_table('bitacora_proyecto',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=False),
        sa.Column('autor_id', sa.String(length=36), nullable=False),
        sa.Column('contenido', sa.String(), nullable=False),
        sa.Column('clima', sa.String(length=100), nullable=True),
        sa.Column('temperatura', sa.Float(), nullable=True),
        sa.Column('trabajadores_presentes', sa.Integer(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['autor_id'], ['usuarios.id'], ),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Subcontratistas
    op.create_table('subcontratistas',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('codigo', sa.String(length=20), nullable=False),
        sa.Column('nombre_empresa', sa.String(length=255), nullable=False),
        sa.Column('nombre_contacto', sa.String(length=255), nullable=True),
        sa.Column('especialidad', sa.String(length=30), nullable=False),
        sa.Column('rfc', sa.String(length=13), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=False),
        sa.Column('telefono_alternativo', sa.String(length=20), nullable=True),
        sa.Column('direccion', sa.String(length=500), nullable=True),
        sa.Column('ciudad', sa.String(length=100), nullable=True),
        sa.Column('estado', sa.String(length=100), nullable=True),
        sa.Column('rango_precio', sa.String(length=10), nullable=True),
        sa.Column('calificacion', sa.Float(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subcontratistas_codigo'), 'subcontratistas', ['codigo'], unique=True)

    # Proveedores
    op.create_table('proveedores',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('codigo', sa.String(length=20), nullable=False),
        sa.Column('nombre_empresa', sa.String(length=255), nullable=False),
        sa.Column('nombre_contacto', sa.String(length=255), nullable=True),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('rfc', sa.String(length=13), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=False),
        sa.Column('telefono_alternativo', sa.String(length=20), nullable=True),
        sa.Column('direccion', sa.String(length=500), nullable=True),
        sa.Column('ciudad', sa.String(length=100), nullable=True),
        sa.Column('estado', sa.String(length=100), nullable=True),
        sa.Column('calificacion_calidad', sa.Float(), nullable=True),
        sa.Column('calificacion_precio', sa.Float(), nullable=True),
        sa.Column('calificacion_servicio', sa.Float(), nullable=True),
        sa.Column('calificacion_general', sa.Float(), nullable=True),
        sa.Column('dias_credito', sa.Integer(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_proveedores_codigo'), 'proveedores', ['codigo'], unique=True)

    # Cotizaciones
    op.create_table('cotizaciones',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('numero', sa.String(length=30), nullable=False),
        sa.Column('cliente_id', sa.String(length=36), nullable=False),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('fecha_emision', sa.Date(), nullable=False),
        sa.Column('fecha_vencimiento', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(length=20), nullable=True),
        sa.Column('version', sa.Integer(), nullable=True),
        sa.Column('subtotal', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('iva', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('total', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('validez_dias', sa.Integer(), nullable=True),
        sa.Column('forma_pago', sa.String(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.Column('aprobada_por_id', sa.String(length=36), nullable=True),
        sa.Column('fecha_aprobacion', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.ForeignKeyConstraint(['aprobada_por_id'], ['usuarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cotizaciones_numero'), 'cotizaciones', ['numero'], unique=True)

    # Partidas Cotización
    op.create_table('partidas_cotizacion',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('cotizacion_id', sa.String(length=36), nullable=False),
        sa.Column('numero_partida', sa.Integer(), nullable=False),
        sa.Column('concepto', sa.String(length=500), nullable=False),
        sa.Column('cantidad', sa.Float(), nullable=False),
        sa.Column('unidad', sa.String(length=50), nullable=False),
        sa.Column('precio_unitario', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('importe', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['cotizacion_id'], ['cotizaciones.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Materiales
    op.create_table('materiales',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('codigo', sa.String(length=30), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('categoria', sa.String(length=20), nullable=False),
        sa.Column('subcategoria', sa.String(length=100), nullable=True),
        sa.Column('unidad_medida', sa.String(length=10), nullable=False),
        sa.Column('precio_unitario_actual', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('stock_actual', sa.Float(), nullable=True),
        sa.Column('stock_minimo', sa.Float(), nullable=True),
        sa.Column('stock_maximo', sa.Float(), nullable=True),
        sa.Column('ubicacion_almacen', sa.String(length=100), nullable=True),
        sa.Column('proveedor_principal_id', sa.String(length=36), nullable=True),
        sa.ForeignKeyConstraint(['proveedor_principal_id'], ['proveedores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_materiales_codigo'), 'materiales', ['codigo'], unique=True)

    # Movimientos Inventario
    op.create_table('movimientos_inventario',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('material_id', sa.String(length=36), nullable=False),
        sa.Column('tipo', sa.String(length=10), nullable=False),
        sa.Column('cantidad', sa.Float(), nullable=False),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('orden_compra_id', sa.String(length=36), nullable=True),
        sa.Column('usuario_id', sa.String(length=36), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('costo_unitario', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('costo_total', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['material_id'], ['materiales.id'], ),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Precios Material Histórico
    op.create_table('precios_material_historico',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('material_id', sa.String(length=36), nullable=False),
        sa.Column('precio', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('proveedor_id', sa.String(length=36), nullable=True),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['material_id'], ['materiales.id'], ),
        sa.ForeignKeyConstraint(['proveedor_id'], ['proveedores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Solicitudes de Compra
    op.create_table('solicitudes_compra',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('numero', sa.String(length=30), nullable=False),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('solicitante_id', sa.String(length=36), nullable=False),
        sa.Column('fecha_solicitud', sa.Date(), nullable=False),
        sa.Column('fecha_requerida', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(length=30), nullable=True),
        sa.Column('prioridad', sa.String(length=10), nullable=True),
        sa.Column('total_estimado', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.ForeignKeyConstraint(['solicitante_id'], ['usuarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_solicitudes_compra_numero'), 'solicitudes_compra', ['numero'], unique=True)

    # Items Solicitud Compra
    op.create_table('items_solicitud_compra',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('solicitud_id', sa.String(length=36), nullable=False),
        sa.Column('material_id', sa.String(length=36), nullable=False),
        sa.Column('cantidad', sa.Float(), nullable=False),
        sa.Column('precio_estimado', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['solicitud_id'], ['solicitudes_compra.id'], ),
        sa.ForeignKeyConstraint(['material_id'], ['materiales.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Ordenes de Compra
    op.create_table('ordenes_compra',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('numero', sa.String(length=30), nullable=False),
        sa.Column('solicitud_compra_id', sa.String(length=36), nullable=True),
        sa.Column('proveedor_id', sa.String(length=36), nullable=False),
        sa.Column('fecha_orden', sa.Date(), nullable=False),
        sa.Column('fecha_entrega_esperada', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(length=30), nullable=True),
        sa.Column('subtotal', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('iva', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('total', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('condiciones_pago', sa.String(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['solicitud_compra_id'], ['solicitudes_compra.id'], ),
        sa.ForeignKeyConstraint(['proveedor_id'], ['proveedores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ordenes_compra_numero'), 'ordenes_compra', ['numero'], unique=True)

    # Items Orden Compra
    op.create_table('items_orden_compra',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('orden_id', sa.String(length=36), nullable=False),
        sa.Column('material_id', sa.String(length=36), nullable=False),
        sa.Column('cantidad', sa.Float(), nullable=False),
        sa.Column('precio_unitario', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('importe', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['orden_id'], ['ordenes_compra.id'], ),
        sa.ForeignKeyConstraint(['material_id'], ['materiales.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Maquinaria
    op.create_table('maquinaria',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('codigo', sa.String(length=20), nullable=False),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('tipo', sa.String(length=30), nullable=False),
        sa.Column('marca', sa.String(length=100), nullable=True),
        sa.Column('modelo', sa.String(length=100), nullable=True),
        sa.Column('anio', sa.Integer(), nullable=True),
        sa.Column('numero_serie', sa.String(length=100), nullable=True),
        sa.Column('tipo_propiedad', sa.String(length=10), nullable=True),
        sa.Column('estado', sa.String(length=20), nullable=True),
        sa.Column('tipo_combustible', sa.String(length=20), nullable=True),
        sa.Column('consumo_promedio_litros_hora', sa.Float(), nullable=True),
        sa.Column('costo_renta_dia', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('costo_adquisicion', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('fecha_adquisicion', sa.Date(), nullable=True),
        sa.Column('proveedor_renta_id', sa.String(length=36), nullable=True),
        sa.Column('proyecto_actual_id', sa.String(length=36), nullable=True),
        sa.Column('ubicacion_actual', sa.String(length=500), nullable=True),
        sa.Column('horas_uso', sa.Float(), nullable=True),
        sa.Column('proximo_mantenimiento', sa.Date(), nullable=True),
        sa.Column('poliza_seguro', sa.String(length=100), nullable=True),
        sa.Column('fecha_vencimiento_seguro', sa.Date(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['proveedor_renta_id'], ['proveedores.id'], ),
        sa.ForeignKeyConstraint(['proyecto_actual_id'], ['proyectos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_maquinaria_codigo'), 'maquinaria', ['codigo'], unique=True)

    # Mantenimiento Maquinaria
    op.create_table('mantenimientos_maquinaria',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('maquinaria_id', sa.String(length=36), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=False),
        sa.Column('costo', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('proveedor_servicio', sa.String(length=255), nullable=True),
        sa.Column('proximo_mantenimiento', sa.Date(), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['maquinaria_id'], ['maquinaria.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Ingresos
    op.create_table('ingresos',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('concepto', sa.String(length=500), nullable=False),
        sa.Column('monto', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('forma_pago', sa.String(length=30), nullable=True),
        sa.Column('referencia', sa.String(length=100), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('cliente_id', sa.String(length=36), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Egresos
    op.create_table('egresos',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('categoria', sa.String(length=20), nullable=False),
        sa.Column('concepto', sa.String(length=500), nullable=False),
        sa.Column('monto', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('forma_pago', sa.String(length=30), nullable=True),
        sa.Column('referencia', sa.String(length=100), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('proveedor_id', sa.String(length=36), nullable=True),
        sa.Column('estado_pago', sa.String(length=20), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.ForeignKeyConstraint(['proveedor_id'], ['proveedores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Cuentas por Cobrar
    op.create_table('cuentas_por_cobrar',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('concepto', sa.String(length=500), nullable=False),
        sa.Column('monto_total', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('monto_pagado', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('saldo', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('fecha_emision', sa.Date(), nullable=False),
        sa.Column('fecha_vencimiento', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(length=20), nullable=True),
        sa.Column('cliente_id', sa.String(length=36), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Pagos Cuenta Cobrar
    op.create_table('pagos_cuenta_cobrar',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('cuenta_id', sa.String(length=36), nullable=False),
        sa.Column('monto', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('forma_pago', sa.String(length=30), nullable=True),
        sa.Column('referencia', sa.String(length=100), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['cuenta_id'], ['cuentas_por_cobrar.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Cuentas por Pagar
    op.create_table('cuentas_por_pagar',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('concepto', sa.String(length=500), nullable=False),
        sa.Column('monto_total', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('monto_pagado', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('saldo', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('fecha_emision', sa.Date(), nullable=False),
        sa.Column('fecha_vencimiento', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(length=20), nullable=True),
        sa.Column('proveedor_id', sa.String(length=36), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('prioridad', sa.String(length=10), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['proveedor_id'], ['proveedores.id'], ),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Pagos Cuenta Pagar
    op.create_table('pagos_cuenta_pagar',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('cuenta_id', sa.String(length=36), nullable=False),
        sa.Column('monto', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('forma_pago', sa.String(length=30), nullable=True),
        sa.Column('referencia', sa.String(length=100), nullable=True),
        sa.Column('notas', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['cuenta_id'], ['cuentas_por_pagar.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Alertas
    op.create_table('alertas',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.Column('tipo', sa.String(length=30), nullable=False),
        sa.Column('titulo', sa.String(length=255), nullable=False),
        sa.Column('descripcion', sa.String(), nullable=True),
        sa.Column('prioridad', sa.String(length=10), nullable=True),
        sa.Column('leida', sa.Boolean(), nullable=True),
        sa.Column('fecha_expiracion', sa.Date(), nullable=True),
        sa.Column('usuario_id', sa.String(length=36), nullable=True),
        sa.Column('proyecto_id', sa.String(length=36), nullable=True),
        sa.Column('entidad_relacionada_id', sa.String(length=36), nullable=True),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ),
        sa.ForeignKeyConstraint(['proyecto_id'], ['proyectos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Foreign key para orden_compra_id en movimientos_inventario
    op.create_foreign_key(None, 'movimientos_inventario', 'ordenes_compra', ['orden_compra_id'], ['id'])


def downgrade():
    op.drop_table('alertas')
    op.drop_table('pagos_cuenta_pagar')
    op.drop_table('cuentas_por_pagar')
    op.drop_table('pagos_cuenta_cobrar')
    op.drop_table('cuentas_por_cobrar')
    op.drop_table('egresos')
    op.drop_table('ingresos')
    op.drop_table('mantenimientos_maquinaria')
    op.drop_table('maquinaria')
    op.drop_table('items_orden_compra')
    op.drop_table('ordenes_compra')
    op.drop_table('items_solicitud_compra')
    op.drop_table('solicitudes_compra')
    op.drop_table('precios_material_historico')
    op.drop_table('movimientos_inventario')
    op.drop_table('materiales')
    op.drop_table('partidas_cotizacion')
    op.drop_table('cotizaciones')
    op.drop_table('proveedores')
    op.drop_table('subcontratistas')
    op.drop_table('bitacora_proyecto')
    op.drop_table('fotos_proyecto')
    op.drop_table('documentos_proyecto')
    op.drop_table('fases_proyecto')
    op.drop_table('proyecto_empleados')
    op.drop_table('proyectos')
    op.drop_table('empleados')
    op.drop_table('clientes')
    op.drop_table('usuarios')
