#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCHEMA="$ROOT/supabase/schema.sql"

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "→ מריץ schema.sql דרך DATABASE_URL..."
  psql "$DATABASE_URL" -f "$SCHEMA"
  echo "✓ schema.sql הורץ בהצלחה"
  exit 0
fi

if [[ -n "${SUPABASE_DB_PASSWORD:-}" && -n "${SUPABASE_PROJECT_REF:-}" ]]; then
  DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres"
  echo "→ מריץ schema.sql דרך Supabase DB..."
  psql "$DB_URL" -f "$SCHEMA"
  echo "✓ schema.sql הורץ בהצלחה"
  exit 0
fi

echo "חסרים פרטי חיבור ל-Supabase."
echo ""
echo "הוסף ל-bait/.env.local אחת מהאפשרויות:"
echo "  DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
echo "  או: SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD"
echo ""
echo "או הרץ ידנית ב-Supabase → SQL Editor → הדבק את supabase/schema.sql"
