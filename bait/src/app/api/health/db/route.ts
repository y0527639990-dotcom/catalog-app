import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET() {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    return NextResponse.json({
      ok: false,
      step: "env",
      message: "חסרים משתני Supabase — העתק מ-.env.example ל-.env.local",
      urlHost: config.urlHost,
    });
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/app_settings?id=eq.1&select=id,app_name`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
        cache: "no-store",
      },
    );

    const body = await response.text();

    if (!response.ok) {
      return NextResponse.json({
        ok: false,
        step: "supabase",
        message: "Supabase החזיר שגיאה",
        urlHost: config.urlHost,
        status: response.status,
        body: body.slice(0, 200),
      });
    }

    const rows = JSON.parse(body) as { id: number; app_name: string }[];

    return NextResponse.json({
      ok: rows.length > 0,
      step: rows.length > 0 ? "ready" : "schema",
      message:
        rows.length > 0
          ? "החיבור תקין — Bait מוכן"
          : "החיבור תקין אבל app_settings ריק — הרץ supabase/schema.sql",
      urlHost: config.urlHost,
      appName: rows[0]?.app_name ?? null,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      step: "network",
      message: "לא מצליח להתחבר ל-Supabase",
      urlHost: config.urlHost,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}
