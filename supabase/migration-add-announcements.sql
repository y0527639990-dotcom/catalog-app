-- הרץ ב-Supabase SQL Editor (פעם אחת)

create table if not exists announcements (
  id int primary key default 1 check (id = 1),
  message text not null default '',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into announcements (id, message, is_active)
values (1, '', false)
on conflict (id) do nothing;
