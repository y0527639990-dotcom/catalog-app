-- מאפשר לשייך מוצר אחד למספר קטגוריות
-- הרץ פעם אחת ב-Supabase SQL Editor

alter table product_mappings
  drop constraint if exists product_mappings_rivhit_item_id_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_mappings_rivhit_item_id_category_id_key'
      and conrelid = 'product_mappings'::regclass
  ) then
    alter table product_mappings
      add constraint product_mappings_rivhit_item_id_category_id_key
      unique (rivhit_item_id, category_id);
  end if;
end
$$;

notify pgrst, 'reload schema';
