
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.cocktail_ingredient import CocktailIngredient
from app.schemas.cocktail import CocktailCreate
from app.schemas.cocktail import CocktailRead
from app.schemas.cocktail_ingredient import CocktailIngredientRead
from app.models.cocktail import Cocktail
from app.schemas.ingredient import IngredientCreate
from app.schemas.ingredient import IngredientRead
from app.models.ingredient import Ingredient

router = APIRouter(prefix="/api")


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
        existing_cocktail = (
            db.query(Cocktail)
            .filter(Cocktail.name == cocktail_data.name)
            .first()
        )
        if existing_cocktail:
            raise HTTPException(status_code=409, detail="Cocktail already exists")

        cocktail = Cocktail(
            name=cocktail_data.name,
            image_url=cocktail_data.image_url,
            description=cocktail_data.description,
            instructions=cocktail_data.instructions,
        )
        db.add(cocktail)
        db.flush()

        for ingredient_data in cocktail_data.cocktail_ingredients:
            ingredient_name = ingredient_data.ingredient_name.strip()
            if not ingredient_name:
                raise HTTPException(status_code=400, detail="Ingredient name cannot be empty")

            ingredient = (
                db.query(Ingredient)
                .filter(Ingredient.name == ingredient_name)
                .first()
            )
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
        existing_ingredient = (
            db.query(Ingredient)
            .filter(Ingredient.name == ingredient_data.name)
            .first()
        )
        if existing_ingredient:
            raise HTTPException(status_code=409, detail="Ingredient already exists")

        ingredient = Ingredient(name=ingredient_data.name)
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