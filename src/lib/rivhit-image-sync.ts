import type { SupabaseClient } from "@supabase/supabase-js";
import {
  clearRivhitItemsCache,
  fetchRivhitItems,
  resolveImageUrl,
} from "./rivhit";

const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = "product-images";

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

export async function syncProductImageFromRivhit(
  supabase: SupabaseClient,
  itemId: number,
): Promise<{ imageUrl: string } | { error: string }> {
  clearRivhitItemsCache();
  const items = await fetchRivhitItems();
  const item = items.find((row) => row.item_id === itemId);

  if (!item) {
    return { error: "מוצר לא נמצא בריווחית" };
  }

  const rivhitUrl = resolveImageUrl(item.picture_link);
  if (!rivhitUrl) {
    return { error: "אין תמונה בריווחית למוצר זה" };
  }

  const imageResponse = await fetch(rivhitUrl, { cache: "no-store" });
  if (!imageResponse.ok) {
    return { error: "לא ניתן להוריד את התמונה מריווחית" };
  }

  const contentType =
    imageResponse.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  if (buffer.byteLength === 0) {
    return { error: "התמונה מריווחית ריקה" };
  }

  if (buffer.byteLength > MAX_BYTES) {
    return { error: "התמונה גדולה מדי (מקסימום 5MB)" };
  }

  const ext = extensionFromContentType(contentType);
  const path = `${itemId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    const hint =
      uploadError.message.includes("Bucket not found") ||
      uploadError.message.includes("bucket")
        ? " — הרץ את migration-add-product-images.sql ב-Supabase"
        : "";
    return { error: `${uploadError.message}${hint}` };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { imageUrl: urlData.publicUrl };
}
