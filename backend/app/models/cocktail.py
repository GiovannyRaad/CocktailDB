from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.cocktail_ingredient import CocktailIngredient


class Cocktail(Base):
    __tablename__ = "cocktails"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    instructions: Mapped[str | None] = mapped_column(String(2000), nullable=True)

    cocktail_ingredients: Mapped[list["CocktailIngredient"]] = relationship(
        back_populates="cocktail"
    )
