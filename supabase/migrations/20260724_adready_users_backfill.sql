-- Repair: backfill adready_users for campaign owners if 20260723 FK step failed.
-- Safe to run multiple times.

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

-- Ensure FK points at adready_users (idempotent).
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
