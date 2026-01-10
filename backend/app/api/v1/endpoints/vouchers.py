import random
import string
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Voucher])
def read_vouchers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(
        deps.get_current_user
    ),  # Allow all logged-in users to read active vouchers
) -> Any:
    """
    Retrieve vouchers. All users see active vouchers, admin sees all.
    """
    if current_user.is_superuser:
        vouchers = crud.voucher.get_multi(db, skip=skip, limit=limit)
    else:
        vouchers = (
            db.query(models.Voucher)
            .filter(models.Voucher.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return vouchers


@router.post("/", response_model=schemas.Voucher)
def create_voucher(
    *,
    db: Session = Depends(deps.get_db),
    voucher_in: schemas.VoucherCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new voucher. (Admin only)
    Vouchers created by admin are available to all users.
    """
    if not voucher_in.code:
        # Generate random code: e.g., VOUCH-XXXX
        chars = string.ascii_uppercase + string.digits
        random_str = "".join(random.choice(chars) for _ in range(6))
        voucher_in.code = f"VOUCH-{random_str}"

    voucher = crud.voucher.create(db, obj_in=voucher_in)
    return voucher


@router.delete("/{voucher_id}", response_model=schemas.Voucher)
def delete_voucher(
    *,
    db: Session = Depends(deps.get_db),
    voucher_id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a voucher. (Admin only)
    """
    voucher = crud.voucher.get(db, id=voucher_id)
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")
    voucher = crud.voucher.remove(db, id=voucher_id)
    return voucher
