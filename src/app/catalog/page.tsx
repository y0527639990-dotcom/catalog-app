import { redirect } from "next/navigation";
import CatalogView from "@/components/CatalogView";
import { requireStoreSession } from "@/lib/auth";
import { getCatalogProducts } from "@/lib/catalog";

export default async function CatalogPage() {
  const session = await requireStoreSession();
  if (!session) {
    redirect("/login");
  }

  let products: Awaited<ReturnType<typeof getCatalogProducts>> = [];
  let error = "";

  try {
    products = await getCatalogProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "שגיאה בטעינת הקטלוג";
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}
      <CatalogView
        storeName={session.storeName ?? "חנות"}
        initialProducts={products}
      />
    </>
  );
}
