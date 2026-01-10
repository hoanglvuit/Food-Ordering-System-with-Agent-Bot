import logging

from app.db.session import SessionLocal
from app.crud.crud_user import user
from app.schemas.user import UserCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db() -> None:
    db = SessionLocal()

    email = "hoang@gmail.com"
    password = "123123"

    current_user = user.get_by_email(db, email=email)
    if not current_user:
        user_in = UserCreate(
            email=email,
            password=password,
            full_name="Initial Admin",
            is_superuser=True,
        )
        user.create(db, obj_in=user_in)
        logger.info(f"Admin user {email} created.")
    else:
        logger.info(f"Admin user {email} already exists.")


if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")
