import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
sys.path.append(backend_dir)

from app.agent.data import get_user_name
from app.db.session import SessionLocal
from sqlalchemy import text


def test_get_user_name():
    print("Testing get_user_name...")

    # We need a user ID. Let's try to find one in the DB or use 1.
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT id, full_name, email FROM user LIMIT 1"))
        user = result.fetchone()
        if user:
            print(
                f"Found user in DB: ID={user.id}, Name={user.full_name}, Email={user.email}"
            )
            name = get_user_name(user.id)
            print(f"get_user_name({user.id}) returned: '{name}'")

            expected = user.full_name if user.full_name else user.email.split("@")[0]
            if name == expected:
                print("SUCCESS: Name matches expected value.")
            else:
                print(f"FAILURE: Expected '{expected}', got '{name}'")
        else:
            print("WARNING: No users found in database to test with.")

        # Test non-existent user
        print("\nTesting non-existent user...")
        name_unknown = get_user_name(999999)
        print(f"get_user_name(999999) returned: '{name_unknown}'")
        if name_unknown == "Bạn":
            print("SUCCESS: Default name returned for unknown user.")
        else:
            print(f"FAILURE: Expected 'Bạn', got '{name_unknown}'")

    finally:
        db.close()


if __name__ == "__main__":
    test_get_user_name()
