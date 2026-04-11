function IngredientsTable({
  isLoading,
  ingredients,
  deletingIngredientId,
  onDeleteIngredient,
}) {
  return (
    <section className="rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-xl text-amber-50">Ingredient Records</h2>
        <button type="button" className="btn btn-xs btn-disabled">
          Edit Selected
        </button>
      </div>

      <div className="overflow-x-auto">
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
                          className="btn btn-xs btn-disabled"
                        >
                          Edit
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
