from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.cocktail_ingredient import CocktailIngredientRead


class IngredientBase(BaseModel):
    name: str


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: str | None = None


class IngredientRead(IngredientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cocktail_ingredients: list[CocktailIngredientRead] = Field(default_factory=list)
