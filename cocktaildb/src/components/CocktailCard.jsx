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
      className="group card overflow-hidden rounded-none border border-white/10 bg-[#1a120f]/82 shadow-[0_14px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-shadow duration-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
    >
      <figure className="relative aspect-square w-full overflow-hidden">
        <img
          src={cocktail.imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/640x960/png?text=CocktailDB";
          }}
        />
        <span className="pointer-events-none absolute inset-0 border-2 border-amber-200 opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-active:opacity-100 group-hover:shadow-[inset_0_0_0_2px_rgba(253,224,71,1),0_0_24px_rgba(251,191,36,0.9)] group-active:shadow-[inset_0_0_0_3px_rgba(254,240,138,1),0_0_34px_rgba(251,191,36,1)]" />
      </figure>

      <div className="card-body gap-3 p-3 sm:p-4">
        <h3 className="font-serif text-base tracking-wide text-amber-50 sm:text-lg">
          {cocktail.name}
        </h3>

        <p className="line-clamp-3 text-xs leading-5 text-amber-50/75 sm:text-sm sm:leading-6">
          {cocktail.description}
        </p>

        <div className="card-actions mt-1 justify-end">
          <a
            href={cocktail.id ? `/recipe/${cocktail.id}` : "/menu"}
            className="btn btn-sm border-none bg-amber-500 px-4 text-xs font-semibold tracking-wide text-[#24150f] transition duration-300 hover:scale-[1.02] hover:bg-amber-400"
          >
            View Recipe
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default CocktailCard;
