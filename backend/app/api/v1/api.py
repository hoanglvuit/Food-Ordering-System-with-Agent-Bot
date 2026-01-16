from fastapi import APIRouter

from app.api.v1.endpoints import (
    login,
    users,
    items,
    orders,
    vouchers,
    shipping,
    chat,
)

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(vouchers.router, prefix="/vouchers", tags=["vouchers"])
api_router.include_router(shipping.router, prefix="/shipping", tags=["shipping"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
