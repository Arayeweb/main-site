-- FastWeb / سایت فوری آرایه — MVP orders + semi-manual fulfillment.

create table if not exists public.fastweb_orders (
  id                   uuid primary key default gen_random_uuid(),
  access_token         text not null unique,
  slug                 text not null unique,
  phone                text,
  business_name        text,
  package              text not null default 'fast'
                         check (package in ('fast', 'plus')),
  amount_toman         integer not null default 4900000,
  payment_status       text not null default 'draft'
                         check (payment_status in ('draft', 'pending', 'paid', 'failed')),
  fulfillment_status   text not null default 'draft'
                         check (fulfillment_status in (
                           'draft',
                           'received',
                           'copy_structure',
                           'design',
                           'qa',
                           'first_version',
                           'awaiting_approval',
                           'published'
                         )),
  brief                jsonb not null default '{}'::jsonb,
  preview_content      jsonb not null default '{}'::jsonb,
  published_content    jsonb not null default '{}'::jsonb,
  template_key         text,
  style_key            text,
  brand_color          text,
  revision_count       integer not null default 0,
  revision_notes       text,
  domain_request       text,
  admin_notes          text,
  zibal_track_id       text,
  paid_at              timestamptz,
  published_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists fastweb_orders_payment_created_idx
  on public.fastweb_orders(payment_status, created_at desc);
create index if not exists fastweb_orders_fulfillment_created_idx
  on public.fastweb_orders(fulfillment_status, created_at desc);
create index if not exists fastweb_orders_phone_idx
  on public.fastweb_orders(phone)
  where phone is not null;
create index if not exists fastweb_orders_public_slug_idx
  on public.fastweb_orders(slug)
  where fulfillment_status in ('first_version', 'awaiting_approval', 'published');

create or replace function public.fastweb_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists fastweb_orders_set_updated_at on public.fastweb_orders;
create trigger fastweb_orders_set_updated_at
before update on public.fastweb_orders
for each row execute function public.fastweb_set_updated_at();

alter table public.fastweb_orders enable row level security;

revoke all on public.fastweb_orders from anon, authenticated;
