-- AdReady paid publishing and Zibal order history.

update public.campaign_pages
set plan = 'free'
where plan = 'done_for_you';

alter table public.campaign_pages
  drop constraint if exists campaign_pages_plan_check;

alter table public.campaign_pages
  add constraint campaign_pages_plan_check
  check (plan in ('free', 'starter', 'pro', 'business', 'monthly', 'lifetime'));

alter table public.campaign_pages
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'failed')),
  add column if not exists active_package text
    check (active_package is null or active_package in ('monthly', 'lifetime')),
  add column if not exists paid_at timestamptz;

create table if not exists public.adready_orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.ai_users(id) on delete cascade,
  campaign_page_id uuid not null references public.campaign_pages(id) on delete cascade,
  package          text not null check (package in ('monthly', 'lifetime')),
  amount_toman     integer not null check (amount_toman > 0),
  list_amount_toman integer not null check (list_amount_toman >= amount_toman),
  payment_status   text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed')),
  zibal_track_id   text not null unique,
  paid_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists adready_orders_user_created_idx
  on public.adready_orders(user_id, created_at desc);
create index if not exists adready_orders_campaign_created_idx
  on public.adready_orders(campaign_page_id, created_at desc);

drop trigger if exists adready_orders_set_updated_at on public.adready_orders;
create trigger adready_orders_set_updated_at
before update on public.adready_orders
for each row execute function public.adready_set_updated_at();

alter table public.adready_orders enable row level security;
revoke all on public.adready_orders from anon, authenticated;
