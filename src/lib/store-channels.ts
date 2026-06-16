import type { SupabaseClient } from "@supabase/supabase-js";
import type { WhatsAppChannel } from "@/lib/types";

export function isMissingChannelColumns(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("signup_channel") ||
    msg.includes("last_login_channel") ||
    msg.includes("schema cache")
  );
}

export async function insertStore(
  supabase: SupabaseClient,
  row: { store_name: string; username: string; password_hash: string },
  channel: WhatsAppChannel,
) {
  const withChannel = {
    ...row,
    signup_channel: channel,
    last_login_channel: channel,
  };

  const attempt = await supabase
    .from("stores")
    .insert(withChannel)
    .select("id, store_name, username, password_hash")
    .single();

  if (!attempt.error) {
    return attempt;
  }

  if (isMissingChannelColumns(attempt.error)) {
    return supabase
      .from("stores")
      .insert(row)
      .select("id, store_name, username, password_hash")
      .single();
  }

  return attempt;
}

export async function updateLastLoginChannel(
  supabase: SupabaseClient,
  storeId: string,
  channel: WhatsAppChannel,
) {
  const { error } = await supabase
    .from("stores")
    .update({ last_login_channel: channel })
    .eq("id", storeId);

  if (error && !isMissingChannelColumns(error)) {
    throw new Error(error.message);
  }
}

export async function listStores(supabase: SupabaseClient) {
  const withChannels = await supabase
    .from("stores")
    .select("id, store_name, username, created_at, signup_channel, last_login_channel")
    .order("created_at", { ascending: false });

  if (!withChannels.error) {
    return withChannels;
  }

  if (isMissingChannelColumns(withChannels.error)) {
    return supabase
      .from("stores")
      .select("id, store_name, username, created_at")
      .order("created_at", { ascending: false });
  }

  return withChannels;
}
