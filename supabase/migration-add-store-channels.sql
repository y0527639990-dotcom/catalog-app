-- הרץ ב-Supabase SQL Editor
-- מעקב אחרי קישור כניסה לכל חנות (קישור 1 / קישור B)

alter table stores
  add column if not exists signup_channel text not null default 'default'
    check (signup_channel in ('default', 'b')),
  add column if not exists last_login_channel text not null default 'default'
    check (last_login_channel in ('default', 'b'));
