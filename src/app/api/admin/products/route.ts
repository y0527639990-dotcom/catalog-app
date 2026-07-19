import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { requireAdminSession } from "@/lib/auth";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import {
  clearRivhitItemsCache,
  fetchRivhitItems,
  getSku,
  resolveImageUrl,
  resolveProductImage,
} from "@/lib/rivhit";
import {
  ensureStagingCategory,
  syncNewItemsToStagingCategory,
} from "@/lib/staging-category";
import type { ProductOverride } from "@/lib/types";

interface ProductMappingRow {
  rivhit_item_id: number;
  category_id: string;
  sort_order?: number;
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const refresh = new URL(request.url).searchParams.get("refresh") === "1";
  if (refresh) {
    clearRivhitItemsCache();
  }

  try {
    const supabase = createAdminClient();
    const stagingCategory = await ensureStagingCategory(supabase);
    const items = await fetchRivhitItems();

    const [overridesResult, mappingsResult, categoriesResult] =
      await Promise.all([
        fetchAllRows<ProductOverride>(supabase, "product_overrides"),
        fetchAllRows<ProductMappingRow>(supabase, "product_mappings"),
        supabase
          .from("categories")
          .select("id, name, sort_order, is_staging")
          .order("sort_order", { ascending: true }),
      ]);

    if (categoriesResult.error) throw new Error(categoriesResult.error.message);

    const overridesData = overridesResult;
    const mappingsData = mappingsResult;

    const mappedIds = new Set(
      mappingsData.map((row) => row.rivhit_item_id as number),
    );
    const syncedCount = await syncNewItemsToStagingCategory(
      supabase,
      stagingCategory.id,
      items.map((item) => item.item_id),
      mappedIds,
    );

    if (syncedCount > 0) {
      revalidateTag(CATALOG_CACHE_TAG, "max");
    }

    const mappings =
      syncedCount > 0
        ? await fetchAllRows<ProductMappingRow>(supabase, "product_mappings")
        : mappingsData;

    const overrides = new Map(
      overridesData.map((row) => [row.rivhit_item_id, row]),
    );
    const mappingsMap = new Map<number, ProductMappingRow[]>();
    for (const mapping of mappings) {
      const itemMappings = mappingsMap.get(mapping.rivhit_item_id) ?? [];
      itemMappings.push(mapping);
      mappingsMap.set(mapping.rivhit_item_id, itemMappings);
    }
    const categories = new Map(
      (categoriesResult.data ?? []).map((row) => [row.id, row]),
    );

    const products = items.map((item) => {
      const override = overrides.get(item.item_id);
      const itemMappings = mappingsMap.get(item.item_id) ?? [];
      const itemCategories = itemMappings
        .map((mapping) => categories.get(mapping.category_id))
        .filter((category) => category != null);

      return {
        itemId: item.item_id,
        sku: getSku(item),
        rivhitName: item.item_name,
        name: override?.custom_name || item.item_name,
        price: override?.custom_price ?? item.sale_nis,
        rivhitPrice: item.sale_nis,
        rivhitImage: resolveImageUrl(item.picture_link),
        image: resolveProductImage(item.picture_link, override),
        hasCustomImage: Boolean(override?.custom_image),
        hasCustomPrice: override?.custom_price != null,
        isHidden: override?.is_hidden ?? false,
        categoryIds: itemCategories.map((category) => category.id),
        categoryNames: itemCategories.map((category) => category.name),
        isStaging: itemCategories.some((category) => category.is_staging === true),
      };
    });

    return NextResponse.json({
      products,
      stagingCategoryId: stagingCategory.id,
      syncedCount,
    });
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
      categoryIds,
      customName,
      customPrice,
      customImage,
      isHidden,
      clearCustomImage,
    } = body;

    if (!itemId) {
      return NextResponse.json({ error: "חסר מזהה מוצר" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const requestedCategoryIds =
      categoryIds !== undefined
        ? categoryIds
        : categoryId !== undefined
          ? categoryId
            ? [categoryId]
            : []
          : undefined;

    if (requestedCategoryIds !== undefined) {
      if (
        !Array.isArray(requestedCategoryIds) ||
        requestedCategoryIds.some((id) => typeof id !== "string")
      ) {
        return NextResponse.json(
          { error: "רשימת הקטגוריות אינה תקינה" },
          { status: 400 },
        );
      }

      const uniqueCategoryIds = [...new Set<string>(requestedCategoryIds)];
      let targetCategoryIds: string[];

      if (uniqueCategoryIds.length > 0) {
        const { data: selectedCategories, error: categoriesError } =
          await supabase
            .from("categories")
            .select("id, is_staging")
            .in("id", uniqueCategoryIds);

        if (categoriesError) {
          throw new Error(categoriesError.message);
        }

        if (
          !selectedCategories ||
          selectedCategories.length !== uniqueCategoryIds.length ||
          selectedCategories.some((category) => category.is_staging)
        ) {
          return NextResponse.json(
            { error: "אחת הקטגוריות לא נמצאה" },
            { status: 400 },
          );
        }

        targetCategoryIds = uniqueCategoryIds;
      } else {
        const staging = await ensureStagingCategory(supabase);
        targetCategoryIds = [staging.id];
      }

      const { data: existingMappings, error: mappingsError } = await supabase
        .from("product_mappings")
        .select("category_id")
        .eq("rivhit_item_id", itemId);

      if (mappingsError) {
        throw new Error(mappingsError.message);
      }

      const { error: upsertError } = await supabase
        .from("product_mappings")
        .upsert(
          targetCategoryIds.map((selectedCategoryId) => ({
            rivhit_item_id: itemId,
            category_id: selectedCategoryId,
          })),
          { onConflict: "rivhit_item_id,category_id" },
        );

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      const obsoleteCategoryIds = (existingMappings ?? [])
        .map((mapping) => mapping.category_id as string)
        .filter((id) => !targetCategoryIds.includes(id));

      if (obsoleteCategoryIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_mappings")
          .delete()
          .eq("rivhit_item_id", itemId)
          .in("category_id", obsoleteCategoryIds);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }
    }

    const { data: existingOverride } = await supabase
      .from("product_overrides")
      .select("custom_name, custom_price, custom_image, is_hidden")
      .eq("rivhit_item_id", itemId)
      .maybeSingle();

    const overridePayload = {
      rivhit_item_id: itemId,
      custom_name:
        customName !== undefined
          ? customName || null
          : (existingOverride?.custom_name ?? null),
      custom_price:
        customPrice !== undefined
          ? customPrice
          : (existingOverride?.custom_price ?? null),
      custom_image: clearCustomImage
        ? null
        : customImage !== undefined
          ? customImage || null
          : (existingOverride?.custom_image ?? null),
      is_hidden:
        isHidden !== undefined
          ? Boolean(isHidden)
          : (existingOverride?.is_hidden ?? false),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("product_overrides")
      .upsert(overridePayload);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag(CATALOG_CACHE_TAG, "max");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "שגיאה בעדכון" },
      { status: 500 },
    );
  }
}
