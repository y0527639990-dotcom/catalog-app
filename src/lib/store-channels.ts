import type { SupabaseClient } from "@supabase/supabase-js";
import type { WhatsAppChannel } from "@/lib/types";

function isMissingTrackingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01") return true;
  const msg = error.message?.toLowerCase() ?? "";
  return msg.includes("store_link_tracking") || msg.includes("schema cache");
}

export async function insertStore(
  supabase: SupabaseClient,
  row: { store_name: string; username: string; password_hash: string },
) {
  return supabase
    .from("stores")
    .insert(row)
    .select("id, store_name, username, password_hash")
    .single();
}

export async function trackStoreLogin(
  supabase: SupabaseClient,
  storeId: string,
  channel: WhatsAppChannel,
  isNew: boolean,
) {
  const { data: existing, error: lookupError } = await supabase
    .from("store_link_tracking")
    .select("store_id, signup_channel")
    .eq("store_id", storeId)
    .maybeSingle();

  if (lookupError && !isMissingTrackingTable(lookupError)) {
    return;
  }

  if (existing) {
    await supabase
      .from("store_link_tracking")
      .update({
        last_login_channel: channel,
        updated_at: new Date().toISOString(),
      })
      .eq("store_id", storeId);
    return;
  }

  await supabase.from("store_link_tracking").insert({
    store_id: storeId,
    signup_channel: isNew ? channel : "default",
    last_login_channel: channel,
  });
}

export async function listStores(supabase: SupabaseClient) {
  const storesResult = await supabase
    .from("stores")
    .select("id, store_name, username, created_at")
    .order("created_at", { ascending: false });

  if (storesResult.error) {
    return storesResult;
  }

  const trackingResult = await supabase
    .from("store_link_tracking")
    .select("store_id, signup_channel, last_login_channel");

  const trackingByStore = new Map(
    (trackingResult.data ?? []).map((row) => [row.store_id, row]),
  );

  const stores = (storesResult.data ?? []).map((store) => {
    const tracking = trackingByStore.get(store.id);
    return {
      ...store,
      signup_channel: (tracking?.signup_channel ?? "default") as WhatsAppChannel,
      last_login_channel: (tracking?.last_login_channel ??
        "default") as WhatsAppChannel,
    };
  });

  return { data: stores, error: null };
}
