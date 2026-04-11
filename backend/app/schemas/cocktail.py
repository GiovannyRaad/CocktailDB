from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.cocktail_ingredient import CocktailIngredientCreateRequest
from app.schemas.cocktail_ingredient import CocktailIngredientRead


class CocktailBase(BaseModel):
    name: str
    image_url: str | None = None
    description: str | None = None
    instructions: str | None = None


class CocktailCreate(CocktailBase):
    cocktail_ingredients: list[CocktailIngredientCreateRequest] = Field(default_factory=list)


class CocktailUpdate(BaseModel):
    name: str | None = None
    image_url: str | None = None
    description: str | None = None
    instructions: str | None = None
    cocktail_ingredients: list[CocktailIngredientCreateRequest] | None = None


class CocktailRead(CocktailBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cocktail_ingredients: list[CocktailIngredientRead] = Field(default_factory=list)
