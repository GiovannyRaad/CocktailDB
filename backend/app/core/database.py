from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from urllib.parse import quote_plus

from app.core.config import DATABASE_URL


class Base(DeclarativeBase):
    # Base class for all SQLAlchemy models in this app.
    pass


# Create the database engine once and reuse it across sessions.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

# Factory for database sessions used by requests and other services.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    # Provide a session and always close it after use.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> None:
    # Fail fast if the database cannot be reached.
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except OperationalError as exc:
        raise ConnectionError("Could not connect to the database") from exc
    except SQLAlchemyError as exc:
        raise ConnectionError("Database connection check failed") from exc


def get_database_target() -> str:
    # Return a safe description of the DB target without leaking credentials.
    try:
        url = make_url(DATABASE_URL)
    except Exception:
        return "unknown database target"

    if url.drivername.startswith("sqlite"):
        return f"{url.drivername}:///{url.database or ':memory:'}"

    host = url.host or "unknown-host"
    port = f":{url.port}" if url.port else ""
    database = f"/{url.database}" if url.database else ""
    return f"{url.drivername}://{host}{port}{database}"


def _placeholder_image_url(cocktail_name: str) -> str:
    # Keep placeholder URLs deterministic so each cocktail keeps the same image text.
    return f"https://placehold.co/640x960/png?text={quote_plus(cocktail_name)}"


def backfill_cocktail_image_urls() -> None:
    # Fill missing image URLs so frontend cards always have an image.
    from app.models.cocktail import Cocktail

    db = SessionLocal()
    try:
        cocktails = (
            db.query(Cocktail)
            .filter((Cocktail.image_url.is_(None)) | (Cocktail.image_url == ""))
            .all()
        )

        for cocktail in cocktails:
            cocktail.image_url = _placeholder_image_url(cocktail.name)

        if cocktails:
            db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise RuntimeError("Failed to backfill cocktail image URLs") from exc
    finally:
        db.close()


def create_db_and_tables() -> None:
    # Create tables for every model registered on Base.metadata.
    check_database_connection()
    Base.metadata.create_all(bind=engine)
    backfill_cocktail_image_urls()
