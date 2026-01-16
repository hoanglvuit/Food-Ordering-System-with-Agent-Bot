from schema import Item, Flavour, ItemCategory
from typing import Iterable, Any
from enum import Enum
from sqlalchemy import create_engine, text
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)


def parse_pg_array(value):
    if not value or value == "{}":
        return []
    if isinstance(value, str):
        return value.strip("{}").split(",")
    return value


# Chỉ lấy một vài feature cần thiết
def get_all_items() -> list[Item]:
    """Lấy tất cả các món ăn có is_active = true"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM item WHERE is_active = true"))
        items = []
        for row in result:
            # Map database row to Item model
            # Note: category and flavour are returned as lists by psycopg2
            item = Item(
                id=row.id,
                title=row.title,
                # description=row.description,
                price=row.price,
                # image_url=row.image_url,
                # is_active=row.is_active,
                discount=row.discount,
                # purchase_count=row.purchase_count,
                category=parse_pg_array(row.category),
                flavour=parse_pg_array(row.flavour),
            )
            items.append(item)
        return items


def get_discount_items() -> list[Item]:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                "SELECT * FROM item WHERE is_active = true AND discount > 0 AND discount IS NOT NULL"
            )
        )
        items = []
        for row in result:
            item = Item(
                id=row.id,
                title=row.title,
                # description=row.description,
                price=row.price,
                # is_active=row.is_active,
                discount=row.discount,
                # purchase_count=row.purchase_count,
                category=parse_pg_array(row.category),
                flavour=parse_pg_array(row.flavour),
            )
            items.append(item)
        return items


def get_item_by_id(item_id: int) -> Item | None:
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM item WHERE id = :id"), {"id": item_id}
        )
        row = result.fetchone()
        if row:
            return Item(
                id=row.id,
                title=row.title,
                # description=row.description,
                price=row.price,
                # is_active=row.is_active,
                discount=row.discount,
                # purchase_count=row.purchase_count,
                category=parse_pg_array(row.category),
                flavour=parse_pg_array(row.flavour),
            )
        return None


def format_items_for_prompt(items: list[Item]) -> str:
    """Format items (pydantic model) để phù hợp với prompt của LLM"""
    lines = ["Menu items:"]
    for item in items:
        discount = f"{int(item.discount * 100)}%" if item.discount else "none"
        lines.extend(
            [
                f"- id: {item.id}",
                f"  title: {item.title}",
                f"  price: {item.price}",
                f"  discount: {discount}%",
                f"  category: {', '.join(item.category)}",
                f"  flavour: {', '.join(item.flavour)}",
                "",
            ]
        )
    return "\n".join(lines)


def format_items_for_intent(items: list[Item]) -> str:
    """Format rút gọn cho việc xác định intent của user (chỉ cần id và tên món)"""
    lines = []
    for item in items:
        lines.append(f"- ID {item.id}: {item.title}")
    return "\n".join(lines)
