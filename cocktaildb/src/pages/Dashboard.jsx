import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AddCocktailModal from "../components/AddCocktailModal";
import AddIngredientModal from "../components/AddIngredientModal";
import CocktailsTable from "../components/CocktailsTable";
import DashboardHeader from "../components/DashboardHeader";
import DashboardSearchBar from "../components/DashboardSearchBar";
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
    instructions: cocktail.instructions ?? "",
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
  const [isEditCocktailOpen, setIsEditCocktailOpen] = useState(false);
  const [isUpdatingCocktail, setIsUpdatingCocktail] = useState(false);
  const [editingCocktailId, setEditingCocktailId] = useState(null);
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
  const [isEditIngredientOpen, setIsEditIngredientOpen] = useState(false);
  const [isUpdatingIngredient, setIsUpdatingIngredient] = useState(false);
  const [editingIngredientId, setEditingIngredientId] = useState(null);
  const [cocktailSearchQuery, setCocktailSearchQuery] = useState("");
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
  const [newIngredientName, setNewIngredientName] = useState("");
  const [editIngredientName, setEditIngredientName] = useState("");
  const [newCocktailForm, setNewCocktailForm] = useState(
    createEmptyCocktailForm,
  );
  const [editCocktailForm, setEditCocktailForm] = useState(
    createEmptyCocktailForm,
  );

  const filteredCocktails = useMemo(() => {
    const query = cocktailSearchQuery.trim().toLowerCase();
    if (!query) {
      return cocktails;
    }

    return cocktails.filter((cocktail) => {
      const ingredientText = cocktail.ingredients
        .map((ingredient) => ingredient.ingredient_name ?? "")
        .join(" ")
        .toLowerCase();

      return (
        cocktail.name.toLowerCase().includes(query) ||
        cocktail.description.toLowerCase().includes(query) ||
        cocktail.instructions.toLowerCase().includes(query) ||
        ingredientText.includes(query)
      );
    });
  }, [cocktails, cocktailSearchQuery]);

  const filteredIngredients = useMemo(() => {
    const query = ingredientSearchQuery.trim().toLowerCase();
    if (!query) {
      return ingredients;
    }

    return ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(query),
    );
  }, [ingredients, ingredientSearchQuery]);

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

  function toCocktailForm(cocktail) {
    const rows = Array.isArray(cocktail.ingredients)
      ? cocktail.ingredients.map((ingredient) => {
          ingredientRowIdCounter += 1;
          return {
            row_id: ingredientRowIdCounter,
            ingredient_name: ingredient.ingredient_name ?? "",
            amount: ingredient.amount ?? "1",
            unit: ingredient.unit ?? "part",
            note: ingredient.note ?? "",
          };
        })
      : [];

    return {
      name: cocktail.name ?? "",
      image_url: cocktail.imageUrl ?? "",
      description: cocktail.description ?? "",
      instructions: cocktail.instructions ?? "",
      cocktail_ingredients:
        rows.length > 0 ? rows : [createEmptyIngredientRow()],
    };
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

  function handleOpenEditCocktailModal(cocktail) {
    setEditingCocktailId(cocktail.id);
    setEditCocktailForm(toCocktailForm(cocktail));
    setIsEditCocktailOpen(true);
  }

  function handleCloseEditCocktailModal() {
    setIsEditCocktailOpen(false);
    setEditingCocktailId(null);
    setEditCocktailForm(createEmptyCocktailForm());
  }

  function handleEditCocktailFieldChange(field, value) {
    setEditCocktailForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleEditCocktailIngredientFieldChange(index, field, value) {
    setEditCocktailForm((previous) => ({
      ...previous,
      cocktail_ingredients: previous.cocktail_ingredients.map(
        (row, rowIndex) =>
          rowIndex === index ? { ...row, [field]: value } : row,
      ),
    }));
  }

  function handleAddEditCocktailIngredientRow() {
    setEditCocktailForm((previous) => ({
      ...previous,
      cocktail_ingredients: [
        ...previous.cocktail_ingredients,
        createEmptyIngredientRow(),
      ],
    }));
  }

  function handleRemoveEditCocktailIngredientRow(index) {
    setEditCocktailForm((previous) => {
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

  async function handleUpdateCocktail(event) {
    event.preventDefault();

    if (editingCocktailId === null) {
      toast.error("No cocktail selected for edit.");
      return;
    }

    const normalizedIngredients = editCocktailForm.cocktail_ingredients
      .map((row) => ({
        ingredient_name: row.ingredient_name.trim(),
        amount: row.amount.trim(),
        unit: row.unit.trim(),
        note: row.note.trim() || null,
      }))
      .filter((row) => row.ingredient_name.length > 0);

    if (!editCocktailForm.name.trim()) {
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
      name: editCocktailForm.name.trim(),
      image_url: editCocktailForm.image_url.trim() || null,
      description: editCocktailForm.description.trim() || null,
      instructions: editCocktailForm.instructions.trim() || null,
      cocktail_ingredients: normalizedIngredients,
    };

    try {
      setIsUpdatingCocktail(true);

      const response = await fetch(
        `${API_BASE_URL}/api/cocktails/${editingCocktailId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to update cocktail."),
        );
      }

      await loadDashboardData();
      setActiveTab("cocktails");
      setIsEditCocktailOpen(false);
      setEditingCocktailId(null);
      setEditCocktailForm(createEmptyCocktailForm());
      toast.success(`Updated cocktail: ${payload.name}`);
    } catch (error) {
      toast.error(error.message || "Failed to update cocktail.");
    } finally {
      setIsUpdatingCocktail(false);
    }
  }

  function handleCloseAddIngredientModal() {
    setIsAddIngredientOpen(false);
    setNewIngredientName("");
  }

  async function handleCreateIngredient(event) {
    event.preventDefault();

    const ingredientName = newIngredientName.trim();
    if (!ingredientName) {
      toast.error("Ingredient name is required.");
      return;
    }

    try {
      setIsCreatingIngredient(true);

      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: ingredientName }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to create ingredient."),
        );
      }

      await loadDashboardData();
      setActiveTab("ingredients");
      setIsAddIngredientOpen(false);
      setNewIngredientName("");
      toast.success(`Added ingredient: ${ingredientName}`);
    } catch (error) {
      toast.error(error.message || "Failed to create ingredient.");
    } finally {
      setIsCreatingIngredient(false);
    }
  }

  function handleOpenEditIngredientModal(ingredient) {
    setEditingIngredientId(ingredient.id);
    setEditIngredientName(ingredient.name);
    setIsEditIngredientOpen(true);
  }

  function handleCloseEditIngredientModal() {
    setIsEditIngredientOpen(false);
    setEditingIngredientId(null);
    setEditIngredientName("");
  }

  async function handleUpdateIngredient(event) {
    event.preventDefault();

    if (editingIngredientId === null) {
      toast.error("No ingredient selected for edit.");
      return;
    }

    const ingredientName = editIngredientName.trim();
    if (!ingredientName) {
      toast.error("Ingredient name is required.");
      return;
    }

    try {
      setIsUpdatingIngredient(true);

      const response = await fetch(
        `${API_BASE_URL}/api/ingredients/${editingIngredientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: ingredientName }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to update ingredient."),
        );
      }

      await loadDashboardData();
      setActiveTab("ingredients");
      setIsEditIngredientOpen(false);
      setEditingIngredientId(null);
      setEditIngredientName("");
      toast.success(`Updated ingredient: ${ingredientName}`);
    } catch (error) {
      toast.error(error.message || "Failed to update ingredient.");
    } finally {
      setIsUpdatingIngredient(false);
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
            onOpenAddIngredient={() => setIsAddIngredientOpen(true)}
          />
        </motion.div>

        <DashboardStats
          cocktailsCount={cocktails.length}
          ingredientsCount={ingredients.length}
        />

        <DashboardTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        {activeTab === "cocktails" ? (
          <DashboardSearchBar
            value={cocktailSearchQuery}
            onChange={setCocktailSearchQuery}
            placeholder="Search cocktails by name, description, or ingredient"
          />
        ) : (
          <DashboardSearchBar
            value={ingredientSearchQuery}
            onChange={setIngredientSearchQuery}
            placeholder="Search ingredients by name"
          />
        )}

        {activeTab === "cocktails" ? (
          <CocktailsTable
            isLoading={isLoading}
            cocktails={filteredCocktails}
            deletingCocktailId={deletingCocktailId}
            updatingCocktailId={editingCocktailId}
            isUpdatingCocktail={isUpdatingCocktail}
            onEditCocktail={handleOpenEditCocktailModal}
            onDeleteCocktail={handleDeleteCocktail}
          />
        ) : (
          <IngredientsTable
            isLoading={isLoading}
            ingredients={filteredIngredients}
            deletingIngredientId={deletingIngredientId}
            updatingIngredientId={editingIngredientId}
            onEditIngredient={handleOpenEditIngredientModal}
            onDeleteIngredient={handleDeleteIngredient}
          />
        )}

        <AddCocktailModal
          isOpen={isAddCocktailOpen}
          isSavingCocktail={isCreatingCocktail}
          form={newCocktailForm}
          onClose={handleCloseAddCocktailModal}
          onSubmit={handleCreateCocktail}
          onMainFieldChange={handleNewCocktailFieldChange}
          onIngredientFieldChange={handleIngredientFieldChange}
          onAddIngredientRow={handleAddIngredientRow}
          onRemoveIngredientRow={handleRemoveIngredientRow}
        />

        <AddCocktailModal
          isOpen={isEditCocktailOpen}
          isSavingCocktail={isUpdatingCocktail}
          form={editCocktailForm}
          onClose={handleCloseEditCocktailModal}
          onSubmit={handleUpdateCocktail}
          onMainFieldChange={handleEditCocktailFieldChange}
          onIngredientFieldChange={handleEditCocktailIngredientFieldChange}
          onAddIngredientRow={handleAddEditCocktailIngredientRow}
          onRemoveIngredientRow={handleRemoveEditCocktailIngredientRow}
          title="Edit Cocktail"
          subtitle="Update cocktail details and ingredient list."
          submitLabel="Save Changes"
          savingLabel="Saving..."
        />

        <AddIngredientModal
          isOpen={isAddIngredientOpen}
          isSavingIngredient={isCreatingIngredient}
          ingredientName={newIngredientName}
          onChangeName={setNewIngredientName}
          onClose={handleCloseAddIngredientModal}
          onSubmit={handleCreateIngredient}
        />

        <AddIngredientModal
          isOpen={isEditIngredientOpen}
          isSavingIngredient={isUpdatingIngredient}
          ingredientName={editIngredientName}
          onChangeName={setEditIngredientName}
          onClose={handleCloseEditIngredientModal}
          onSubmit={handleUpdateIngredient}
          title="Edit Ingredient"
          subtitle="Update an existing ingredient name."
          submitLabel="Save Changes"
          savingLabel="Saving..."
        />
      </div>
    </main>
  );
}

export default Dashboard;
