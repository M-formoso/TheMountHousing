from pydantic import BaseModel
from typing import TypeVar, Generic


T = TypeVar("T")


class PaginatedResponse(BaseModel):
    items: list
    total: int
    skip: int
    limit: int
