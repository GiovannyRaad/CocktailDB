function DashboardStats({ cocktailsCount, ingredientsCount }) {
  return (
    <section className="mb-6 flex flex-wrap justify-center gap-3 sm:justify-start lg:gap-4">
      <div className="stats h-24 w-24 border border-amber-200/20 bg-[#1b1411]/80 shadow-lg sm:h-32 sm:w-32">
        <div className="stat place-items-center px-3 py-3 text-center">
          <div className="stat-title text-amber-200/65">Cocktails</div>
          <div className="stat-value text-xl text-amber-50 sm:text-2xl">
            {cocktailsCount}
          </div>
        </div>
      </div>

      <div className="stats h-24 w-24 border border-amber-200/20 bg-[#1b1411]/80 shadow-lg sm:h-32 sm:w-32">
        <div className="stat place-items-center px-3 py-3 text-center">
          <div className="stat-title text-amber-200/65">Ingredients</div>
          <div className="stat-value text-xl text-amber-50 sm:text-2xl">
            {ingredientsCount}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardStats;
