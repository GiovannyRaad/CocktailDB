function DashboardStats({ cocktailsCount, ingredientsCount }) {
  return (
    <section className="mb-6 flex flex-wrap gap-3 lg:gap-4">
      <div className="stats h-28 w-28 border border-amber-200/20 bg-[#1b1411]/80 shadow-lg sm:h-32 sm:w-32">
        <div className="stat place-items-center px-3 py-3 text-center">
          <div className="stat-title text-amber-200/65">Cocktails</div>
          <div className="stat-value text-2xl text-amber-50">
            {cocktailsCount}
          </div>
        </div>
      </div>

      <div className="stats h-28 w-28 border border-amber-200/20 bg-[#1b1411]/80 shadow-lg sm:h-32 sm:w-32">
        <div className="stat place-items-center px-3 py-3 text-center">
          <div className="stat-title text-amber-200/65">Ingredients</div>
          <div className="stat-value text-2xl text-amber-50">
            {ingredientsCount}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardStats;
