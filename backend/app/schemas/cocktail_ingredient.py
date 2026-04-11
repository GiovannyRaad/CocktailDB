from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class CocktailIngredientBase(BaseModel):
    amount: str
    unit: str
    note: str | None = None


class CocktailIngredientCreate(CocktailIngredientBase):
    cocktail_id: int
    ingredient_id: int


class CocktailIngredientCreateRequest(CocktailIngredientBase):
    ingredient_name: str


class CocktailIngredientRead(CocktailIngredientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cocktail_id: int
    ingredient_id: int
    ingredient_name: str | None = None
