import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/auth";

export async function GET() {
  const session = await requireStoreSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("message, is_active, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || !data.is_active || !data.message.trim()) {
    return NextResponse.json({ active: false });
  }

  return NextResponse.json({
    active: true,
    message: data.message,
    updatedAt: data.updated_at,
  });
}
