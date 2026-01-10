from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.item import Item


class OrderItemBase(BaseModel):
    item_id: int
    quantity: int = 1


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: int
    order_id: int
    price_per_unit: float
    item: Optional[Item] = None

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    address: Optional[str] = None


class OrderCreate(OrderBase):
    address: str
    items: List[OrderItemCreate]
    voucher_code: Optional[str] = None


class OrderUpdate(OrderBase):
    status: Optional[str] = None


class Order(OrderBase):
    id: int
    user_id: int
    total_amount: float
    shipping_fee: float
    discount_amount: float
    final_amount: float
    status: str
    created_at: datetime
    items: List[OrderItem] = []

    model_config = ConfigDict(from_attributes=True)
