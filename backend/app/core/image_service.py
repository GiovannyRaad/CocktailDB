from __future__ import annotations

from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.parse import unquote
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image

from app.core.config import BACKEND_PUBLIC_BASE_URL
from app.core.config import COCKTAIL_UPLOADS_DIR
from app.core.config import IMAGE_STORAGE_BACKEND
from app.core.config import SUPABASE_SERVICE_ROLE_KEY
from app.core.config import SUPABASE_STORAGE_BUCKET
from app.core.config import SUPABASE_STORAGE_FOLDER
from app.core.config import SUPABASE_URL


MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_DIMENSION = 800
WEBP_QUALITY = 80


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


def _upload_to_supabase_storage(image_bytes: bytes, filename: str) -> str:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError(
            "Supabase storage is enabled but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing"
        )

    object_path = f"{SUPABASE_STORAGE_FOLDER}/{filename}" if SUPABASE_STORAGE_FOLDER else filename
    encoded_path = quote(object_path, safe="/")
    upload_url = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{encoded_path}"

    request = Request(
        upload_url,
        data=image_bytes,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "image/webp",
            "x-upsert": "false",
        },
    )

    try:
        with urlopen(request):
            pass
    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="ignore")
        raise ValueError(
            f"Failed to upload image to Supabase Storage (HTTP {exc.code}): {error_body or exc.reason}"
        ) from exc
    except Exception as exc:
        raise ValueError(f"Failed to upload image to Supabase Storage: {exc}") from exc

    return (
        f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/"
        f"{SUPABASE_STORAGE_BUCKET}/{encoded_path}"
    )


def _delete_from_supabase_storage(image_url: str) -> None:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError(
            "Supabase storage is enabled but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing"
        )

    public_prefix = (
        f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{SUPABASE_STORAGE_BUCKET}/"
    )
    if not image_url.startswith(public_prefix):
        return

    object_path = image_url[len(public_prefix):]
    if not object_path:
        return

    encoded_path = quote(unquote(object_path), safe="/")
    delete_url = (
        f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/"
        f"{SUPABASE_STORAGE_BUCKET}/{encoded_path}"
    )

    request = Request(
        delete_url,
        method="DELETE",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
        },
    )

    try:
        with urlopen(request):
            pass
    except HTTPError as exc:
        if exc.code == 404:
            return
        error_body = exc.read().decode("utf-8", errors="ignore")
        raise ValueError(
            f"Failed to delete image from Supabase Storage (HTTP {exc.code}): {error_body or exc.reason}"
        ) from exc
    except Exception as exc:
        raise ValueError(f"Failed to delete image from Supabase Storage: {exc}") from exc


def _delete_local_cocktail_image(image_url: str) -> None:
    parsed = urlparse(image_url)
    if not parsed.path.startswith("/uploads/cocktails/"):
        return

    filename = Path(parsed.path).name
    if not filename:
        return

    image_path = Path(COCKTAIL_UPLOADS_DIR) / filename
    if image_path.exists() and image_path.is_file():
        image_path.unlink()


def delete_cocktail_image(image_url: str | None) -> None:
    if not image_url:
        return

    if IMAGE_STORAGE_BACKEND == "supabase":
        _delete_from_supabase_storage(image_url)
        return

    _delete_local_cocktail_image(image_url)


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

    filename = f"{uuid4().hex}.webp"

    output_buffer = BytesIO()
    image.save(
        output_buffer,
        format="WEBP",
        quality=WEBP_QUALITY,
        optimize=True,
        method=6,
    )
    output_bytes = output_buffer.getvalue()

    if IMAGE_STORAGE_BACKEND == "supabase":
        return _upload_to_supabase_storage(output_bytes, filename)

    ensure_upload_directories()
    image_path = Path(COCKTAIL_UPLOADS_DIR) / filename
    image_path.write_bytes(output_bytes)
    return f"{BACKEND_PUBLIC_BASE_URL.rstrip('/')}/uploads/cocktails/{filename}"