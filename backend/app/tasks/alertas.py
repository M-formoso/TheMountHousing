from app.core.celery_app import celery_app
from datetime import datetime, timedelta
from uuid import uuid4


def _get_db():
    """Helper para obtener sesión de BD desde dentro de una tarea Celery."""
    from app.db.session import SessionLocal
    return SessionLocal()


@celery_app.task(name="app.tasks.alertas.verificar_retrasos_proyectos")
def verificar_retrasos_proyectos():
    """Busca proyectos con fecha_fin_estimada pasada y no finalizados."""
    from app.models.proyecto import Proyecto, EstadoProyecto
    from app.models.alerta import Alerta, TipoAlerta, Prioridad

    db = _get_db()
    hoy = datetime.utcnow().date()

    proyectos_retrasados = db.query(Proyecto).filter(
        Proyecto.activo.is_(True),
        Proyecto.fecha_fin_estimada < hoy,
        Proyecto.estado.notin_([EstadoProyecto.FINALIZADO, EstadoProyecto.CANCELADO]),
    ).all()

    for proyecto in proyectos_retrasados:
        # Verificar si ya existe alerta activa
        alerta_existe = db.query(Alerta).filter(
            Alerta.entidad_tipo == "proyecto",
            Alerta.entidad_id == proyecto.id,
            Alerta.tipo == TipoAlerta.PROYECTO_RETRASO,
            Alerta.leida.is_(False),
        ).first()

        if not alerta_existe:
            dias_retraso = (hoy - proyecto.fecha_fin_estimada).days
            alerta = Alerta(
                id=str(uuid4()),
                tipo=TipoAlerta.PROYECTO_RETRASO,
                prioridad=Prioridad.ALTA if dias_retraso > 7 else Prioridad.MEDIA,
                titulo=f"Proyecto en retraso: {proyecto.nombre}",
                mensaje=f"El proyecto '{proyecto.nombre}' ({proyecto.codigo}) tiene {dias_retraso} días de retraso respecto a la fecha estimada de finalización.",
                entidad_tipo="proyecto",
                entidad_id=proyecto.id,
                accion_url=f"/proyectos/{proyecto.id}",
                accion_texto="Ver proyecto",
                rol_destinatario="administrador",
            )
            db.add(alerta)

    db.commit()
    db.close()


@celery_app.task(name="app.tasks.alertas.verificar_stock_materiales")
def verificar_stock_materiales():
    """Busca materiales con stock por debajo del mínimo."""
    from app.models.material import Material
    from app.models.alerta import Alerta, TipoAlerta, Prioridad

    db = _get_db()

    materiales_bajo = db.query(Material).filter(
        Material.activo.is_(True),
        Material.stock_actual < Material.stock_minimo,
    ).all()

    for material in materiales_bajo:
        alerta_existe = db.query(Alerta).filter(
            Alerta.entidad_tipo == "material",
            Alerta.entidad_id == material.id,
            Alerta.tipo == TipoAlerta.STOCK_BAJO,
            Alerta.leida.is_(False),
        ).first()

        if not alerta_existe:
            alerta = Alerta(
                id=str(uuid4()),
                tipo=TipoAlerta.STOCK_BAJO,
                prioridad=Prioridad.ALTA,
                titulo=f"Stock bajo: {material.nombre}",
                mensaje=f"El material '{material.nombre}' tiene stock actual de {material.stock_actual} (mínimo: {material.stock_minimo}).",
                entidad_tipo="material",
                entidad_id=material.id,
                accion_url=f"/materiales/{material.id}",
                accion_texto="Ver material",
                rol_destinatario="compras",
            )
            db.add(alerta)

    db.commit()
    db.close()


@celery_app.task(name="app.tasks.alertas.verificar_mantenimientos_maquinaria")
def verificar_mantenimientos_maquinaria():
    """Verifica maquinaria próxima a mantenimiento (dentro de 7 días)."""
    from app.models.maquinaria import Maquinaria
    from app.models.alerta import Alerta, TipoAlerta, Prioridad

    db = _get_db()
    hoy = datetime.utcnow().date()
    limite = hoy + timedelta(days=7)

    maquinaria_lista = db.query(Maquinaria).filter(
        Maquinaria.activo.is_(True),
        Maquinaria.proxima_mantenimiento <= limite,
        Maquinaria.proxima_mantenimiento >= hoy,
    ).all()

    for maq in maquinaria_lista:
        alerta_existe = db.query(Alerta).filter(
            Alerta.entidad_tipo == "maquinaria",
            Alerta.entidad_id == maq.id,
            Alerta.tipo == TipoAlerta.MANTENIMIENTO_MAQUINARIA,
            Alerta.leida.is_(False),
        ).first()

        if not alerta_existe:
            alerta = Alerta(
                id=str(uuid4()),
                tipo=TipoAlerta.MANTENIMIENTO_MAQUINARIA,
                prioridad=Prioridad.MEDIA,
                titulo=f"Mantenimiento próximo: {maq.nombre}",
                mensaje=f"La maquinaria '{maq.nombre}' requiere mantenimiento el {maq.proxima_mantenimiento}.",
                entidad_tipo="maquinaria",
                entidad_id=maq.id,
                accion_url=f"/maquinaria/{maq.id}",
                accion_texto="Ver maquinaria",
                rol_destinatario="administrador",
            )
            db.add(alerta)

    db.commit()
    db.close()


@celery_app.task(name="app.tasks.alertas.verificar_vencimientos")
def verificar_vencimientos():
    """Verifica seguros y permisos próximos a vencer."""
    # Implementación futura: seguros maquinaria, certificaciones empleados
    pass


@celery_app.task(name="app.tasks.alertas.verificar_cuentas_cobrar_vencidas")
def verificar_cuentas_cobrar_vencidas():
    """Verifica cuentas por cobrar con fecha de vencimiento pasada."""
    from app.models.finanzas import CuentaPorCobrar
    from app.models.alerta import Alerta, TipoAlerta, Prioridad

    db = _get_db()
    hoy = datetime.utcnow().date()

    cuentas_vencidas = db.query(CuentaPorCobrar).filter(
        CuentaPorCobrar.activo.is_(True),
        CuentaPorCobrar.fecha_vencimiento < hoy,
        CuentaPorCobrar.estado.in_(["pendiente", "parcial"]),
    ).all()

    for cuenta in cuentas_vencidas:
        alerta_existe = db.query(Alerta).filter(
            Alerta.entidad_tipo == "cuenta_cobrar",
            Alerta.entidad_id == cuenta.id,
            Alerta.tipo == TipoAlerta.CUENTA_COBRAR_VENCIDA,
            Alerta.leida.is_(False),
        ).first()

        if not alerta_existe:
            alerta = Alerta(
                id=str(uuid4()),
                tipo=TipoAlerta.CUENTA_COBRAR_VENCIDA,
                prioridad=Prioridad.ALTA,
                titulo=f"Cuenta por cobrar vencida",
                mensaje=f"La cuenta por cobrar '{cuenta.concepto}' por ${float(cuenta.saldo):,.2f} ha vencido.",
                entidad_tipo="cuenta_cobrar",
                entidad_id=cuenta.id,
                accion_url=f"/finanzas/cobrar/{cuenta.id}",
                accion_texto="Ver cuenta",
                rol_destinatario="contador",
            )
            db.add(alerta)

    db.commit()
    db.close()
