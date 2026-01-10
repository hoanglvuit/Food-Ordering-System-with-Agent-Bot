from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.shipping_config import ShippingConfig
from app.schemas.shipping import ShippingConfigCreate, ShippingConfigUpdate


class CRUDShipping(
    CRUDBase[ShippingConfig, ShippingConfigCreate, ShippingConfigUpdate]
):
    def get_current(self, db: Session) -> ShippingConfig:
        """Get the single shipping config. Returns the first one ordered by ID desc."""
        return db.query(ShippingConfig).order_by(ShippingConfig.id.desc()).first()

    def get_or_create_default(self, db: Session) -> ShippingConfig:
        """Get existing config or create default one if none exists."""
        config = self.get_current(db)
        if not config:
            default = ShippingConfigCreate(
                base_fee=30000.0, price_per_km=5000.0, is_active=True
            )
            config = self.create(db, obj_in=default)
        return config


shipping = CRUDShipping(ShippingConfig)
