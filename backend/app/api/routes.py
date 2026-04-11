
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.cocktail_ingredient import CocktailIngredient
from app.schemas.cocktail import CocktailCreate
from app.schemas.cocktail import CocktailRead
from app.schemas.cocktail import CocktailUpdate
from app.schemas.cocktail_ingredient import CocktailIngredientRead
from app.models.cocktail import Cocktail
from app.schemas.ingredient import IngredientCreate
from app.schemas.ingredient import IngredientRead
from app.schemas.ingredient import IngredientUpdate
from app.models.ingredient import Ingredient

router = APIRouter(prefix="/api")


def _normalize_name(name: str) -> str:
    return name.strip()


def _find_ingredient_by_name_ci(db: Session, ingredient_name: str) -> Ingredient | None:
    return (
        db.query(Ingredient)
        .filter(func.lower(Ingredient.name) == ingredient_name.lower())
        .first()
    )


def _find_cocktail_by_name_ci(db: Session, cocktail_name: str) -> Cocktail | None:
    return (
        db.query(Cocktail)
        .filter(func.lower(Cocktail.name) == cocktail_name.lower())
        .first()
    )


def serialize_cocktail(cocktail: Cocktail) -> CocktailRead:
    return CocktailRead(
        id=cocktail.id,
        name=cocktail.name,
        image_url=cocktail.image_url,
        description=cocktail.description,
        instructions=cocktail.instructions,
        cocktail_ingredients=[
            CocktailIngredientRead(
                id=cocktail_ingredient.id,
                cocktail_id=cocktail_ingredient.cocktail_id,
                ingredient_id=cocktail_ingredient.ingredient_id,
                ingredient_name=cocktail_ingredient.ingredient.name if cocktail_ingredient.ingredient else None,
                amount=cocktail_ingredient.amount,
                unit=cocktail_ingredient.unit,
                note=cocktail_ingredient.note,
            )
            for cocktail_ingredient in cocktail.cocktail_ingredients
        ],
    )


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

@router.get("/version")
def version_check() -> dict[str, str]:
    return {"version": "0.1.0"}

@router.get("/info")
def info() -> dict[str, str]:
    return {"app": "CocktailDB API", "version": "0.1.0"}

@router.get("/cocktails", response_model=list[CocktailRead])
def get_cocktails(db: Session = Depends(get_db)) -> list[CocktailRead]:
    try:
        cocktails = (
            db.query(Cocktail)
            .options(
                selectinload(Cocktail.cocktail_ingredients).selectinload(
                    CocktailIngredient.ingredient
                )
            )
            .all()
        )
        return [serialize_cocktail(cocktail) for cocktail in cocktails]
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while fetching cocktails") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while fetching cocktails") from exc


@router.get("/cocktails/{cocktail_id}", response_model=CocktailRead)
def get_cocktail(cocktail_id: int, db: Session = Depends(get_db)) -> CocktailRead:
    try:
        cocktail = (
            db.query(Cocktail)
            .options(
                selectinload(Cocktail.cocktail_ingredients).selectinload(
                    CocktailIngredient.ingredient
                )
            )
            .filter(Cocktail.id == cocktail_id)
            .first()
        )
        if not cocktail:
            raise HTTPException(status_code=404, detail="Cocktail not found")
        return serialize_cocktail(cocktail)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while fetching cocktail") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while fetching cocktail") from exc


@router.post("/cocktails", response_model=CocktailRead, status_code=201)
def create_cocktail(
    cocktail_data: CocktailCreate, db: Session = Depends(get_db)
) -> CocktailRead:
    try:
        cocktail_name = _normalize_name(cocktail_data.name)
        if not cocktail_name:
            raise HTTPException(status_code=400, detail="Cocktail name cannot be empty")

        existing_cocktail = _find_cocktail_by_name_ci(db, cocktail_name)
        if existing_cocktail:
            raise HTTPException(status_code=409, detail="Cocktail already exists")

        cocktail = Cocktail(
            name=cocktail_name,
            image_url=cocktail_data.image_url,
            description=cocktail_data.description,
            instructions=cocktail_data.instructions,
        )
        db.add(cocktail)
        db.flush()

        for ingredient_data in cocktail_data.cocktail_ingredients:
            ingredient_name = _normalize_name(ingredient_data.ingredient_name)
            if not ingredient_name:
                raise HTTPException(status_code=400, detail="Ingredient name cannot be empty")

            ingredient = _find_ingredient_by_name_ci(db, ingredient_name)
            if not ingredient:
                ingredient = Ingredient(name=ingredient_name)
                db.add(ingredient)
                db.flush()

            cocktail_ingredient = CocktailIngredient(
                cocktail_id=cocktail.id,
                ingredient_id=ingredient.id,
                amount=ingredient_data.amount,
                unit=ingredient_data.unit,
                note=ingredient_data.note,
            )
            db.add(cocktail_ingredient)

        db.commit()

        created_cocktail = (
            db.query(Cocktail)
            .options(
                selectinload(Cocktail.cocktail_ingredients).selectinload(
                    CocktailIngredient.ingredient
                )
            )
            .filter(Cocktail.id == cocktail.id)
            .first()
        )
        if not created_cocktail:
            raise HTTPException(status_code=404, detail="Cocktail not found")

        return serialize_cocktail(created_cocktail)
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cocktail already exists") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while creating cocktail") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while creating cocktail") from exc


@router.delete("/cocktails/{cocktail_id}", status_code=204)
def delete_cocktail(cocktail_id: int, db: Session = Depends(get_db)) -> None:
    try:
        cocktail = db.query(Cocktail).filter(Cocktail.id == cocktail_id).first()
        if not cocktail:
            raise HTTPException(status_code=404, detail="Cocktail not found")

        db.query(CocktailIngredient).filter(
            CocktailIngredient.cocktail_id == cocktail_id
        ).delete(synchronize_session=False)
        db.delete(cocktail)
        db.commit()
        return None
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while deleting cocktail") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while deleting cocktail") from exc


@router.patch("/cocktails/{cocktail_id}", response_model=CocktailRead)
def update_cocktail(
    cocktail_id: int,
    cocktail_data: CocktailUpdate,
    db: Session = Depends(get_db),
):
    try:
        cocktail = db.query(Cocktail).filter(Cocktail.id == cocktail_id).first()

        if not cocktail:
            raise HTTPException(status_code=404, detail="Cocktail not found")

        if cocktail_data.name is not None:
            cocktail_name = _normalize_name(cocktail_data.name)
            if not cocktail_name:
                raise HTTPException(status_code=400, detail="Cocktail name cannot be empty")

            existing_cocktail = _find_cocktail_by_name_ci(db, cocktail_name)
            if existing_cocktail and existing_cocktail.id != cocktail.id:
                raise HTTPException(status_code=409, detail="Cocktail already exists")

            cocktail.name = cocktail_name
        if cocktail_data.image_url is not None:
            cocktail.image_url = cocktail_data.image_url
        if cocktail_data.description is not None:
            cocktail.description = cocktail_data.description
        if cocktail_data.instructions is not None:
            cocktail.instructions = cocktail_data.instructions

        if cocktail_data.cocktail_ingredients is not None:
            db.query(CocktailIngredient).filter(
                CocktailIngredient.cocktail_id == cocktail_id
            ).delete(synchronize_session=False)

            for ingredient_data in cocktail_data.cocktail_ingredients:
                ingredient_name = _normalize_name(ingredient_data.ingredient_name)
                if not ingredient_name:
                    raise HTTPException(status_code=400, detail="Ingredient name cannot be empty")

                ingredient = _find_ingredient_by_name_ci(db, ingredient_name)
                if not ingredient:
                    ingredient = Ingredient(name=ingredient_name)
                    db.add(ingredient)
                    db.flush()

                cocktail_ingredient = CocktailIngredient(
                    cocktail_id=cocktail.id,
                    ingredient_id=ingredient.id,
                    amount=ingredient_data.amount,
                    unit=ingredient_data.unit,
                    note=ingredient_data.note,
                )
                db.add(cocktail_ingredient)

        db.commit()

        updated_cocktail = (
            db.query(Cocktail)
            .options(
                selectinload(Cocktail.cocktail_ingredients).selectinload(
                    CocktailIngredient.ingredient
                )
            )
            .filter(Cocktail.id == cocktail_id)
            .first()
        )
        if not updated_cocktail:
            raise HTTPException(status_code=404, detail="Cocktail not found")

        return serialize_cocktail(updated_cocktail)
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while updating cocktail") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while updating cocktail") from exc

@router.get("/ingredients", response_model=list[IngredientRead])
def get_ingredients(db: Session = Depends(get_db)) -> list[IngredientRead]:
    try:
        ingredients = db.query(Ingredient).all()
        return [IngredientRead.model_validate(ingredient) for ingredient in ingredients]
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while fetching ingredients") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while fetching ingredients") from exc


@router.post("/ingredients", response_model=IngredientRead, status_code=201)
def create_ingredient(
    ingredient_data: IngredientCreate, db: Session = Depends(get_db)
) -> IngredientRead:
    try:
        ingredient_name = _normalize_name(ingredient_data.name)
        if not ingredient_name:
            raise HTTPException(status_code=400, detail="Ingredient name cannot be empty")

        existing_ingredient = _find_ingredient_by_name_ci(db, ingredient_name)
        if existing_ingredient:
            raise HTTPException(status_code=409, detail="Ingredient already exists")

        ingredient = Ingredient(name=ingredient_name)
        db.add(ingredient)
        db.commit()
        db.refresh(ingredient)
        return IngredientRead.model_validate(ingredient)
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ingredient already exists") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while creating ingredient") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while creating ingredient") from exc
    
@router.get("/ingredients/{ingredient_id}", response_model=IngredientRead)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)) -> IngredientRead:
    try:
        ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
        if not ingredient:
            raise HTTPException(status_code=404, detail="Ingredient not found")
        return IngredientRead.model_validate(ingredient)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while fetching ingredient") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while fetching ingredient") from exc


@router.patch("/ingredients/{ingredient_id}", response_model=IngredientRead)
def update_ingredient(
    ingredient_id: int,
    ingredient_data: IngredientUpdate,
    db: Session = Depends(get_db),
):
    try:
        ingredient = db.query(Ingredient).filter(
            Ingredient.id == ingredient_id
        ).first()

        if not ingredient:
            raise HTTPException(status_code=404, detail="Ingredient not found")

        if ingredient_data.name is not None:
            ingredient_name = _normalize_name(ingredient_data.name)
            if not ingredient_name:
                raise HTTPException(status_code=400, detail="Ingredient name cannot be empty")

            existing_ingredient = _find_ingredient_by_name_ci(db, ingredient_name)
            if existing_ingredient and existing_ingredient.id != ingredient.id:
                raise HTTPException(status_code=409, detail="Ingredient already exists")

            ingredient.name = ingredient_name

        db.commit()
        db.refresh(ingredient)

        return IngredientRead.model_validate(ingredient)
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ingredient already exists") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while updating ingredient") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while updating ingredient") from exc



@router.delete("/ingredients/{ingredient_id}", status_code=204)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)) -> None:
    try:
        ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
        if not ingredient:
            raise HTTPException(status_code=404, detail="Ingredient not found")

        db.query(CocktailIngredient).filter(
            CocktailIngredient.ingredient_id == ingredient_id
        ).delete(synchronize_session=False)
        db.delete(ingredient)
        db.commit()
        return None
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while deleting ingredient") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while deleting ingredient") from exc