from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.voucher import DiscountType


class VoucherBase(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    discount_type: Optional[DiscountType] = DiscountType.FIXED
    discount_value: Optional[float] = None
    min_order_value: Optional[float] = 0
    is_active: Optional[bool] = True


class VoucherCreate(VoucherBase):
    name: str
    code: Optional[str] = None
    discount_type: DiscountType
    discount_value: float


class VoucherUpdate(VoucherBase):
    pass


class Voucher(VoucherBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
