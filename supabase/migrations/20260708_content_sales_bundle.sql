-- Araaye AI Content & Sales Bundle — سفارش‌ها

create table if not exists public.content_sales_orders (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  buyer_name        text not null,
  buyer_phone       text not null,
  buyer_email       text,
  amount_toman      int not null,
  zibal_track_id    text unique,
  status            text not null default 'pending',
  paid_at           timestamptz,
  access_token      text unique not null,
  ai_user_id        uuid references public.ai_users(id) on delete set null,
  temp_password     text,
  raw               jsonb
);

create index if not exists content_sales_orders_phone_idx on public.content_sales_orders (buyer_phone, created_at desc);
create index if not exists content_sales_orders_track_idx on public.content_sales_orders (zibal_track_id);
create index if not exists content_sales_orders_token_idx on public.content_sales_orders (access_token);
alter table public.content_sales_orders enable row level security;
