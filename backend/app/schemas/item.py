from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.item import ItemCategory, Flavour


class ItemBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = True
    discount: Optional[float] = None
    category: Optional[List[ItemCategory]] = []
    flavour: Optional[List[Flavour]] = []


class ItemCreate(ItemBase):
    title: str
    price: int


class ItemUpdate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    purchase_count: int

    model_config = ConfigDict(from_attributes=True)
