function DashboardHeader({ onOpenAddCocktail }) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-sm"
          onClick={onOpenAddCocktail}
        >
          Add Cocktail
        </button>
        <button type="button" className="btn btn-sm btn-disabled">
          Add Ingredient
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
