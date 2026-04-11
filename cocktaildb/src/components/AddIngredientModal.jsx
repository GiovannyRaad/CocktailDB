function AddIngredientModal({
  isOpen,
  isSavingIngredient,
  ingredientName,
  onChangeName,
  onClose,
  onSubmit,
  title = "Add Ingredient",
  subtitle = "Create a new ingredient for your cocktail library.",
  submitLabel = "Create Ingredient",
  savingLabel = "Saving...",
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 p-3 sm:items-center sm:p-4">
      <div className="my-2 w-full max-w-lg rounded-2xl border border-amber-300/20 bg-[#19120f] p-4 shadow-2xl sm:my-0 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-amber-50 sm:text-2xl">
              {title}
            </h3>
            <p className="text-sm text-amber-100/70">{subtitle}</p>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            disabled={isSavingIngredient}
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="form-control w-full">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-amber-200/70">
              Ingredient Name
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={ingredientName}
              onChange={(event) => onChangeName(event.target.value)}
              placeholder="Lemon"
              required
              autoFocus
            />
          </label>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn w-full sm:w-auto"
              onClick={onClose}
              disabled={isSavingIngredient}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto"
              disabled={isSavingIngredient}
            >
              {isSavingIngredient ? savingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddIngredientModal;
