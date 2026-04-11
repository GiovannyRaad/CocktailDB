import { motion } from "motion/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function normalizeCocktail(cocktail) {
  return {
    id: cocktail.id,
    name: cocktail.name ?? "Unknown cocktail",
    imageUrl: cocktail.image_url ?? "",
    description: cocktail.description ?? "No description.",
    ingredients: Array.isArray(cocktail.cocktail_ingredients)
      ? cocktail.cocktail_ingredients
      : [],
  };
}

function normalizeIngredient(ingredient) {
  return {
    id: ingredient.id,
    name: ingredient.name ?? "Unknown ingredient",
    usageCount: Array.isArray(ingredient.cocktail_ingredients)
      ? ingredient.cocktail_ingredients.length
      : 0,
  };
}

async function getErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
  } catch {
    // Keep the fallback message if the server response is not JSON.
  }

  return fallbackMessage;
}

function Dashboard() {
  const [cocktails, setCocktails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cocktails");
  const [deletingCocktailId, setDeletingCocktailId] = useState(null);
  const [deletingIngredientId, setDeletingIngredientId] = useState(null);

  async function loadDashboardData() {
    const [cocktailsResponse, ingredientsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/cocktails`),
      fetch(`${API_BASE_URL}/api/ingredients`),
    ]);

    if (!cocktailsResponse.ok || !ingredientsResponse.ok) {
      throw new Error("Could not fetch dashboard data");
    }

    const [cocktailsData, ingredientsData] = await Promise.all([
      cocktailsResponse.json(),
      ingredientsResponse.json(),
    ]);

    setCocktails(
      Array.isArray(cocktailsData) ? cocktailsData.map(normalizeCocktail) : [],
    );
    setIngredients(
      Array.isArray(ingredientsData)
        ? ingredientsData.map(normalizeIngredient)
        : [],
    );
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboardData() {
      try {
        setIsLoading(true);

        await loadDashboardData();

        if (!isMounted) {
          return;
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load dashboard data.");
          setCocktails([]);
          setIngredients([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDeleteCocktail(cocktail) {
    const isConfirmed = window.confirm(
      `Delete cocktail "${cocktail.name}"? This action cannot be undone.`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingCocktailId(cocktail.id);

      const response = await fetch(
        `${API_BASE_URL}/api/cocktails/${cocktail.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to delete cocktail."),
        );
      }

      await loadDashboardData();
      toast.success(`Deleted cocktail: ${cocktail.name}`);
    } catch (error) {
      toast.error(error.message || "Failed to delete cocktail.");
    } finally {
      setDeletingCocktailId(null);
    }
  }

  async function handleDeleteIngredient(ingredient) {
    const isConfirmed = window.confirm(
      `Delete ingredient "${ingredient.name}"? This action cannot be undone.`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingIngredientId(ingredient.id);

      const response = await fetch(
        `${API_BASE_URL}/api/ingredients/${ingredient.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to delete ingredient."),
        );
      }

      await loadDashboardData();
      toast.success(`Deleted ingredient: ${ingredient.name}`);
    } catch (error) {
      toast.error(error.message || "Failed to delete ingredient.");
    } finally {
      setDeletingIngredientId(null);
    }
  }

  return (
    <main
      data-theme="dark"
      className="relative min-h-screen overflow-hidden bg-[#0f0b09] text-amber-50"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(245,183,99,0.16),transparent_42%),radial-gradient(circle_at_80%_90%,rgba(124,71,34,0.24),transparent_44%),linear-gradient(140deg,#120c09_0%,#19120f_45%,#100a08_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_12px)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
              CocktailDB
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-wide text-amber-50 sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-amber-100/70 sm:text-base">
              Visualize cocktails and ingredients with management-ready
              controls.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm btn-disabled">
              Add Cocktail
            </button>
            <button type="button" className="btn btn-sm btn-disabled">
              Add Ingredient
            </button>
          </div>
        </motion.header>

        <section className="mb-6 flex flex-wrap gap-3 lg:gap-4">
          <div className="stats h-28 w-28 border border-amber-200/20 bg-[#1b1411]/80 shadow-lg sm:h-32 sm:w-32">
            <div className="stat place-items-center px-3 py-3 text-center">
              <div className="stat-title text-amber-200/65">Cocktails</div>
              <div className="stat-value text-2xl text-amber-50">
                {cocktails.length}
              </div>
            </div>
          </div>

          <div className="stats h-28 w-28 border border-amber-200/20 bg-[#1b1411]/80 shadow-lg sm:h-32 sm:w-32">
            <div className="stat place-items-center px-3 py-3 text-center">
              <div className="stat-title text-amber-200/65">Ingredients</div>
              <div className="stat-value text-2xl text-amber-50">
                {ingredients.length}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
          <div
            role="tablist"
            className="inline-flex rounded-xl border border-amber-300/30 bg-[#2a1f18]/80 p-1"
          >
            <button
              type="button"
              role="tab"
              className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition ${
                activeTab === "cocktails"
                  ? "bg-amber-300 text-[#2a1b11] shadow"
                  : "text-amber-100/70 hover:bg-[#3a2a22] hover:text-amber-50"
              }`}
              onClick={() => setActiveTab("cocktails")}
            >
              Cocktails
            </button>
            <button
              type="button"
              role="tab"
              className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition ${
                activeTab === "ingredients"
                  ? "bg-amber-300 text-[#2a1b11] shadow"
                  : "text-amber-100/70 hover:bg-[#3a2a22] hover:text-amber-50"
              }`}
              onClick={() => setActiveTab("ingredients")}
            >
              Ingredients
            </button>
          </div>
        </section>

        {activeTab === "cocktails" ? (
          <section className="rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl text-amber-50">
                Cocktail Records
              </h2>
              <button type="button" className="btn btn-xs btn-disabled">
                Edit Selected
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Ingredients</th>
                    <th>Description</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          <td>
                            <div className="skeleton h-4 w-24" />
                          </td>
                          <td>
                            <div className="skeleton h-4 w-10" />
                          </td>
                          <td>
                            <div className="skeleton h-4 w-40" />
                          </td>
                          <td>
                            <div className="skeleton ml-auto h-6 w-16" />
                          </td>
                        </tr>
                      ))
                    : cocktails.map((cocktail) => (
                        <tr key={cocktail.id}>
                          <td className="font-medium text-amber-100">
                            {cocktail.name}
                          </td>
                          <td>{cocktail.ingredients.length}</td>
                          <td className="max-w-72 truncate text-amber-100/75">
                            {cocktail.description}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="btn btn-xs btn-disabled"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-xs btn-error"
                                disabled={deletingCocktailId === cocktail.id}
                                onClick={() => handleDeleteCocktail(cocktail)}
                              >
                                {deletingCocktailId === cocktail.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl text-amber-50">
                Ingredient Records
              </h2>
              <button type="button" className="btn btn-xs btn-disabled">
                Edit Selected
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Usage</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <tr key={index}>
                          <td>
                            <div className="skeleton h-4 w-24" />
                          </td>
                          <td>
                            <div className="skeleton h-4 w-12" />
                          </td>
                          <td>
                            <div className="skeleton ml-auto h-6 w-16" />
                          </td>
                        </tr>
                      ))
                    : ingredients.map((ingredient) => (
                        <tr key={ingredient.id}>
                          <td className="font-medium text-amber-100">
                            {ingredient.name}
                          </td>
                          <td>{ingredient.usageCount}</td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="btn btn-xs btn-disabled"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-xs btn-error"
                                disabled={
                                  deletingIngredientId === ingredient.id
                                }
                                onClick={() =>
                                  handleDeleteIngredient(ingredient)
                                }
                              >
                                {deletingIngredientId === ingredient.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
