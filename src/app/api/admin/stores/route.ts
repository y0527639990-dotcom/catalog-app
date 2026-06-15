import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { hashPassword, requireAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, store_name, username, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stores: data ?? [] });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const { id, password } = await request.json();
  if (!id || !password?.trim()) {
    return NextResponse.json({ error: "חסר מזהה או סיסמה" }, { status: 400 });
  }

  if (password.trim().length < 4) {
    return NextResponse.json(
      { error: "הסיסמה חייבת להכיל לפחות 4 תווים" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const passwordHash = await hashPassword(password.trim());

  const { data, error } = await supabase
    .from("stores")
    .update({ password_hash: passwordHash })
    .eq("id", id)
    .select("id, store_name, username")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, store: data });
}
