-- اضافه کردن جدول page_views به migrations (قبلاً فقط در schema.sql بود)
-- و اضافه کردن visitor_id برای شمارش unique visitors

create table if not exists public.page_views (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  page         text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,
  referrer     text,
  user_agent   text
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_utm_source_idx on public.page_views (utm_source);
create index if not exists page_views_utm_campaign_idx on public.page_views (utm_campaign);

alter table public.page_views enable row level security;

-- visitor_id — UUID ثابت در localStorage مرورگر برای شمارش unique visitors
alter table public.page_views add column if not exists visitor_id uuid;

create index if not exists page_views_visitor_id_idx on public.page_views (visitor_id);
