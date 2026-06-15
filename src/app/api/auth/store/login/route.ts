import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { storeName, username, password } = await request.json();

    if (!storeName?.trim() || !username?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "יש למלא שם חנות, שם משתמש וסיסמה" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("stores")
      .select("id, store_name, username, password_hash")
      .eq("store_name", storeName.trim())
      .eq("username", username.trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "פרטי התחברות שגויים" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, data.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "פרטי התחברות שגויים" },
        { status: 401 },
      );
    }

    await setSession({
      role: "store",
      storeId: data.id,
      storeName: data.store_name,
      username: data.username,
    });

    return NextResponse.json({
      success: true,
      storeName: data.store_name,
      username: data.username,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "שגיאה בהתחברות" },
      { status: 500 },
    );
  }
}
