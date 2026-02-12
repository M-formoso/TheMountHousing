from sqlalchemy.orm import Session
from datetime import datetime
from app.models.alerta import Alerta


class AlertaService:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self,
        skip: int = 0,
        limit: int = 30,
        usuario_id: str | None = None,
        rol: str | None = None,
        leida: bool | None = None,
        tipo: str | None = None,
    ) -> tuple[list[Alerta], int]:
        query = self.db.query(Alerta).filter(Alerta.activo.is_(True))
        if usuario_id:
            query = query.filter(
                (Alerta.usuario_id == usuario_id) | (Alerta.usuario_id.is_(None))
            )
        if rol:
            query = query.filter(
                (Alerta.rol_destinatario == rol) | (Alerta.rol_destinatario.is_(None))
            )
        if leida is not None:
            query = query.filter(Alerta.leida == leida)
        if tipo:
            query = query.filter(Alerta.tipo == tipo)

        # Filtrar expiradas
        ahora = datetime.utcnow()
        query = query.filter((Alerta.expira_en.is_(None)) | (Alerta.expira_en >= ahora))

        total = query.count()
        items = query.order_by(Alerta.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Alerta | None:
        return self.db.query(Alerta).filter(Alerta.id == id, Alerta.activo.is_(True)).first()

    def marcar_leida(self, id: str) -> Alerta | None:
        alerta = self.obtener(id)
        if not alerta:
            return None
        alerta.leida = True
        alerta.fecha_lectura = datetime.utcnow()
        self.db.commit()
        self.db.refresh(alerta)
        return alerta

    def marcar_todas_leidas(self, usuario_id: str) -> int:
        ahora = datetime.utcnow()
        resultado = (
            self.db.query(Alerta)
            .filter(
                Alerta.activo.is_(True),
                Alerta.leida.is_(False),
                (Alerta.usuario_id == usuario_id) | (Alerta.usuario_id.is_(None)),
                (Alerta.expira_en.is_(None)) | (Alerta.expira_en >= ahora),
            )
            .update({"leida": True, "fecha_lectura": ahora}, synchronize_session="fetch")
        )
        self.db.commit()
        return resultado

    def contar_no_leidas(self, usuario_id: str, rol: str) -> int:
        ahora = datetime.utcnow()
        return (
            self.db.query(Alerta)
            .filter(
                Alerta.activo.is_(True),
                Alerta.leida.is_(False),
                (Alerta.usuario_id == usuario_id) | (Alerta.usuario_id.is_(None)),
                (Alerta.rol_destinatario == rol) | (Alerta.rol_destinatario.is_(None)),
                (Alerta.expira_en.is_(None)) | (Alerta.expira_en >= ahora),
            )
            .count()
        )
