from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Order(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)

    total_amount = Column(Float, nullable=False)  # subtotal of items
    shipping_fee = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)  # total - discount + shipping

    status = Column(String, default="pending")
    address = Column(String, nullable=False)
    # distance_km = Column(Float, nullable=True) # Removed as per requirement

    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("item.id"), nullable=False)

    quantity = Column(Integer, default=1)
    price_per_unit = Column(Float, nullable=False)  # Snapshot of price

    order = relationship("Order", back_populates="items")
    item = relationship("Item")
