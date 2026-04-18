from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as api_router
from app.core.config import UPLOADS_DIR
from app.core.database import check_database_connection
from app.core.database import create_db_and_tables
from app.core.database import get_database_target
from app.core.image_service import ensure_upload_directories
import app.models


logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Database target: %s", get_database_target())
    try:
        check_database_connection()
        logger.info("Database ping succeeded")
        ensure_upload_directories()
        create_db_and_tables()
    except ConnectionError as exc:
        logger.error("Database ping failed: %s", exc)
        raise RuntimeError("Unable to start CocktailDB API because the database is unavailable") from exc
    yield


app = FastAPI(title="CocktailDB API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ensure_upload_directories()
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.include_router(api_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "CocktailDB API is running"}
