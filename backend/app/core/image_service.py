from __future__ import annotations

from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image

from app.core.config import BACKEND_PUBLIC_BASE_URL
from app.core.config import COCKTAIL_UPLOADS_DIR


MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_DIMENSION = 800


def ensure_upload_directories() -> None:
    Path(COCKTAIL_UPLOADS_DIR).mkdir(parents=True, exist_ok=True)


def _center_square_crop(image: Image.Image) -> Image.Image:
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    right = left + side
    bottom = top + side
    return image.crop((left, top, right, bottom))


def process_and_store_cocktail_image(upload: UploadFile) -> str:
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise ValueError("Uploaded file must be an image")

    image_bytes = upload.file.read()
    if len(image_bytes) > MAX_UPLOAD_SIZE_BYTES:
        raise ValueError("Image size must be 5MB or less")

    try:
        image = Image.open(BytesIO(image_bytes))
    except Exception as exc:
        raise ValueError("Invalid image file") from exc

    image = _center_square_crop(image).convert("RGB")

    if image.width > MAX_IMAGE_DIMENSION or image.height > MAX_IMAGE_DIMENSION:
        image = image.resize(
            (MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION),
            Image.Resampling.LANCZOS,
        )

    ensure_upload_directories()
    filename = f"{uuid4().hex}.jpg"
    image_path = Path(COCKTAIL_UPLOADS_DIR) / filename
    image.save(image_path, format="JPEG", quality=90, optimize=True)

    return f"{BACKEND_PUBLIC_BASE_URL.rstrip('/')}/uploads/cocktails/{filename}"