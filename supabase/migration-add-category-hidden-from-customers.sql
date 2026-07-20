-- מאפשר להסתיר קטגוריה מלקוחות (ברירת מחדל: גלויה)
-- הרץ פעם אחת ב-Supabase SQL Editor

alter table categories
  add column if not exists is_hidden_from_customers boolean not null default false;

notify pgrst, 'reload schema';
