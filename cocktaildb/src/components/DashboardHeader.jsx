function DashboardHeader({ onOpenAddCocktail, onOpenAddIngredient }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
          CocktailDB
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-wide text-amber-50 sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-amber-100/70 sm:text-base">
          Visualize cocktails and ingredients with management-ready controls.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
        <button
          type="button"
          className="btn btn-sm w-full sm:w-auto"
          onClick={onOpenAddCocktail}
        >
          Add Cocktail
        </button>
        <button
          type="button"
          className="btn btn-sm w-full sm:w-auto"
          onClick={onOpenAddIngredient}
        >
          Add Ingredient
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
