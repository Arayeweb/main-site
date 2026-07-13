-- FastWeb promo codes + order discount columns

create table if not exists public.fastweb_promo_codes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  code         text not null unique,
  kind         text not null default 'percent' check (kind in ('percent', 'fixed')),
  value        numeric(14,0) not null,
  max_uses     int not null default 1000,
  used_count   int not null default 0,
  expires_at   timestamptz,
  active       boolean not null default true
);

create index if not exists fastweb_promo_codes_code_idx
  on public.fastweb_promo_codes (upper(code));

alter table public.fastweb_promo_codes enable row level security;
revoke all on public.fastweb_promo_codes from anon, authenticated;

alter table public.fastweb_orders
  add column if not exists promo_code text,
  add column if not exists discount_toman integer not null default 0;
