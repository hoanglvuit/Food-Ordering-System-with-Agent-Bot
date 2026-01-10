from sqlalchemy import Boolean, Column, Integer, String, Text, Float, Enum, ARRAY
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum


class Flavour(str, enum.Enum):
    spicy = "spicy"
    sour = "sour"
    sweet = "sweet"
    salty = "salty"
    bitter = "bitter"


class ItemCategory(str, enum.Enum):
    main_dish = "main_dish"
    dessert = "dessert"
    drink = "drink"
    side = "side"


class Item(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=False)  # VND
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    discount = Column(Float, nullable=True)
    purchase_count = Column(Integer, default=0)

    category = Column(ARRAY(Enum(ItemCategory, name="item_category")), nullable=True)
    flavour = Column(ARRAY(Enum(Flavour, name="item_flavour")), nullable=True)
