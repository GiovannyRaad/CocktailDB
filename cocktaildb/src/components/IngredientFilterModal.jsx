function IngredientFilterModal({
  isOpen,
  ingredients,
  selectedIngredients,
  onToggleIngredient,
  onClear,
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 p-3 sm:items-center sm:p-4">
      <div className="my-2 w-full max-w-xl rounded-2xl border border-amber-300/20 bg-[#19120f] p-4 shadow-2xl sm:my-0 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-amber-50 sm:text-2xl">
              Filter By Ingredients
            </h3>
            <p className="text-sm text-amber-100/70">
              Select ingredients. Cocktails must contain all selected items.
            </p>
          </div>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto overflow-x-hidden rounded-xl border border-amber-300/20 bg-[#241a15]/50 p-3 sm:p-4">
          {ingredients.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ingredients.map((ingredient) => (
                <label
                  key={ingredient}
                  className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-amber-200/10 bg-[#2a1e18]/35 p-3 hover:bg-[#2b1f18]/70"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm mt-0.5 shrink-0 border-amber-300/40"
                    checked={selectedIngredients.includes(ingredient)}
                    onChange={() => onToggleIngredient(ingredient)}
                  />
                  <span className="text-sm leading-relaxed text-amber-100 break-words">
                    {ingredient}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-100/70">
              No ingredients available to filter yet.
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn w-full sm:w-auto"
            onClick={onClear}
          >
            Clear Filters
          </button>
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default IngredientFilterModal;
