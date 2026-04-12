from __future__ import annotations

import argparse
from pathlib import Path
import sys

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[2]))

import app.models
from app.core.auth import hash_password
from app.core.database import Base
from app.core.database import SessionLocal
from app.core.database import engine
from app.models.user import User


def create_user(email: str, password: str, is_admin: bool) -> User:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError(f"User with email '{email}' already exists")

        user = User(
            email=email,
            password=hash_password(password),
            is_admin=is_admin,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a new user in the users table.")
    parser.add_argument("email", help="User email address")
    parser.add_argument("password", help="User password to hash before storing")
    parser.add_argument(
        "--admin",
        action="store_true",
        help="Mark the user as an administrator",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        user = create_user(args.email, args.password, args.admin)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Failed to create user: {exc}", file=sys.stderr)
        return 1

    print(
        f"Created user id={user.id} email={user.email} is_admin={user.is_admin}",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())