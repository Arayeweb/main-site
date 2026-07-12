-- فرم بریف پروژه طراحی سایت (website_project_briefs)
-- تاریخ: 2026-07-11

create table if not exists public.website_project_briefs (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  status                      text not null default 'new'
    check (status in ('new', 'contacted', 'proposal_preparing', 'proposal_sent', 'won', 'lost')),
  form_version                text not null default 'v1',
  primary_service             text not null default 'website_design'
    check (primary_service = 'website_design'),

  business_name               text not null,
  business_summary            text not null,
  customer_scope              text not null,
  primary_location            text,

  primary_conversion_goal     text not null,
  required_sections           jsonb not null default '[]'::jsonb,
  booking_type                text,
  estimated_product_count     text,
  required_languages          text,

  acquisition_channels        jsonb not null default '[]'::jsonb,
  current_assets              jsonb not null default '[]'::jsonb,
  current_website_url         text,

  primary_business_problem    text not null,
  confirmation_branch         text,
  google_maps_status          text,
  google_lead_status          text,
  advertising_status          text,
  customer_guidance_need      text,
  lead_followup_status        text,

  content_readiness           text not null,
  contact_name                text not null,
  contact_phone               text not null,
  additional_notes            text,

  recommended_service         text not null,
  recommendation_reason_code  text not null,
  recommendation_template_id  text not null,
  recommendation_interest     boolean,

  source_page                 text,
  referrer                    text,
  utm_source                  text,
  utm_medium                  text,
  utm_campaign                text,
  utm_content                 text,
  utm_term                    text,

  submission_token            text not null unique,
  internal_notes              text
);

create index if not exists website_project_briefs_created_idx
  on public.website_project_briefs (created_at desc);
create index if not exists website_project_briefs_status_idx
  on public.website_project_briefs (status);
create index if not exists website_project_briefs_recommended_idx
  on public.website_project_briefs (recommended_service);
create index if not exists website_project_briefs_interest_idx
  on public.website_project_briefs (recommendation_interest);
create index if not exists website_project_briefs_phone_idx
  on public.website_project_briefs (contact_phone);
create index if not exists website_project_briefs_business_idx
  on public.website_project_briefs (business_name);

alter table public.website_project_briefs enable row level security;

comment on table public.website_project_briefs is 'فرم کوتاه شروع پروژه طراحی سایت با پیشنهاد خدمت مکمل';
