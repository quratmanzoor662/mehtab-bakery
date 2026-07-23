from pydantic import BaseModel, Field
from typing import Optional


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2)
    price: int = Field(..., ge=1)
    description: str
    image: str

    min_order: int = 1

    available: bool = True
    stock: int = 0

    featured: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None

    min_order: Optional[int] = None

    available: Optional[bool] = None
    stock: Optional[int] = None

    featured: Optional[bool] = None