"use client";

import CustomerLinkCard from "@/components/CustomerLinkCard";
import { useEffect, useMemo, useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface AdminProduct {
  itemId: number;
  sku: string;
  rivhitName: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
}

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  async function loadCategories() {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();
    if (response.ok) {
      setCategories(data.categories ?? []);
    }
  }

  async function loadProducts() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/products");
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "שגיאה בטעינת מוצרים מ-Rivhit");
      setProducts([]);
    } else {
      setProducts(data.products ?? []);
    }

    setLoading(false);
  }

  async function loadAll() {
    await Promise.all([loadCategories(), loadProducts()]);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function addCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!newCategory.trim()) return;

    setMessage("");
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "שגיאה בהוספת קטגוריה");
      return;
    }

    setNewCategory("");
    setMessage(`הקטגוריה "${data.category.name}" נוספה`);
    await loadCategories();
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`למחוק את הקטגוריה "${name}"?`)) return;

    const response = await fetch(`/api/admin/categories?id=${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setMessage(`הקטגוריה "${name}" נמחקה`);
      await loadAll();
    }
  }

  async function saveProduct(product: AdminProduct) {
    setSavingId(product.itemId);
    setMessage("");

    const response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: product.itemId,
        categoryId: product.categoryId,
        customName: "",
        customPrice: null,
        customImage: null,
        isHidden: false,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(`נשמר: ${product.name}`);
      await loadProducts();
    } else {
      setError(data.error || "שגיאה בשמירה");
    }

    setSavingId(null);
  }

  function updateProductCategory(itemId: number, categoryId: string) {
    setProducts((prev) =>
      prev.map((product) =>
        product.itemId === itemId
          ? {
              ...product,
              categoryId: categoryId || null,
              categoryName:
                categories.find((c) => c.id === categoryId)?.name ?? null,
            }
          : product,
      ),
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = filter.trim().toLowerCase();
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "none" && !product.categoryId) ||
        product.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, filter, categoryFilter]);

  const assignedCount = products.filter((p) => p.categoryId).length;

  return (
    <div className="space-y-6">
      <CustomerLinkCard />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">ניהול קטלוג</h2>
        <p className="mt-2 text-sm text-gray-600">
          כאן רואים את כל המוצרים מ-Rivhit, יוצרים קטגוריות, ומשייכים כל מוצר
          לקטגוריה שלו.
        </p>
        <p className="mt-2 text-sm font-medium text-emerald-700">
          {loading
            ? "טוען..."
            : `${products.length} מוצרים | ${assignedCount} משויכים לקטגוריה`}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">קטגוריות</h3>
        <form onSubmit={addCategory} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="שם קטגוריה חדשה, למשל: משקאות"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3"
          />
          <button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">
            הוסף קטגוריה
          </button>
        </form>

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-800"
              >
                {category.name}
                <button
                  type="button"
                  onClick={() => deleteCategory(category.id, category.name)}
                  className="text-red-600"
                  aria-label={`מחק ${category.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="חיפוש לפי שם או מק״ט"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="all">כל המוצרים</option>
            <option value="none">ללא קטגוריה</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )}

        {loading ? (
          <p className="mt-6 text-gray-600">טוען מוצרים מ-Rivhit...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="mt-6 text-gray-600">לא נמצאו מוצרים.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-3">שם מוצר</th>
                  <th className="px-3 py-3">מק&quot;ט</th>
                  <th className="px-3 py-3">קטגוריה</th>
                  <th className="px-3 py-3">פעולה</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.itemId} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium">{product.name}</td>
                    <td className="px-3 py-3">{product.sku}</td>
                    <td className="px-3 py-3">
                      <select
                        value={product.categoryId ?? ""}
                        onChange={(e) =>
                          updateProductCategory(product.itemId, e.target.value)
                        }
                        className="w-full min-w-[160px] rounded-lg border border-gray-300 px-3 py-2"
                      >
                        <option value="">בחר קטגוריה</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => saveProduct(product)}
                        disabled={savingId === product.itemId}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
                      >
                        {savingId === product.itemId ? "שומר..." : "שמור"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
