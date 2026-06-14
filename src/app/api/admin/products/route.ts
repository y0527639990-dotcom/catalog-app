import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/auth";
import { fetchRivhitItems, getSku, resolveImageUrl } from "@/lib/rivhit";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const [items, overridesResult, mappingsResult, categoriesResult] =
      await Promise.all([
        fetchRivhitItems(),
        supabase.from("product_overrides").select("*"),
        supabase.from("product_mappings").select("*"),
        supabase.from("categories").select("id, name"),
      ]);

    if (overridesResult.error) throw new Error(overridesResult.error.message);
    if (mappingsResult.error) throw new Error(mappingsResult.error.message);
    if (categoriesResult.error) throw new Error(categoriesResult.error.message);

    const overrides = new Map(
      (overridesResult.data ?? []).map((row) => [row.rivhit_item_id, row]),
    );
    const mappings = new Map(
      (mappingsResult.data ?? []).map((row) => [row.rivhit_item_id, row]),
    );
    const categories = new Map(
      (categoriesResult.data ?? []).map((row) => [row.id, row.name]),
    );

    const products = items.map((item) => {
      const override = overrides.get(item.item_id);
      const mapping = mappings.get(item.item_id);

      return {
        itemId: item.item_id,
        sku: getSku(item),
        rivhitName: item.item_name,
        name: override?.custom_name || item.item_name,
        price: override?.custom_price ?? item.sale_nis,
        rivhitPrice: item.sale_nis,
        image:
          override?.custom_image ||
          resolveImageUrl(item.picture_link) ||
          null,
        isHidden: override?.is_hidden ?? false,
        categoryId: mapping?.category_id ?? null,
        categoryName: mapping?.category_id
          ? categories.get(mapping.category_id) ?? null
          : null,
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "שגיאה בטעינת מוצרים" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      itemId,
      categoryId,
      customName,
      customPrice,
      customImage,
      isHidden,
    } = body;

    if (!itemId) {
      return NextResponse.json({ error: "חסר מזהה מוצר" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (categoryId) {
      await supabase.from("product_mappings").upsert(
        {
          rivhit_item_id: itemId,
          category_id: categoryId,
        },
        { onConflict: "rivhit_item_id" },
      );
    } else {
      await supabase
        .from("product_mappings")
        .delete()
        .eq("rivhit_item_id", itemId);
    }

    const overridePayload = {
      rivhit_item_id: itemId,
      custom_name: customName || null,
      custom_price: customPrice ?? null,
      custom_image: customImage || null,
      is_hidden: Boolean(isHidden),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("product_overrides")
      .upsert(overridePayload);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "שגיאה בעדכון" },
      { status: 500 },
    );
  }
}
