function AddCocktailModal({
  isOpen,
  isCreatingCocktail,
  form,
  onClose,
  onSubmit,
  onMainFieldChange,
  onIngredientFieldChange,
  onAddIngredientRow,
  onRemoveIngredientRow,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-amber-300/20 bg-[#19120f] p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-amber-50">Add Cocktail</h3>
            <p className="text-sm text-amber-100/70">
              Create a cocktail and its ingredient list.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            disabled={isCreatingCocktail}
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="form-control w-full">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-amber-200/70">
                Name
              </span>
              <input
                type="text"
                className="input input-bordered w-full"
                value={form.name}
                onChange={(event) =>
                  onMainFieldChange("name", event.target.value)
                }
                placeholder="Smoked Old Fashioned"
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-amber-200/70">
                Image URL
              </span>
              <input
                type="url"
                className="input input-bordered w-full"
                value={form.image_url}
                onChange={(event) =>
                  onMainFieldChange("image_url", event.target.value)
                }
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="form-control w-full">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-amber-200/70">
              Description
            </span>
            <textarea
              className="textarea textarea-bordered min-h-20 w-full"
              value={form.description}
              onChange={(event) =>
                onMainFieldChange("description", event.target.value)
              }
              placeholder="Short menu description"
            />
          </label>

          <label className="form-control w-full">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-amber-200/70">
              Instructions
            </span>
            <textarea
              className="textarea textarea-bordered min-h-24 w-full"
              value={form.instructions}
              onChange={(event) =>
                onMainFieldChange("instructions", event.target.value)
              }
              placeholder="Build or shake instructions"
            />
          </label>

          <div className="rounded-xl border border-amber-300/20 bg-[#241a15]/50 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-serif text-lg text-amber-50">Ingredients</h4>
              <button
                type="button"
                className="btn btn-xs"
                onClick={onAddIngredientRow}
              >
                Add Row
              </button>
            </div>

            <div className="space-y-2">
              {form.cocktail_ingredients.map((row, index) => (
                <div
                  key={row.row_id}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-amber-200/15 p-2 sm:grid-cols-12"
                >
                  <input
                    type="text"
                    className="input input-bordered input-sm sm:col-span-4"
                    placeholder="Ingredient"
                    value={row.ingredient_name}
                    onChange={(event) =>
                      onIngredientFieldChange(
                        index,
                        "ingredient_name",
                        event.target.value,
                      )
                    }
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm sm:col-span-2"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(event) =>
                      onIngredientFieldChange(
                        index,
                        "amount",
                        event.target.value,
                      )
                    }
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm sm:col-span-2"
                    placeholder="Unit"
                    value={row.unit}
                    onChange={(event) =>
                      onIngredientFieldChange(index, "unit", event.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="input input-bordered input-sm sm:col-span-3"
                    placeholder="Note (optional)"
                    value={row.note}
                    onChange={(event) =>
                      onIngredientFieldChange(index, "note", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-error sm:col-span-1"
                    onClick={() => onRemoveIngredientRow(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isCreatingCocktail}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreatingCocktail}
            >
              {isCreatingCocktail ? "Saving..." : "Create Cocktail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCocktailModal;
