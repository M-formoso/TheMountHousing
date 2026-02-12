from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "constructora",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    timezone="America/Mexico_City",
    enable_utc=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
)

# Tareas programadas (se ejecutan diariamente)
celery_app.conf.beat_schedule = {
    "verificar-retrasos-proyectos": {
        "task": "app.tasks.alertas.verificar_retrasos_proyectos",
        "schedule": crontab(hour=7, minute=0),  # 7:00 AM México
    },
    "verificar-stock-materiales": {
        "task": "app.tasks.alertas.verificar_stock_materiales",
        "schedule": crontab(hour=7, minute=5),
    },
    "verificar-mantenimientos-maquinaria": {
        "task": "app.tasks.alertas.verificar_mantenimientos_maquinaria",
        "schedule": crontab(hour=7, minute=10),
    },
    "verificar-vencimientos": {
        "task": "app.tasks.alertas.verificar_vencimientos",
        "schedule": crontab(hour=7, minute=15),
    },
    "verificar-cuentas-cobrar-vencidas": {
        "task": "app.tasks.alertas.verificar_cuentas_cobrar_vencidas",
        "schedule": crontab(hour=7, minute=20),
    },
}

# Importar tasks para que Celery las descubre
celery_app.autodiscover_tasks(["app.tasks"])
