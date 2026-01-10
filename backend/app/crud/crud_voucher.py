from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.voucher import Voucher
from app.schemas.voucher import VoucherCreate, VoucherUpdate


class CRUDVoucher(CRUDBase[Voucher, VoucherCreate, VoucherUpdate]):
    def get_by_code(self, db: Session, *, code: str) -> Optional[Voucher]:
        return db.query(Voucher).filter(Voucher.code == code).first()


voucher = CRUDVoucher(Voucher)
