import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { hashPassword, setSession, verifyPassword } from "@/lib/auth";
import { insertStore, trackStoreLogin } from "@/lib/store-channels";
import type { WhatsAppChannel } from "@/lib/types";

const DEFAULT_USERNAME = "ראשי";

type StoreRow = {
  id: string;
  store_name: string;
  username: string;
  password_hash: string;
};

async function findStoreByNameAndPassword(
  stores: StoreRow[],
  password: string,
): Promise<StoreRow | null> {
  for (const store of stores) {
    const valid = await verifyPassword(password, store.password_hash);
    if (valid) return store;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { storeName, password, channel } = await request.json();

    if (!storeName?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "יש למלא שם חנות וסיסמה" },
        { status: 400 },
      );
    }

    if (password.trim().length < 4) {
      return NextResponse.json(
        { error: "הסיסמה חייבת להכיל לפחות 4 תווים" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const trimmedStore = storeName.trim();
    const trimmedPassword = password.trim();
    const channelValue: WhatsAppChannel = channel === "b" ? "b" : "default";

    const { data: existingStores, error: lookupError } = await supabase
      .from("stores")
      .select("id, store_name, username, password_hash")
      .eq("store_name", trimmedStore);

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    const stores = existingStores ?? [];
    let store: StoreRow | null = null;
    const isNew = stores.length === 0;

    if (isNew) {
      const { data: created, error: createError } = await insertStore(supabase, {
        store_name: trimmedStore,
        username: DEFAULT_USERNAME,
        password_hash: await hashPassword(trimmedPassword),
      });

      if (createError) {
        if (createError.code === "23505") {
          return NextResponse.json(
            { error: "שם החנות כבר קיים — הזן את הסיסמה הנכונה" },
            { status: 409 },
          );
        }
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      store = created;
    } else if (stores.length === 1) {
      const candidate = stores[0];
      const valid = await verifyPassword(trimmedPassword, candidate.password_hash);
      if (!valid) {
        return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
      }
      store = candidate;
    } else {
      store = await findStoreByNameAndPassword(stores, trimmedPassword);
      if (!store) {
        return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
      }
    }

    await trackStoreLogin(supabase, store.id, channelValue, isNew);

    await setSession({
      role: "store",
      storeId: store.id,
      storeName: store.store_name,
      username: store.username,
      whatsappChannel: channelValue,
    });

    return NextResponse.json({
      success: true,
      storeName: store.store_name,
      username: store.username,
      isNew,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "שגיאה בכניסה";
    const friendly =
      message.includes("fetch failed") || message.includes("Missing Supabase")
        ? "בעיית חיבור למסד הנתונים. נסה שוב מאוחר יותר."
        : message;

    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
