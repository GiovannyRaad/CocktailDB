import { motion } from "motion/react";

function CocktailCard({ cocktail, index = 0 }) {
  const imageAlt = `${cocktail.name} cocktail`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.12 + index * 0.08,
        opacity: { duration: 0.45 },
        y: { duration: 0.18 },
        scale: { duration: 0.18 },
        ease: "easeOut",
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group card rounded-xl border border-amber-200/20 bg-[#201612]/78 shadow-[0_16px_38px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-shadow duration-200 hover:shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
    >
      <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-amber-300/80 via-amber-500/80 to-amber-200/80" />

      <figure className="relative h-40 overflow-hidden">
        <img
          src={cocktail.imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/640x960/png?text=CocktailDB";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#201612]/90 via-[#201612]/20 to-transparent" />
      </figure>

      <div className="card-body gap-5 p-6">
        <div className="space-y-3">
          <h3 className="font-serif text-2xl tracking-wide text-amber-50">
            {cocktail.name}
          </h3>
          <p className="text-sm leading-7 text-amber-50/75">
            {cocktail.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {cocktail.ingredients.map((ingredient, ingredientIndex) => (
            <span
              key={`${ingredient}-${ingredientIndex}`}
              className="badge badge-outline border-amber-300/45 bg-[#2d201a]/70 px-3 py-3 text-xs tracking-[0.14em] text-amber-100"
            >
              {ingredient}
            </span>
          ))}
        </div>

        <div className="card-actions mt-1 justify-end">
          <button
            type="button"
            className="btn border-none bg-gradient-to-r from-amber-500 to-amber-400 px-5 text-sm font-semibold tracking-wide text-[#24150f] shadow-[0_10px_22px_rgba(191,130,35,0.34)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_14px_34px_rgba(217,154,54,0.45)]"
          >
            View Recipe
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default CocktailCard;
