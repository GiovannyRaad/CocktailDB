import { motion } from "motion/react";

import CocktailCard from "../components/CocktailCard";

const MOCK_COCKTAILS = [
  {
    name: "Old Fashioned",
    description: "A bold whiskey classic mellowed with sugar and aromatic bitters.",
    ingredients: ["Bourbon", "Bitters", "Orange Peel"],
  },
  {
    name: "Margarita",
    description: "Bright citrus and tequila balance with a crisp salted edge.",
    ingredients: ["Tequila", "Lime", "Triple Sec"],
  },
  {
    name: "Mojito",
    description: "Cooling mint and rum topped with sparkling freshness.",
    ingredients: ["White Rum", "Mint", "Lime"],
  },
  {
    name: "Negroni",
    description: "A bittersweet aperitif with deep botanical character.",
    ingredients: ["Gin", "Campari", "Vermouth"],
  },
  {
    name: "Whiskey Sour",
    description: "Silky, tart, and warm with a balanced citrus finish.",
    ingredients: ["Whiskey", "Lemon", "Simple Syrup"],
  },
  {
    name: "Daiquiri",
    description: "Elegant and direct: rum, lime, and sugar in perfect harmony.",
    ingredients: ["White Rum", "Lime", "Cane Syrup"],
  },
];

function Menu() {
  return (
    <main
      data-theme="dark"
      className="relative min-h-screen overflow-hidden bg-[#120c0a] text-amber-50"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(248,195,121,0.16),transparent_40%),radial-gradient(circle_at_82%_84%,rgba(138,72,36,0.28),transparent_46%),linear-gradient(135deg,#110b09_0%,#1a110d_45%,#0f0907_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_14px)]" />

      <div className="relative mx-auto min-h-screen w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 text-center sm:mb-12"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">CocktailDB</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight tracking-[0.03em] text-amber-50 sm:text-6xl">
            The Tavern Menu
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-amber-100/75 sm:text-lg">
            Crafted cocktails for the evening
          </p>
          <div className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mb-8 rounded-2xl border border-amber-200/20 bg-[#221712]/70 p-4 shadow-[0_14px_36px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr_auto] md:items-center">
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
              <input type="text" className="grow" placeholder="Search cocktails (coming soon)" disabled />
            </label>

            <div className="flex flex-wrap gap-2">
              {["All", "Classics", "Citrus", "Spirit-Forward"].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  className="btn btn-sm rounded-full border-amber-300/30 bg-[#2d2019]/70 text-xs tracking-wide text-amber-100 hover:bg-[#3a281e]"
                >
                  {pill}
                </button>
              ))}
            </div>

            <select
              className="select select-bordered border-amber-200/25 bg-[#2b1e18]/75 text-sm text-amber-100"
              defaultValue="Sort"
              disabled
            >
              <option disabled>Sort</option>
              <option>A-Z</option>
              <option>Most Popular</option>
              <option>Newest</option>
            </select>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {MOCK_COCKTAILS.map((cocktail, index) => (
            <CocktailCard key={cocktail.name} cocktail={cocktail} index={index} />
          ))}
        </section>
      </div>
    </main>
  );
}

export default Menu;
