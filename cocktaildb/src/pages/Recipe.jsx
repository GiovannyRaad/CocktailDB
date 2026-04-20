import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function normalizeRecipeCocktail(cocktail) {
  return {
    id: cocktail.id,
    name: cocktail.name ?? "Unknown cocktail",
    imageUrl: cocktail.image_url ?? "",
    description:
      cocktail.description ?? "A house-crafted cocktail from our collection.",
    instructions: cocktail.instructions ?? "No instructions provided.",
    ingredients: Array.isArray(cocktail.cocktail_ingredients)
      ? cocktail.cocktail_ingredients
      : [],
  };
}

function formatIngredientRatio(ingredient) {
  const amount = ingredient?.amount?.trim?.() ?? "";
  const unit = ingredient?.unit?.trim?.() ?? "";
  return [amount, unit].filter(Boolean).join(" ").trim();
}

function Recipe() {
  const cocktailId = useMemo(() => {
    const match = window.location.pathname.match(/^\/recipe\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, []);

  const [cocktail, setCocktail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecipe() {
      try {
        setIsLoading(true);
        setError("");

        if (!cocktailId) {
          throw new Error("Invalid cocktail ID.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/cocktails/${cocktailId}`,
        );
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setCocktail(normalizeRecipeCocktail(data));
        }
      } catch {
        if (isMounted) {
          setError("Unable to load this recipe right now.");
          setCocktail(null);
          toast.error("Could not load recipe.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecipe();
    return () => {
      isMounted = false;
    };
  }, [cocktailId]);

  return (
    <main
      data-theme="dark"
      className="relative min-h-screen overflow-hidden bg-[#120c0a] text-amber-50"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(248,195,121,0.16),transparent_40%),radial-gradient(circle_at_82%_84%,rgba(138,72,36,0.28),transparent_46%),linear-gradient(135deg,#110b09_0%,#1a110d_45%,#0f0907_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_14px)]" />

      <div className="relative mx-auto min-h-screen w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="mb-6">
          <a
            href="/menu"
            className="btn btn-sm border-amber-300/30 bg-[#2d2019]/70 text-amber-100 hover:bg-[#3a281e]"
          >
            Back to Menu
          </a>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="skeleton aspect-[4/3] w-full rounded-2xl bg-amber-100/10" />
            <div className="space-y-3">
              <div className="skeleton h-8 w-2/3 bg-amber-100/10" />
              <div className="skeleton h-4 w-full bg-amber-100/10" />
              <div className="skeleton h-4 w-5/6 bg-amber-100/10" />
            </div>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="alert alert-error border border-red-400/35 bg-[#2a1010]/70 text-red-100">
            <span>{error}</span>
          </div>
        ) : null}

        {!isLoading && !error && cocktail ? (
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-amber-200/20 bg-[#221712]/75 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-sm"
          >
            <figure className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]">
              <img
                src={cocktail.imageUrl}
                alt={`${cocktail.name} cocktail`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/1200x800/png?text=CocktailDB";
                }}
              />
            </figure>

            <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
              <section>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
                  Cocktail Recipe
                </p>
                <h1 className="mt-3 font-serif text-4xl text-amber-50 sm:text-5xl">
                  {cocktail.name}
                </h1>
                <p className="mt-4 text-base leading-8 text-amber-100/80 sm:text-lg">
                  {cocktail.description}
                </p>
              </section>

              <section className="rounded-2xl border border-amber-200/15 bg-[#1c130f]/80 p-4 sm:p-5">
                <h2 className="font-serif text-2xl text-amber-50">
                  Instructions
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-amber-100/80 sm:text-base">
                  {cocktail.instructions}
                </p>
              </section>
            </div>

            <section className="border-t border-amber-200/15 p-5 sm:p-7 lg:p-8">
              <h2 className="font-serif text-2xl text-amber-50">Ingredients</h2>
              <div className="mt-4 space-y-3">
                {cocktail.ingredients.length > 0 ? (
                  cocktail.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="rounded-xl border border-amber-200/10 bg-[#231914]/65 p-3"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="font-medium text-amber-100">
                          {ingredient.ingredient_name}
                        </p>
                        {formatIngredientRatio(ingredient) ? (
                          <p className="text-base font-semibold text-white sm:text-lg">
                            {formatIngredientRatio(ingredient)}
                          </p>
                        ) : null}
                      </div>
                      {ingredient.note ? (
                        <p className="mt-1 text-sm text-amber-100/65">
                          {ingredient.note}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-amber-100/70">
                    No ingredients were listed for this recipe.
                  </p>
                )}
              </div>
            </section>
          </motion.article>
        ) : null}
      </div>
    </main>
  );
}

export default Recipe;
