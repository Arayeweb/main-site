-- AdReady / کمپین‌ساز آرایه — Phase 1 backend foundation.
-- Additive and safe to run after the existing ai_users migration.

create table if not exists public.campaign_pages (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.ai_users(id) on delete cascade,
  title                text not null,
  slug                 text not null unique,
  status               text not null default 'draft'
                         check (status in ('draft', 'preview', 'published', 'archived')),
  plan                 text not null default 'free'
                         check (plan in ('free', 'starter', 'pro', 'business', 'done_for_you')),
  goal                 text,
  business_name        text,
  business_type        text,
  city                 text,
  website_or_instagram text,
  contact_phone        text,
  whatsapp_number      text,
  telegram_username    text,
  product_or_service_name text,
  short_description    text,
  price_range          text,
  main_benefit         text,
  target_audience      text,
  campaign_channel     text,
  campaign_tone        text,
  template_key         text,
  theme_key            text,
  generated_content    jsonb not null default '{}'::jsonb,
  custom_content       jsonb not null default '{}'::jsonb,
  seo_visibility       boolean not null default false,
  published_at         timestamptz,
  expires_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists campaign_pages_user_created_idx
  on public.campaign_pages(user_id, created_at desc);
create index if not exists campaign_pages_public_idx
  on public.campaign_pages(slug)
  where status = 'published';

create table if not exists public.campaign_leads (
  id               uuid primary key default gen_random_uuid(),
  campaign_page_id uuid not null references public.campaign_pages(id) on delete cascade,
  user_id          uuid not null references public.ai_users(id) on delete cascade,
  full_name        text not null,
  phone            text not null,
  email            text,
  message          text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_content      text,
  utm_term         text,
  referrer         text,
  page_path        text,
  status           text not null default 'new'
                     check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists campaign_leads_owner_created_idx
  on public.campaign_leads(user_id, created_at desc);
create index if not exists campaign_leads_page_created_idx
  on public.campaign_leads(campaign_page_id, created_at desc);

create table if not exists public.campaign_events (
  id               uuid primary key default gen_random_uuid(),
  campaign_page_id uuid not null references public.campaign_pages(id) on delete cascade,
  visitor_id       text not null,
  event_name       text not null,
  payload          jsonb not null default '{}'::jsonb,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_content      text,
  utm_term         text,
  referrer         text,
  page_path        text,
  created_at       timestamptz not null default now()
);

create index if not exists campaign_events_page_created_idx
  on public.campaign_events(campaign_page_id, created_at desc);
create index if not exists campaign_events_name_created_idx
  on public.campaign_events(event_name, created_at desc);

create or replace function public.adready_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists campaign_pages_set_updated_at on public.campaign_pages;
create trigger campaign_pages_set_updated_at
before update on public.campaign_pages
for each row execute function public.adready_set_updated_at();

drop trigger if exists campaign_leads_set_updated_at on public.campaign_leads;
create trigger campaign_leads_set_updated_at
before update on public.campaign_leads
for each row execute function public.adready_set_updated_at();

alter table public.campaign_pages enable row level security;
alter table public.campaign_leads enable row level security;
alter table public.campaign_events enable row level security;

-- Application APIs use the service-role client and enforce ownership in every
-- query. Direct browser access remains unavailable.
revoke all on public.campaign_pages from anon, authenticated;
revoke all on public.campaign_leads from anon, authenticated;
revoke all on public.campaign_events from anon, authenticated;
