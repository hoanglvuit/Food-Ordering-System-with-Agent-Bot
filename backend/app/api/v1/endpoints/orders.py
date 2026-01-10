from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Order])
def read_orders(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve orders.
    User sees their own orders.
    Superuser sees all orders (if no specific filtering logic applied, but crud.get_multi returns all).
    TODO: Filter by user for normal users.
    """
    if current_user.is_superuser:
        orders = crud.order.get_multi(db, skip=skip, limit=limit)
    else:
        # Custom logic to get orders for current user
        # We need to add get_multi_by_owner to CRUDOrder or just filter here
        orders = (
            db.query(models.Order)
            .filter(models.Order.user_id == current_user.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return orders


@router.post("/", response_model=schemas.Order)
def create_order(
    *,
    db: Session = Depends(deps.get_db),
    order_in: schemas.OrderCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new order.
    """

    order = crud.order.create_with_user(db=db, obj_in=order_in, user_id=current_user.id)
    return order
