function IngredientsTable({
  isLoading,
  ingredients,
  deletingIngredientId,
  updatingIngredientId,
  onEditIngredient,
  onDeleteIngredient,
}) {
  return (
    <section className="rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
      <div className="mb-3 flex items-center">
        <h2 className="font-serif text-lg text-amber-50 sm:text-xl">
          Ingredient Records
        </h2>
      </div>

      <div className="space-y-3 sm:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-amber-200/15 bg-[#231914]/70 p-3"
              >
                <div className="skeleton h-5 w-28" />
                <div className="mt-2 skeleton h-4 w-20" />
                <div className="mt-3 flex gap-2">
                  <div className="skeleton h-8 flex-1" />
                  <div className="skeleton h-8 flex-1" />
                </div>
              </div>
            ))
          : ingredients.map((ingredient) => (
              <article
                key={ingredient.id}
                className="rounded-xl border border-amber-200/15 bg-[#231914]/70 p-3"
              >
                <h3 className="font-semibold text-amber-100">
                  {ingredient.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-amber-200/65">
                  Usage: {ingredient.usageCount}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm flex-1"
                    disabled={updatingIngredientId === ingredient.id}
                    onClick={() => onEditIngredient(ingredient)}
                  >
                    {updatingIngredientId === ingredient.id
                      ? "Saving..."
                      : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-error flex-1"
                    disabled={deletingIngredientId === ingredient.id}
                    onClick={() => onDeleteIngredient(ingredient)}
                  >
                    {deletingIngredientId === ingredient.id
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
              <th>Usage</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="skeleton h-4 w-24" />
                    </td>
                    <td>
                      <div className="skeleton h-4 w-12" />
                    </td>
                    <td>
                      <div className="skeleton ml-auto h-6 w-16" />
                    </td>
                  </tr>
                ))
              : ingredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <td className="font-medium text-amber-100">
                      {ingredient.name}
                    </td>
                    <td>{ingredient.usageCount}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-xs"
                          disabled={updatingIngredientId === ingredient.id}
                          onClick={() => onEditIngredient(ingredient)}
                        >
                          {updatingIngredientId === ingredient.id
                            ? "Saving..."
                            : "Edit"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-error"
                          disabled={deletingIngredientId === ingredient.id}
                          onClick={() => onDeleteIngredient(ingredient)}
                        >
                          {deletingIngredientId === ingredient.id
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

export default IngredientsTable;
