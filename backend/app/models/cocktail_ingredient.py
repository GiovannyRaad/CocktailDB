from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CocktailIngredient(Base):
    __tablename__ = "cocktail_ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    cocktail_id: Mapped[int] = mapped_column(ForeignKey("cocktails.id"), nullable=False)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id"), nullable=False)
    amount: Mapped[str] = mapped_column(String(50), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    cocktail = relationship("Cocktail", back_populates="cocktail_ingredients")
    ingredient = relationship("Ingredient", back_populates="cocktail_ingredients")
