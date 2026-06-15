import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await requireAdminSession();
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

  return NextResponse.json({
    message: data?.message ?? "",
    isActive: data?.is_active ?? false,
    updatedAt: data?.updated_at ?? null,
  });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const { message, isActive } = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("announcements")
    .upsert(
      {
        id: 1,
        message: String(message ?? "").trim(),
        is_active: Boolean(isActive),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("message, is_active, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: data.message,
    isActive: data.is_active,
    updatedAt: data.updated_at,
  });
}
