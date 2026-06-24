<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This repo is a single **Next.js 16 app** (`catalog-app`, Hebrew/RTL B2B catalog) whose only backend is **Supabase** (Postgres + PostgREST). It also talks to the external **Rivhit** API and builds WhatsApp order links, but neither is required to run/login locally. Standard commands live in `package.json` (`npm run dev` / `build` / `lint`); the dev server binds to `0.0.0.0:3000`.

The VM snapshot already has Docker, the Supabase CLI, and the local Supabase config (`supabase/config.toml`). The update script only runs `npm install`. Services are NOT auto-started — start them each session:

1. **Docker daemon** (no systemd here): `sudo dockerd` in the background (e.g. a tmux session), then confirm with `sudo docker info`.
2. **Local Supabase**: `sudo supabase start` (from repo root). Note the printed `API URL` (`http://127.0.0.1:54321`) and `Secret` key.
3. **Load schema on a fresh DB only**: pipe `supabase/schema.sql` (then the idempotent `supabase/migration-*.sql`) into the db container, e.g. `sudo docker exec -i supabase_db_workspace psql -U postgres -d postgres < supabase/schema.sql`. `schema.sql` is the consolidated current schema and seeds `admin_settings` (admin password `Kavanat2024!`). If `supabase start` reused an existing volume, the schema is already present — skip this.
4. **Grant API-role privileges (non-obvious gotcha)**: tables created via `psql -U postgres` are NOT auto-granted to PostgREST roles locally, so the app gets `42501 permission denied` (e.g. `/api/health/db` returns a 403 body). After loading schema, run `GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;` (plus `USAGE` on the schema and matching `ALTER DEFAULT PRIVILEGES`). Re-run only after creating new tables. This is unnecessary on hosted Supabase.
5. **`.env.local`** (gitignored, recreate if missing): set `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` to the API URL, `SUPABASE_SERVICE_ROLE_KEY` (a.k.a. `SUPABASE_SECRET_KEY`) to the printed `Secret` key, and a non-empty `SESSION_SECRET` (auth throws `Missing SESSION_SECRET` without it).

Verify with `curl localhost:3000/api/health/db` → `{"ok":true,"step":"ready",...}`. Hello-world check: admin login at `/admin/login` with `Kavanat2024!` (super-admin at `/super-admin/login`, agent-manager at `/agent-manager/login`).

`npm run lint` currently reports pre-existing `react-hooks` errors (exit 1) on untouched files; `npm run build` passes.
