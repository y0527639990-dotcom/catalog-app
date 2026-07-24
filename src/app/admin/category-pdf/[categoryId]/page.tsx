import { notFound, redirect } from "next/navigation";
import { requireSuperAdminSession } from "@/lib/auth";
import { getCategoryCatalogForExport } from "@/lib/catalog";
import CategoryCatalogPrintButton from "@/components/CategoryCatalogPrintButton";

function formatPrice(price: number) {
  if (!price || price <= 0) return "—";
  return `₪${price.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatHebrewDate(date: Date) {
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CategoryCatalogPdfPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const session = await requireSuperAdminSession();
  if (!session) {
    redirect("/super-admin/login");
  }

  const { categoryId } = await params;
  const catalog = await getCategoryCatalogForExport(categoryId);
  if (!catalog) {
    notFound();
  }

  const { category, products } = catalog;
  const generatedAt = formatHebrewDate(new Date());

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-gray-900" dir="rtl">
      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-sheet {
            background: white !important;
            box-shadow: none !important;
            margin: 0 !important;
            max-width: none !important;
            padding: 0 !important;
          }

          .product-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .catalog-header {
            break-after: avoid;
          }
        }
      `}</style>

      <div className="no-print sticky top-0 z-10 border-b border-emerald-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">מנהל ראשי · ייצוא קטלוג</p>
            <p className="font-semibold text-emerald-900">{category.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-gray-500">
              בחלון ההדפסה בחר &quot;שמירה כ־PDF&quot;
            </p>
            <CategoryCatalogPrintButton />
          </div>
        </div>
      </div>

      <div className="print-sheet mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <header className="catalog-header mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="bg-gradient-to-l from-emerald-800 to-emerald-600 px-6 py-7 text-white">
            <p className="text-sm font-medium tracking-wide text-emerald-100">
              קטלוג כוונת הלב
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {category.name}
            </h1>
            <p className="mt-3 text-sm text-emerald-50">
              {products.length} מוצרים · עודכן {generatedAt}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-emerald-100 bg-emerald-50/60 px-4 py-3 text-center text-xs text-emerald-900 sm:text-sm">
            <div>
              <p className="font-semibold">מק״ט</p>
              <p className="text-emerald-700">מזהה מוצר</p>
            </div>
            <div>
              <p className="font-semibold">תמונה + שם</p>
              <p className="text-emerald-700">תיאור קצר</p>
            </div>
            <div>
              <p className="font-semibold">מחיר</p>
              <p className="text-emerald-700">בש״ח</p>
            </div>
          </div>
        </header>

        {products.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            אין מוצרים משויכים לקטגוריה זו.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.itemId}
                className="product-card flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-gray-50">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      אין תמונה
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    מק״ט: <span className="font-medium text-gray-700">{product.sku}</span>
                  </p>
                  <p className="mt-auto pt-1 text-base font-bold text-emerald-800">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          קטלוג כוונת הלב · {category.name} · {generatedAt}
        </footer>
      </div>
    </div>
  );
}
