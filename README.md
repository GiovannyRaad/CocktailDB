# CocktailDB

A modern full-stack cocktail recipe platform built with **React**, **FastAPI**, and **PostgreSQL**.
Browse curated cocktails, explore ingredients, and manage recipes through a protected admin dashboard.

---

## Features

### Public Website

- Browse cocktail collection
- Responsive modern UI
- Cocktail cards with images
- Recipe details
- Ingredient lists with measurements
- Search and filtering system

### Admin Dashboard

- Secure login authentication
- Add new cocktails
- Edit existing cocktails
- Delete cocktails
- Manage ingredients
- Upload cocktail images

### Backend API

- RESTful API with FastAPI
- PostgreSQL database
- SQLAlchemy ORM
- JWT authentication
- Image upload integration
- Structured schema validation with Pydantic

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router

### Backend

- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database

- PostgreSQL

### Storage

- Supabase Storage

---

## Project Structure

```text
frontend/
backend/

backend/app/
  models/
  schemas/
  routes/
  core/
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cocktaildb
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env`

```env
DATABASE_URL=
SECRET_KEY=
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_BUCKET=
```

Run server:

```bash
uvicorn app.main:app --reload
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

```text
GET    /api/cocktails
GET    /api/ingredients

POST   /api/auth/login

POST   /api/cocktails
PATCH  /api/cocktails/{id}
DELETE /api/cocktails/{id}

POST   /api/upload-image
```

---

## Deployment

Planned production setup:

```text
Frontend: Vercel / Render
Backend: Render / Docker VPS
Database: Supabase PostgreSQL
Storage: Supabase Storage
```

---

## Future Improvements

- Favorites system
- Categories & tags
- Better search
- Cocktail ratings
- User accounts
- Dark / light themes
- Analytics dashboard

---

## Author

Built by Gio.

---

## License

Personal project.
