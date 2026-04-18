import os
from pathlib import Path
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

def _build_database_url() -> str:
	db_mode = os.getenv("DB_MODE", "sqlite").strip().lower()

	if db_mode == "sqlite":
		return os.getenv("SQLITE_DATABASE_URL", "sqlite:///./cocktail.db")

	if db_mode == "postgres":
		explicit_url = os.getenv("DATABASE_URL")
		if explicit_url:
			return explicit_url

		user = os.getenv("user") or os.getenv("DB_USER")
		password = os.getenv("password") or os.getenv("DB_PASSWORD")
		host = os.getenv("host") or os.getenv("DB_HOST")
		port = os.getenv("port") or os.getenv("DB_PORT")
		dbname = os.getenv("dbname") or os.getenv("DB_NAME")

		if user and password and host and port and dbname:
			quoted_password = quote_plus(password)
			return f"postgresql+psycopg2://{user}:{quoted_password}@{host}:{port}/{dbname}?sslmode=require"

		raise RuntimeError(
			"DB_MODE is set to 'postgres' but PostgreSQL credentials are missing. "
			"Set DATABASE_URL or DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME."
		)

	raise RuntimeError("Invalid DB_MODE. Use 'sqlite' or 'postgres'.")


DATABASE_URL = _build_database_url()
BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = os.getenv("UPLOADS_DIR", str(BASE_DIR / "uploads"))
COCKTAIL_UPLOADS_DIR = os.path.join(UPLOADS_DIR, "cocktails")
BACKEND_PUBLIC_BASE_URL = os.getenv(
    "BACKEND_PUBLIC_BASE_URL", "http://127.0.0.1:8000"
)
JWT_SECRET_KEY = os.getenv(
	"JWT_SECRET_KEY",
	"4f9da87f844c26ec926a5f784edc813dc4cf0d577123a582bb0157a1e0dc2519",
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))