from sqlalchemy import Boolean, Column, Integer, String, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum


class DiscountType(str, enum.Enum):
    PERCENT = "percent"
    FIXED = "fixed"


class Voucher(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_type = Column(Enum(DiscountType), nullable=False)
    discount_value = Column(Float, nullable=False)
    min_order_value = Column(Float, default=0)
    is_active = Column(Boolean, default=True)

    users = relationship("UserVoucher", back_populates="voucher")


class UserVoucher(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    voucher_id = Column(Integer, ForeignKey("voucher.id"), nullable=False)
    is_used = Column(
        Boolean, default=False
    )  # Optional: track if specific instance used if single-use

    user = relationship("User", back_populates="vouchers")
    voucher = relationship("Voucher", back_populates="users")
