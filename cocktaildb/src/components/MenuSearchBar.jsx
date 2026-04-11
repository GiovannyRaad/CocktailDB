function MenuSearchBar({
  searchQuery,
  onSearchChange,
  onOpenFilter,
  activeFilterCount,
}) {
  return (
    <section className="mb-8 rounded-2xl border border-amber-200/20 bg-[#221712]/70 p-4 shadow-[0_14px_36px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="input input-bordered flex items-center gap-2 border-amber-200/25 bg-[#2b1e18]/75 text-amber-50 placeholder:text-amber-100/35">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-amber-200/70"
            aria-hidden="true"
          >
            <path d="M21 21l-4.35-4.35" />
            <circle cx="11" cy="11" r="6" />
          </svg>
          <input
            type="text"
            className="grow"
            placeholder="Search cocktails"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn border-amber-300/30 bg-[#2d2019]/70 text-amber-100 hover:bg-[#3a281e]"
          onClick={onOpenFilter}
        >
          Filter Ingredients
          {activeFilterCount > 0 ? (
            <span className="badge badge-sm border-amber-300/30 bg-amber-200/15 text-amber-100">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>
    </section>
  );
}

export default MenuSearchBar;
