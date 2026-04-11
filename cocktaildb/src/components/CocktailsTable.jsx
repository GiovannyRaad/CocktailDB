function CocktailsTable({
  isLoading,
  cocktails,
  deletingCocktailId,
  onDeleteCocktail,
}) {
  return (
    <section className="rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-xl text-amber-50">Cocktail Records</h2>
        <button type="button" className="btn btn-xs btn-disabled">
          Edit Selected
        </button>
      </div>

      <div className="overflow-x-auto">
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
                          className="btn btn-xs btn-disabled"
                        >
                          Edit
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
