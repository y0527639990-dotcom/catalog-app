-- הרץ את הקובץ הזה ב-Supabase (פרויקט bait):
-- SQL Editor → New query → הדבק הכל → Run

create extension if not exists "pgcrypto";

-- הגדרות אפליקציה (שורה יחידה)
create table if not exists app_settings (
  id int primary key default 1 check (id = 1),
  app_name text not null default 'Bait',
  welcome_message text not null default 'ברוכים הבאים ל-Bait',
  updated_at timestamptz not null default now()
);

insert into app_settings (id, app_name, welcome_message)
values (1, 'Bait', 'ברוכים הבאים ל-Bait')
on conflict (id) do nothing;

-- טבלת דוגמה — אפשר למחוק או להרחיב לפי הצורך
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create index if not exists notes_created_at_idx on notes (created_at desc);
