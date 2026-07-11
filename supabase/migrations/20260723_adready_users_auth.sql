-- AdReady standalone auth — separate from ai_users.
-- Backfills campaign owners into adready_users before repointing FKs.

create table if not exists public.adready_users (
  id              uuid primary key default gen_random_uuid(),
  phone           text not null unique,
  password_hash   text not null,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  status          text not null default 'active'
                    check (status in ('active', 'suspended', 'banned')),
  last_login_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists adready_users_phone_idx
  on public.adready_users (phone);

create index if not exists adready_users_created_idx
  on public.adready_users (created_at desc);

-- Copy owners referenced by existing AdReady rows (preserves user_id UUIDs).
insert into public.adready_users (
  id,
  phone,
  password_hash,
  utm_source,
  utm_medium,
  utm_campaign,
  status,
  last_login_at,
  created_at,
  updated_at
)
select
  u.id,
  u.phone,
  u.password_hash,
  u.utm_source,
  u.utm_medium,
  u.utm_campaign,
  coalesce(nullif(u.status, ''), 'active'),
  u.last_login_at,
  coalesce(u.created_at, now()),
  coalesce(u.created_at, now())
from public.ai_users u
where u.id in (
  select user_id from public.campaign_pages
  union
  select user_id from public.campaign_leads
)
on conflict (id) do nothing;

-- Repoint campaign ownership to adready_users.
alter table public.campaign_pages
  drop constraint if exists campaign_pages_user_id_fkey;

alter table public.campaign_pages
  add constraint campaign_pages_user_id_fkey
  foreign key (user_id) references public.adready_users(id) on delete cascade;

alter table public.campaign_leads
  drop constraint if exists campaign_leads_user_id_fkey;

alter table public.campaign_leads
  add constraint campaign_leads_user_id_fkey
  foreign key (user_id) references public.adready_users(id) on delete cascade;
