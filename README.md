# CocktailDB

CocktailDB is a full-stack cocktail management platform with a public menu experience and an authenticated admin dashboard for managing cocktails, ingredients, and images.

## Highlights

- Full CRUD for cocktails and ingredients
- JWT-based authentication for protected admin actions
- Image upload pipeline with local or Supabase-backed storage
- FastAPI backend with SQLAlchemy models and Pydantic schemas
- React + Vite frontend with a modern dashboard UI
- Docker Compose support for running the full stack locally

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, DaisyUI
- Backend: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- Auth: JWT (PyJWT), password hashing with Passlib
- Database: SQLite (default local) or PostgreSQL
- Image Processing: Pillow
- Optional Storage: Supabase Storage

## Project Structure

```text
CocktailDB/
├─ backend/
│  ├─ app/
│  │  ├─ api/            # FastAPI routes
│  │  ├─ core/           # config, auth, db, image services
│  │  ├─ models/         # SQLAlchemy models
│  │  ├─ schemas/        # Pydantic request/response schemas
│  │  └─ scripts/        # utility scripts (e.g. create_user.py)
│  ├─ uploads/           # local image storage
│  └─ requirements.txt
├─ cocktaildb/           # React frontend
└─ docker-compose.yml
```

## Quick Start (Local Development)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd CocktailDB
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
```

On Windows (PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` in `backend/`:

```env
# Database mode: sqlite or postgres
DB_MODE=sqlite

# SQLite
SQLITE_DATABASE_URL=sqlite:///./cocktail.db

# PostgreSQL (used when DB_MODE=postgres)
# DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname?sslmode=require
# or provide DB_USER / DB_PASSWORD / DB_HOST / DB_PORT / DB_NAME

# Auth
JWT_SECRET_KEY=change_this_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Image storage
IMAGE_STORAGE_BACKEND=local
BACKEND_PUBLIC_BASE_URL=http://127.0.0.1:8000
UPLOADS_DIR=./uploads

# Supabase (required only if IMAGE_STORAGE_BACKEND=supabase)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=cocktails
SUPABASE_STORAGE_FOLDER=cocktails
```

Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend setup

In a new terminal:

```bash
cd cocktaildb
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Run With Docker Compose

From the repository root:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## API Overview

Base path: `/api`

Public endpoints:

- `GET /health`
- `GET /version`
- `GET /info`
- `POST /login`
- `GET /cocktails`
- `GET /cocktails/{cocktail_id}`
- `GET /ingredients/{ingredient_id}`

Protected endpoints (Bearer token required):

- `POST /cocktails`
- `PATCH /cocktails/{cocktail_id}`
- `DELETE /cocktails/{cocktail_id}`
- `POST /cocktails/{cocktail_id}/image`
- `GET /ingredients`
- `POST /ingredients`
- `PATCH /ingredients/{ingredient_id}`
- `DELETE /ingredients/{ingredient_id}`

## Create an Admin/User Account

From `backend/` (with environment configured):

```bash
python app/scripts/create_user.py admin@example.com your_password --admin
```

Create a non-admin user:

```bash
python app/scripts/create_user.py user@example.com your_password
```

## Deployment Notes

- Frontend is configured for Vercel workflows (`cocktaildb/vercel.json`).
- Backend can be deployed via Docker or any FastAPI-compatible host.
- Set production-grade values for `JWT_SECRET_KEY`, CORS origins, and DB credentials.

## License

This project currently has no explicit open-source license. Add a `LICENSE` file if you plan to distribute it publicly.
