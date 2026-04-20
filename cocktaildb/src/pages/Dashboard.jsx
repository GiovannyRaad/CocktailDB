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
    image_file: null,
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

function getAuthHeaders(additionalHeaders = {}) {
  const authToken = localStorage.getItem("auth_token");
  const authTokenType = localStorage.getItem("auth_token_type") ?? "bearer";

  return authToken
    ? {
        ...additionalHeaders,
        Authorization: `${authTokenType} ${authToken}`,
      }
    : additionalHeaders;
}

function handleSessionExpired() {
  toast.error("Your session expired. Please log in again.");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_token_type");
  localStorage.removeItem("auth_user");
  window.location.replace("/login");
}

function Dashboard() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
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

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token");

    if (!authToken) {
      window.location.replace("/login");
      return;
    }

    setIsCheckingAuth(false);
  }, []);

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
      fetch(`${API_BASE_URL}/api/cocktails`, {
        headers: getAuthHeaders(),
      }),
      fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: getAuthHeaders(),
      }),
    ]);

    if (
      cocktailsResponse.status === 401 ||
      ingredientsResponse.status === 401
    ) {
      handleSessionExpired();
      throw new Error("Unauthorized");
    }

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
    if (isCheckingAuth) {
      return;
    }

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
  }, [isCheckingAuth]);

  if (isCheckingAuth) {
    return null;
  }

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
          headers: getAuthHeaders(),
        },
      );

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

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
          headers: getAuthHeaders(),
        },
      );

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

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

    const imageUrl = newCocktailForm.image_url.trim();
    const hasImageFile = Boolean(newCocktailForm.image_file);

    if (!hasImageFile && !imageUrl) {
      toast.error("Add an image upload or paste an image URL.");
      return;
    }

    if (hasImageFile && newCocktailForm.image_file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5MB or less.");
      return;
    }

    const payload = new FormData();
    payload.append("name", newCocktailForm.name.trim());
    payload.append("description", newCocktailForm.description.trim());
    payload.append("instructions", newCocktailForm.instructions.trim());
    payload.append(
      "cocktail_ingredients",
      JSON.stringify(normalizedIngredients),
    );

    if (hasImageFile) {
      payload.append("image", newCocktailForm.image_file);
    } else if (imageUrl) {
      payload.append("image_url", imageUrl);
    }

    try {
      setIsCreatingCocktail(true);

      const response = await fetch(`${API_BASE_URL}/api/cocktails`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: payload,
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Failed to create cocktail."),
        );
      }

      await loadDashboardData();
      setActiveTab("cocktails");
      setIsAddCocktailOpen(false);
      setNewCocktailForm(createEmptyCocktailForm());
      toast.success(`Added cocktail: ${newCocktailForm.name.trim()}`);
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
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

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
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: ingredientName }),
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

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
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: ingredientName }),
        },
      );

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

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
          useImageUpload
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
