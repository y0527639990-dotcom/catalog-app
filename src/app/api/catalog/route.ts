import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog";
import { requireStoreSession } from "@/lib/auth";

export async function GET() {
  const session = await requireStoreSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  try {
    const products = await getCatalogProducts();
    return NextResponse.json({
      storeName: session.storeName,
      products,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "שגיאה בטעינת קטלוג" },
      { status: 500 },
    );
  }
}
