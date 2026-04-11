function CocktailsTable({
  isLoading,
  cocktails,
  deletingCocktailId,
  updatingCocktailId,
  isUpdatingCocktail,
  onEditCocktail,
  onDeleteCocktail,
}) {
  return (
    <section className="rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
      <div className="mb-3 flex items-center">
        <h2 className="font-serif text-lg text-amber-50 sm:text-xl">
          Cocktail Records
        </h2>
      </div>

      <div className="space-y-3 sm:hidden">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-amber-200/15 bg-[#231914]/70 p-3"
              >
                <div className="skeleton h-5 w-32" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton h-4 w-full" />
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="skeleton h-8 flex-1" />
                  <div className="skeleton h-8 flex-1" />
                </div>
              </div>
            ))
          : cocktails.map((cocktail) => (
              <article
                key={cocktail.id}
                className="rounded-xl border border-amber-200/15 bg-[#231914]/70 p-3"
              >
                <h3 className="font-semibold text-amber-100">
                  {cocktail.name}
                </h3>
                <p className="mt-1 text-sm text-amber-100/75 line-clamp-2">
                  {cocktail.description}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-amber-200/65">
                  Ingredients: {cocktail.ingredients.length}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm flex-1"
                    disabled={
                      isUpdatingCocktail && updatingCocktailId === cocktail.id
                    }
                    onClick={() => onEditCocktail(cocktail)}
                  >
                    {isUpdatingCocktail && updatingCocktailId === cocktail.id
                      ? "Saving..."
                      : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-error flex-1"
                    disabled={deletingCocktailId === cocktail.id}
                    onClick={() => onDeleteCocktail(cocktail)}
                  >
                    {deletingCocktailId === cocktail.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="table table-zebra table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Ingredients</th>
              <th>Description</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="skeleton h-4 w-24" />
                    </td>
                    <td>
                      <div className="skeleton h-4 w-10" />
                    </td>
                    <td>
                      <div className="skeleton h-4 w-40" />
                    </td>
                    <td>
                      <div className="skeleton ml-auto h-6 w-16" />
                    </td>
                  </tr>
                ))
              : cocktails.map((cocktail) => (
                  <tr key={cocktail.id}>
                    <td className="font-medium text-amber-100">
                      {cocktail.name}
                    </td>
                    <td>{cocktail.ingredients.length}</td>
                    <td className="max-w-72 truncate text-amber-100/75">
                      {cocktail.description}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-xs"
                          disabled={
                            isUpdatingCocktail &&
                            updatingCocktailId === cocktail.id
                          }
                          onClick={() => onEditCocktail(cocktail)}
                        >
                          {isUpdatingCocktail &&
                          updatingCocktailId === cocktail.id
                            ? "Saving..."
                            : "Edit"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-error"
                          disabled={deletingCocktailId === cocktail.id}
                          onClick={() => onDeleteCocktail(cocktail)}
                        >
                          {deletingCocktailId === cocktail.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CocktailsTable;
