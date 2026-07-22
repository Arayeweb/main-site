-- FastWeb: add category_key (10 sellable categories on top of the 5 reusable
-- "Core" layouts already stored in template_key). template_key is a plain
-- text column with no check constraint, so it now stores one of the 5 Core
-- keys (service, professional, commerce, local, company) instead of the
-- original 3 template keys — no migration needed for existing values since
-- historical orders are pre-launch test data only.

alter table public.fastweb_orders
  add column if not exists category_key text;

create index if not exists fastweb_orders_category_key_idx
  on public.fastweb_orders(category_key)
  where category_key is not null;
