import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.core.config import settings


def create_database():
    try:
        # Connect to default 'postgres' database to create new db
        con = psycopg2.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            dbname="postgres",  # Default DB
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = con.cursor()

        db_name = settings.POSTGRES_DB
        cursor.execute(
            f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'"
        )
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database {db_name} created successfully.")
        else:
            print(f"Database {db_name} already exists.")

        cursor.close()
        con.close()
    except Exception as e:
        print(f"Error creating database: {e}")


if __name__ == "__main__":
    create_database()
