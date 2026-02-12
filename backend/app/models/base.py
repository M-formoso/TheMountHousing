from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class BaseModel(Base):
    __abstract__ = True

    id = Column(String(36), primary_key=True, index=True)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
