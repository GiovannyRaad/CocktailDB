import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cocktail.db")
BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = os.getenv("UPLOADS_DIR", str(BASE_DIR / "uploads"))
COCKTAIL_UPLOADS_DIR = os.path.join(UPLOADS_DIR, "cocktails")
BACKEND_PUBLIC_BASE_URL = os.getenv(
    "BACKEND_PUBLIC_BASE_URL", "http://127.0.0.1:8000"
)
JWT_SECRET_KEY = os.getenv(
	"JWT_SECRET_KEY",
	"change-me-in-production-with-a-longer-secret-key-please",
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))