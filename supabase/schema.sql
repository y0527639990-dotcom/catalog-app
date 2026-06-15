-- הרץ את הקובץ הזה ב-Supabase:
-- SQL Editor → New query → הדבק הכל → Run

create extension if not exists "pgcrypto";

-- חנויות (לקוחות)
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  username text not null default 'ראשי',
  password_hash text not null,
  created_at timestamptz not null default now(),
  unique (store_name, username)
);

-- קטגוריות
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- שיוך מוצרים לקטגוריות (מזהה Rivhit)
create table if not exists product_mappings (
  id uuid primary key default gen_random_uuid(),
  rivhit_item_id int not null,
  category_id uuid not null references categories(id) on delete cascade,
  sort_order int not null default 0,
  unique (rivhit_item_id)
);

-- עריכות מנהל על מוצרים מ-Rivhit
create table if not exists product_overrides (
  rivhit_item_id int primary key,
  custom_name text,
  custom_price numeric(10, 2),
  custom_image text,
  is_hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

-- הגדרות מנהל (סיסמה)
create table if not exists admin_settings (
  id int primary key default 1 check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

-- סיסמת מנהל ראשונית: Kavanat2024!
insert into admin_settings (id, password_hash)
values (1, '$2b$10$NO9qZF.cQ4WzJ39FLBzFpujzzPOy9K6JCV.yHF8Ieq3KxtFghjsFe')
on conflict (id) do nothing;

-- מודעה ללקוחות (פופאפ)
create table if not exists announcements (
  id int primary key default 1 check (id = 1),
  message text not null default '',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into announcements (id, message, is_active)
values (1, '', false)
on conflict (id) do nothing;

-- אינדקסים
create index if not exists idx_product_mappings_category on product_mappings(category_id);
create index if not exists idx_product_mappings_item on product_mappings(rivhit_item_id);
create index if not exists idx_categories_sort on categories(sort_order);
