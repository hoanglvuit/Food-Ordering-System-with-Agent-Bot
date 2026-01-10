from typing import Optional
from pydantic import BaseModel, ConfigDict


class ShippingConfigBase(BaseModel):
    base_fee: Optional[float] = 1.0
    price_per_km: Optional[float] = 0.5
    is_active: Optional[bool] = True


class ShippingConfigCreate(ShippingConfigBase):
    pass


class ShippingConfigUpdate(ShippingConfigBase):
    pass


class ShippingConfig(ShippingConfigBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
