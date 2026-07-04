-- =========================================================
-- GTM / analytics events — backend storage for pushGtmEvent
-- =========================================================

create table if not exists public.analytics_events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  event_name   text not null,
  page         text,
  source       text,
  location     text,
  package      text,
  promo_code   text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,
  payload      jsonb,
  user_agent   text
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_page_idx
  on public.analytics_events (page, created_at desc)
  where page is not null;

create index if not exists analytics_events_source_idx
  on public.analytics_events (source, created_at desc)
  where source is not null;

alter table public.analytics_events enable row level security;
