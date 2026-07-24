-- Araaye analytics contract v1: identity, canonical taxonomy and KPI-ready views.

alter table public.analytics_events add column if not exists event_id uuid;
alter table public.analytics_events add column if not exists canonical_event_name text;
alter table public.analytics_events add column if not exists schema_version int not null default 1;
alter table public.analytics_events add column if not exists visitor_id uuid;
alter table public.analytics_events add column if not exists session_id uuid;
alter table public.analytics_events add column if not exists product_area text;
alter table public.analytics_events add column if not exists funnel_stage text;
alter table public.analytics_events add column if not exists client_ts timestamptz;
alter table public.analytics_events add column if not exists value numeric;
alter table public.analytics_events add column if not exists currency text;
alter table public.analytics_events add column if not exists referrer text;
alter table public.analytics_events add column if not exists first_utm_source text;
alter table public.analytics_events add column if not exists first_utm_medium text;
alter table public.analytics_events add column if not exists first_utm_campaign text;
alter table public.analytics_events add column if not exists first_utm_content text;
alter table public.analytics_events add column if not exists first_utm_term text;
alter table public.analytics_events add column if not exists last_utm_source text;
alter table public.analytics_events add column if not exists last_utm_medium text;
alter table public.analytics_events add column if not exists last_utm_campaign text;
alter table public.analytics_events add column if not exists last_utm_content text;
alter table public.analytics_events add column if not exists last_utm_term text;
alter table public.analytics_events add column if not exists landing_page text;
alter table public.analytics_events add column if not exists first_landing_page text;
alter table public.analytics_events add column if not exists initial_referrer text;
alter table public.analytics_events add column if not exists traffic_type text;
alter table public.analytics_events add column if not exists click_id_type text;
alter table public.analytics_events add column if not exists has_click_id boolean not null default false;

alter table public.page_views add column if not exists first_utm_source text;
alter table public.page_views add column if not exists first_utm_medium text;
alter table public.page_views add column if not exists first_utm_campaign text;
alter table public.page_views add column if not exists last_utm_source text;
alter table public.page_views add column if not exists last_utm_medium text;
alter table public.page_views add column if not exists last_utm_campaign text;
alter table public.page_views add column if not exists landing_page text;
alter table public.page_views add column if not exists first_landing_page text;
alter table public.page_views add column if not exists initial_referrer text;
alter table public.page_views add column if not exists traffic_type text;

update public.analytics_events
set canonical_event_name = case event_name
  when 'cta_click' then 'cta_clicked'
  when 'generate_lead' then 'lead_submitted'
  when 'lead_submit' then 'lead_submitted'
  when 'sign_up' then 'signup_completed'
  when 'ai_signup_start' then 'signup_started'
  when 'begin_checkout' then 'checkout_started'
  when 'purchase' then 'purchase_completed'
  when 'pkg_selected' then 'plan_selected'
  when 'phone_click' then 'phone_clicked'
  when 'whatsapp_click' then 'whatsapp_clicked'
  else event_name
end
where canonical_event_name is null;

alter table public.analytics_events alter column canonical_event_name set not null;

update public.analytics_events
set product_area = case
  when page like '/ai%' or page in ('ai', 'ai_pricing') then 'ai'
  when page like '/app%' then 'growth_hub'
  when page like '/fastweb%' or page like '/s/%' then 'fastweb'
  when page like '/adready%' or page like '/campaign/%' then 'adready'
  when page like '/website%' then 'website_design'
  when page like '/seo%' or page like '/free-seo-audit%' then 'seo'
  when page like '/doctors%' or page like '/clinic%' or page like '/demo%' then 'healthcare'
  when page like '/googlesabt%' or page like '/local-seo-check%' then 'local_seo'
  when page like '/bizcard%' or page like '/b/%' or page like '/qr%'
    or page like '/shortener%' or page like '/review-link%' then 'free_tools'
  when page like '/blog%' or page like '/prompts%' then 'content'
  when source = 'growth_hub' then 'growth_hub'
  else 'marketing_site'
end
where product_area is null;

update public.analytics_events
set funnel_stage = case
  when canonical_event_name like '%purchase%'
    or canonical_event_name like '%payment_success%'
    or canonical_event_name like '%subscription%' then 'revenue'
  when canonical_event_name like '%lead%'
    or canonical_event_name in ('demo_requested', 'contact_submitted') then 'lead'
  when canonical_event_name like '%checkout%'
    or canonical_event_name like '%plan_selected%'
    or canonical_event_name like '%pricing%'
    or canonical_event_name like '%form_started%' then 'intent'
  when canonical_event_name like '%first_key_action%'
    or canonical_event_name like '%onboarding_completed%'
    or canonical_event_name like '%activation%' then 'activation'
  when canonical_event_name like '%click%'
    or canonical_event_name like '%scroll%'
    or canonical_event_name like '%feature%' then 'engagement'
  else 'awareness'
end
where funnel_stage is null;

create unique index if not exists analytics_events_event_id_uidx
  on public.analytics_events (event_id)
  where event_id is not null;
create index if not exists analytics_events_canonical_idx
  on public.analytics_events (canonical_event_name, created_at desc);
create index if not exists analytics_events_product_idx
  on public.analytics_events (product_area, created_at desc)
  where product_area is not null;
create index if not exists analytics_events_session_idx
  on public.analytics_events (session_id, created_at)
  where session_id is not null;
create index if not exists analytics_events_visitor_idx
  on public.analytics_events (visitor_id, created_at)
  where visitor_id is not null;

create or replace view public.analytics_product_kpis_daily
with (security_invoker = true)
as
select
  date_trunc('day', created_at)::date as day,
  coalesce(product_area, 'unknown') as product_area,
  count(distinct visitor_id) filter (where canonical_event_name = 'page_view') as unique_visitors,
  count(distinct session_id) filter (
    where canonical_event_name in (
      'cta_clicked', 'internal_link_clicked', 'outbound_link_clicked',
      'form_started', 'scroll_depth', 'feature_used'
    )
  ) as engaged_sessions,
  count(*) filter (where canonical_event_name = 'lead_submitted') as leads,
  count(*) filter (where canonical_event_name = 'signup_completed') as signups,
  count(*) filter (where canonical_event_name = 'checkout_started') as checkouts,
  count(*) filter (where canonical_event_name = 'purchase_completed') as purchases,
  coalesce(sum(value) filter (where canonical_event_name = 'purchase_completed'), 0) as revenue
from public.analytics_events
group by 1, 2;

create or replace view public.analytics_funnel_daily
with (security_invoker = true)
as
select
  date_trunc('day', created_at)::date as day,
  coalesce(product_area, 'unknown') as product_area,
  count(distinct session_id) filter (where canonical_event_name = 'page_view') as sessions,
  count(distinct session_id) filter (where canonical_event_name = 'cta_clicked') as cta_sessions,
  count(distinct session_id) filter (where canonical_event_name = 'form_started') as form_start_sessions,
  count(distinct session_id) filter (where canonical_event_name = 'lead_submitted') as lead_sessions,
  count(distinct session_id) filter (where canonical_event_name = 'checkout_started') as checkout_sessions,
  count(distinct session_id) filter (where canonical_event_name = 'purchase_completed') as purchase_sessions
from public.analytics_events
group by 1, 2;

create or replace view public.analytics_data_quality_daily
with (security_invoker = true)
as
select
  date_trunc('day', created_at)::date as day,
  count(*) as total_events,
  count(*) filter (where event_id is null) as missing_event_id,
  count(*) filter (where visitor_id is null) as missing_visitor_id,
  count(*) filter (where session_id is null) as missing_session_id,
  count(*) filter (where product_area is null) as missing_product_area,
  count(*) filter (where canonical_event_name is null) as missing_canonical_name
from public.analytics_events
group by 1;

revoke all on public.analytics_product_kpis_daily from anon, authenticated;
revoke all on public.analytics_funnel_daily from anon, authenticated;
revoke all on public.analytics_data_quality_daily from anon, authenticated;
grant select on public.analytics_product_kpis_daily to service_role;
grant select on public.analytics_funnel_daily to service_role;
grant select on public.analytics_data_quality_daily to service_role;
