"use client";

import { useEffect, useState } from "react";
import CatalogView from "@/components/CatalogView";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import type { CatalogProduct, WhatsAppChannel } from "@/lib/types";
import { getWhatsAppNumber } from "@/lib/whatsapp";

export default function CatalogLoader({ storeName }: { storeName: string }) {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [whatsappChannel, setWhatsappChannel] =
    useState<WhatsAppChannel>("default");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/catalog");
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          setError(data.error || "שגיאה בטעינת הקטלוג");
          setProducts([]);
          return;
        }

        setProducts(data.products ?? []);
        setWhatsappChannel(data.whatsappChannel === "b" ? "b" : "default");
      } catch {
        if (!cancelled) {
          setError("שגיאת רשת");
          setProducts([]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (products === null) {
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-gray-50">
        <header className="border-b border-emerald-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs text-gray-500">שלום,</p>
          <h1 className="text-lg font-bold text-emerald-800">{storeName}</h1>
          <p className="mt-3 text-center text-sm text-emerald-700">
            טוען קטלוג...
          </p>
        </header>
        <main className="grid grid-cols-2 gap-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </main>
      </div>
    );
  }

  return (
    <>
      <AnnouncementPopup />
      {error && (
        <div className="bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}
      <CatalogView
        storeName={storeName}
        initialProducts={products}
        whatsappNumber={getWhatsAppNumber(whatsappChannel)}
      />
    </>
  );
}
