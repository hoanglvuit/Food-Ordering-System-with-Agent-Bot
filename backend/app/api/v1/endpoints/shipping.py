from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=schemas.ShippingConfig)
def read_shipping_config(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get current shipping config. Public endpoint for cart display.
    Creates default config if none exists.
    """
    config = crud.shipping.get_or_create_default(db)
    return config


@router.put("/", response_model=schemas.ShippingConfig)
def update_shipping_config(
    *,
    db: Session = Depends(deps.get_db),
    config_in: schemas.ShippingConfigUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update shipping config. (Admin only)
    Updates the existing config in database.
    """
    config = crud.shipping.get_or_create_default(db)
    updated_config = crud.shipping.update(db, db_obj=config, obj_in=config_in)
    return updated_config
