import { motion } from "motion/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AddCocktailModal from "../components/AddCocktailModal";
import CocktailsTable from "../components/CocktailsTable";
import DashboardHeader from "../components/DashboardHeader";
import DashboardStats from "../components/DashboardStats";
import DashboardTabs from "../components/DashboardTabs";
import IngredientsTable from "../components/IngredientsTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

let ingredientRowIdCounter = 0;

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

function createEmptyIngredientRow() {
  ingredientRowIdCounter += 1;

  return {
    row_id: ingredientRowIdCounter,
    ingredient_name: "",
    amount: "1",
    unit: "part",
    note: "",
  };
}

function createEmptyCocktailForm() {
  return {
    name: "",
    image_url: "",
    description: "",
    instructions: "",
    cocktail_ingredients: [createEmptyIngredientRow()],
  };
}

async function getErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
  } catch {
    // Keep fallback if server response is not JSON.
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
  const [isAddCocktailOpen, setIsAddCocktailOpen] = useState(false);
  const [isCreatingCocktail, setIsCreatingCocktail] = useState(false);
  const [newCocktailForm, setNewCocktailForm] = useState(
    createEmptyCocktailForm,
  );

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
      } catch {
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

  function handleNewCocktailFieldChange(field, value) {
    setNewCocktailForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleIngredientFieldChange(index, field, value) {
    setNewCocktailForm((previous) => ({
      ...previous,
      cocktail_ingredients: previous.cocktail_ingredients.map(
        (row, rowIndex) =>
          rowIndex === index ? { ...row, [field]: value } : row,
      ),
    }));
  }

  function handleAddIngredientRow() {
    setNewCocktailForm((previous) => ({
      ...previous,
      cocktail_ingredients: [
        ...previous.cocktail_ingredients,
        createEmptyIngredientRow(),
      ],
    }));
  }

  function handleRemoveIngredientRow(index) {
    setNewCocktailForm((previous) => {
      if (previous.cocktail_ingredients.length === 1) {
        return {
          ...previous,
          cocktail_ingredients: [createEmptyIngredientRow()],
        };
      }

      return {
        ...previous,
        cocktail_ingredients: previous.cocktail_ingredients.filter(
          (_, rowIndex) => rowIndex !== index,
        ),
      };
    });
  }

  function handleCloseAddCocktailModal() {
    setIsAddCocktailOpen(false);
    setNewCocktailForm(createEmptyCocktailForm());
  }

  async function handleCreateCocktail(event) {
    event.preventDefault();

    const normalizedIngredients = newCocktailForm.cocktail_ingredients
      .map((row) => ({
        ingredient_name: row.ingredient_name.trim(),
        amount: row.amount.trim(),
        unit: row.unit.trim(),
        note: row.note.trim() || null,
      }))
      .filter((row) => row.ingredient_name.length > 0);

    if (!newCocktailForm.name.trim()) {
      toast.error("Cocktail name is required.");
      return;
    }

    if (normalizedIngredients.length === 0) {
      toast.error("Add at least one ingredient.");
      return;
    }

    if (
      normalizedIngredients.some(
        (row) => !row.amount.length || !row.unit.length,
      )
    ) {
      toast.error("Each ingredient needs both amount and unit.");
      return;
    }

    const payload = {
      name: newCocktailForm.name.trim(),
      image_url: newCocktailForm.image_url.trim() || null,
      description: newCocktailForm.description.trim() || null,
      instructions: newCocktailForm.instructions.trim() || null,
      cocktail_ingredients: normalizedIngredients,
    };

    try {
      setIsCreatingCocktail(true);

      const response = await fetch(`${API_BASE_URL}/api/cocktails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to create cocktail."),
        );
      }

      await loadDashboardData();
      setActiveTab("cocktails");
      setIsAddCocktailOpen(false);
      setNewCocktailForm(createEmptyCocktailForm());
      toast.success(`Added cocktail: ${payload.name}`);
    } catch (error) {
      toast.error(error.message || "Failed to create cocktail.");
    } finally {
      setIsCreatingCocktail(false);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <DashboardHeader
            onOpenAddCocktail={() => setIsAddCocktailOpen(true)}
          />
        </motion.div>

        <DashboardStats
          cocktailsCount={cocktails.length}
          ingredientsCount={ingredients.length}
        />

        <DashboardTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {activeTab === "cocktails" ? (
          <CocktailsTable
            isLoading={isLoading}
            cocktails={cocktails}
            deletingCocktailId={deletingCocktailId}
            onDeleteCocktail={handleDeleteCocktail}
          />
        ) : (
          <IngredientsTable
            isLoading={isLoading}
            ingredients={ingredients}
            deletingIngredientId={deletingIngredientId}
            onDeleteIngredient={handleDeleteIngredient}
          />
        )}

        <AddCocktailModal
          isOpen={isAddCocktailOpen}
          isCreatingCocktail={isCreatingCocktail}
          form={newCocktailForm}
          onClose={handleCloseAddCocktailModal}
          onSubmit={handleCreateCocktail}
          onMainFieldChange={handleNewCocktailFieldChange}
          onIngredientFieldChange={handleIngredientFieldChange}
          onAddIngredientRow={handleAddIngredientRow}
          onRemoveIngredientRow={handleRemoveIngredientRow}
        />
      </div>
    </main>
  );
}

export default Dashboard;
