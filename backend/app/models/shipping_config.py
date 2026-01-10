from sqlalchemy import Column, Integer, Float, Boolean
from app.db.base_class import Base


class ShippingConfig(Base):
    id = Column(Integer, primary_key=True, index=True)
    base_fee = Column(Float, default=1.0)
    price_per_km = Column(Float, default=0.5)
    is_active = Column(Boolean, default=True)
