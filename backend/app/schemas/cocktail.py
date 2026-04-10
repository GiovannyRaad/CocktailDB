from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.cocktail_ingredient import CocktailIngredientRead


class CocktailBase(BaseModel):
    name: str
    description: str | None = None
    instructions: str | None = None


class CocktailCreate(CocktailBase):
    pass


class CocktailRead(CocktailBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cocktail_ingredients: list[CocktailIngredientRead] = Field(default_factory=list)
