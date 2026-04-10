from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

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


def create_db_and_tables() -> None:
    # Create tables for every model registered on Base.metadata.
    Base.metadata.create_all(bind=engine)
