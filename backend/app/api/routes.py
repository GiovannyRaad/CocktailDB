
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.cocktail import CocktailRead
from app.models.cocktail import Cocktail
from app.schemas.ingredient import IngredientRead
from app.models.ingredient import Ingredient

router = APIRouter(prefix="/api")


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
        cocktails = db.query(Cocktail).all()
        # Validate that cocktail is a CocktailRead model and return it as list
        return [CocktailRead.model_validate(cocktail) for cocktail in cocktails]
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while fetching cocktails") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while fetching cocktails") from exc


@router.get("/cocktails/{cocktail_id}", response_model=CocktailRead)
def get_cocktail(cocktail_id: int, db: Session = Depends(get_db)) -> CocktailRead:
    try:
        cocktail = db.query(Cocktail).filter(Cocktail.id == cocktail_id).first()
        if not cocktail:
            raise HTTPException(status_code=404, detail="Cocktail not found")
        return CocktailRead.model_validate(cocktail)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Database error while fetching cocktail") from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error while fetching cocktail") from exc

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