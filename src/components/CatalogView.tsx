"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, CatalogProduct } from "@/lib/types";

function buildWhatsAppUrl(
  storeName: string,
  items: CartItem[],
  notes: string,
) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "972555662240";
  const lines = [
    `הזמנה מ: ${storeName}`,
    "─────────────────",
    ...items.map((item) => `• מק"ט: ${item.sku} × ${item.quantity}`),
    "─────────────────",
  ];

  if (notes.trim()) {
    lines.push(`הערות: ${notes.trim()}`);
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

interface CategoryGroup {
  id: string;
  name: string;
  products: CatalogProduct[];
  image: string | null;
}

export default function CatalogView({
  storeName,
  initialProducts,
}: {
  storeName: string;
  initialProducts: CatalogProduct[];
}) {
  const [products] = useState(initialProducts);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    const defaults: Record<number, number> = {};
    for (const product of initialProducts) {
      defaults[product.itemId] = 1;
    }
    setQuantities(defaults);
  }, [initialProducts]);

  const categories = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, CategoryGroup>();

    for (const product of products) {
      const existing = map.get(product.categoryId);
      if (existing) {
        existing.products.push(product);
        if (!existing.image && product.image) {
          existing.image = product.image;
        }
      } else {
        map.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName,
          products: [product],
          image: product.image,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "he"),
    );
  }, [products]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const cartItems: CartItem[] = Object.entries(cart).map(([sku, quantity]) => ({
    sku,
    quantity,
  }));

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: CatalogProduct) {
    const qty = quantities[product.itemId] || 1;
    setCart((prev) => ({
      ...prev,
      [product.sku]: (prev[product.sku] ?? 0) + qty,
    }));
  }

  function removeFromCart(sku: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
  }

  async function logout() {
    await fetch("/api/auth/store/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 pb-44">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">שלום,</p>
            <h1 className="text-lg font-bold text-emerald-800">{storeName}</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            יציאה
          </button>
        </div>
      </header>

      <main className="px-4 py-4">
        {categories.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-gray-600 shadow">
            <p className="font-medium">הקטלוג עדיין ריק</p>
            <p className="mt-2 text-sm">
              המנהל צריך להוסיף קטגוריות ולשייך מוצרים.
            </p>
          </div>
        ) : selectedCategory ? (
          <div>
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="mb-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm"
            >
              ← חזרה לקטגוריות
            </button>

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {selectedCategory.name}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {selectedCategory.products.map((product) => (
                <article
                  key={product.itemId}
                  className="flex flex-col rounded-2xl bg-white p-3 shadow-sm"
                >
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="mb-2 aspect-square w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="mb-2 flex aspect-square w-full items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">
                      אין תמונה
                    </div>
                  )}

                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    מק&quot;ט: {product.sku}
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <input
                      type="number"
                      min={1}
                      value={quantities[product.itemId] ?? 1}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [product.itemId]: Math.max(
                            1,
                            Number(e.target.value) || 1,
                          ),
                        }))
                      }
                      className="w-14 rounded-lg border border-gray-300 px-2 py-2 text-center text-sm"
                    />
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white"
                    >
                      הוסף
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              בחר קטגוריה
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="overflow-hidden rounded-2xl bg-white text-right shadow-sm transition hover:shadow-md"
                >
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt={category.name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-emerald-100 text-3xl">
                      📦
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {category.products.length} מוצרים
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-lg space-y-3">
          {cartItems.length > 0 && (
            <div className="max-h-24 overflow-y-auto rounded-xl bg-gray-50 p-3 text-sm">
              <p className="mb-1 font-medium text-gray-700">בעגלה:</p>
              {cartItems.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between py-1"
                >
                  <span>
                    מק&quot;ט: {item.sku} × {item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.sku)}
                    className="text-red-600"
                  >
                    הסר
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערות להזמנה (אופציונלי)"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            rows={2}
          />

          <a
            href={
              cartItems.length > 0
                ? buildWhatsAppUrl(storeName, cartItems, notes)
                : undefined
            }
            onClick={(e) => {
              if (cartItems.length === 0) {
                e.preventDefault();
                alert("העגלה ריקה. הוסף מוצרים לפני שליחה.");
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full rounded-xl py-3 text-center text-base font-bold text-white ${
              cartItems.length > 0
                ? "bg-green-600"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            סיימתי — שלח ב-WhatsApp ({cartCount})
          </a>
        </div>
      </footer>
    </div>
  );
}
