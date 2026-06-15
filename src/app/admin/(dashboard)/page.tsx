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
  image: string | null;
  categoryId: string | null;
  categoryName: string | null;
}

const PAGE_SIZE = 48;

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("none");
  const [assignCategoryId, setAssignCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    setPage(1);
  }, [filter, categoryFilter]);

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

  async function saveCategory(itemId: number, categoryId: string) {
    setSavingIds((prev) => new Set(prev).add(itemId));
    setError("");

    const response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId,
        categoryId: categoryId || null,
        customName: "",
        customPrice: null,
        customImage: null,
        isHidden: false,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const categoryName =
        categories.find((c) => c.id === categoryId)?.name ?? null;

      setProducts((prev) =>
        prev.map((product) =>
          product.itemId === itemId
            ? {
                ...product,
                categoryId: categoryId || null,
                categoryName,
              }
            : product,
        ),
      );

      const product = products.find((p) => p.itemId === itemId);
      setMessage(categoryId ? `שויך: ${product?.name}` : "הקטגוריה הוסרה");
    } else {
      setError(data.error || "שגיאה בשמירה");
    }

    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const assignedCount = products.filter((p) => p.categoryId).length;
  const unassignedCount = products.length - assignedCount;

  return (
    <div className="space-y-6">
      <CustomerLinkCard />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">ניהול קטלוג</h2>
        <p className="mt-2 text-sm text-gray-600">
          בחר קטגוריה למטה, סנן מוצרים לפי תמונה ושם, ושייך בלחיצה אחת. השמירה
          אוטומטית — הסינון לא מתאפס.
        </p>
        <p className="mt-2 text-sm font-medium text-emerald-700">
          {loading
            ? "טוען..."
            : `${products.length} מוצרים | ${assignedCount} משויכים | ${unassignedCount} ללא קטגוריה`}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">קטגוריות</h3>
        <form
          onSubmit={addCategory}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="שם קטגוריה חדשה, למשל: סידורים"
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-900">
            שיוך מהיר — בחר קטגוריה ולחץ &quot;שייך&quot; על המוצר
          </p>
          <select
            value={assignCategoryId}
            onChange={(e) => setAssignCategoryId(e.target.value)}
            className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 sm:max-w-sm"
          >
            <option value="">בחר קטגוריה לשיוך...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="חיפוש לפי שם או מק״ט"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterPill
            active={categoryFilter === "none"}
            onClick={() => setCategoryFilter("none")}
            label={`ללא קטגוריה (${unassignedCount})`}
          />
          <FilterPill
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
            label={`הכל (${products.length})`}
          />
          {categories.map((category) => {
            const count = products.filter(
              (p) => p.categoryId === category.id,
            ).length;
            return (
              <FilterPill
                key={category.id}
                active={categoryFilter === category.id}
                onClick={() => setCategoryFilter(category.id)}
                label={`${category.name} (${count})`}
              />
            );
          })}
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
          <p className="mt-6 text-gray-600">
            {categoryFilter === "none"
              ? "כל המוצרים כבר משויכים לקטגוריה!"
              : "לא נמצאו מוצרים."}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-gray-500">
              מציג {pagedProducts.length} מתוך {filteredProducts.length} מוצרים
              {categoryFilter === "none" &&
                " — אחרי שיוך, המוצר ייעלם מהרשימה"}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {pagedProducts.map((product) => (
                <ProductCard
                  key={product.itemId}
                  product={product}
                  categories={categories}
                  assignCategoryId={assignCategoryId}
                  isSaving={savingIds.has(product.itemId)}
                  onAssign={(categoryId) =>
                    saveCategory(product.itemId, categoryId)
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
                >
                  ← הקודם
                </button>
                <span className="text-sm text-gray-600">
                  עמוד {page} מתוך {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
                >
                  הבא →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function ProductCard({
  product,
  categories,
  assignCategoryId,
  isSaving,
  onAssign,
}: {
  product: AdminProduct;
  categories: Category[];
  assignCategoryId: string;
  isSaving: boolean;
  onAssign: (categoryId: string) => void;
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-3 shadow-sm ${
        isSaving ? "opacity-60" : ""
      } ${product.categoryId ? "border-emerald-200" : "border-gray-200"}`}
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">
          אין תמונה
        </div>
      )}

      <h4 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-900">
        {product.name}
      </h4>
      <p className="mt-1 text-xs text-gray-500">מק&quot;ט: {product.sku}</p>

      {product.categoryName && (
        <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
          {product.categoryName}
        </span>
      )}

      <div className="mt-auto space-y-2 pt-3">
        {assignCategoryId && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onAssign(assignCategoryId)}
            className="w-full rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "שומר..." : "שייך לקטגוריה"}
          </button>
        )}

        <select
          value={product.categoryId ?? ""}
          disabled={isSaving}
          onChange={(e) => onAssign(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs"
        >
          <option value="">ללא קטגוריה</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
