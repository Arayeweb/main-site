-- جدول لیدها برای فرم چندمرحله‌ای و چت‌بات سایت آرایه.
-- در داشبورد Supabase → SQL Editor اجرا کنید.

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  source       text not null,           -- 'multistep_form' | 'chatbot' | 'hero_form'
  page         text,                    -- index | clinic | doctors | restaurant
  name         text,
  contact      text not null,           -- موبایل (09xxxxxxxxx) یا ایمیل
  goal         text,
  budget       text,
  plan         text,
  channel      text,
  sitetype     text,
  intent       text,                    -- مخصوص چت‌بات
  detail       text,                    -- مخصوص چت‌بات
  consent      boolean default true,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,
  referrer     text,
  raw          jsonb,                   -- کل payload خام برای اطمینان
  user_agent   text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_utm_source_idx on public.leads (utm_source);

-- مهاجرت ستون‌های UTM برای جداول موجود:
alter table public.leads add column if not exists utm_source text;
alter table public.leads add column if not exists utm_medium text;
alter table public.leads add column if not exists utm_campaign text;
alter table public.leads add column if not exists utm_content text;
alter table public.leads add column if not exists utm_term text;
alter table public.leads add column if not exists referrer text;

-- بازدیدهای صفحات با UTM (فقط وقتی utm_source داشته باشد ثبت می‌شود)
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

-- RLS فعال و بدون policy عمومی:
-- مرورگر/anon نمی‌تواند مستقیم بنویسد یا بخواند. فقط service_role (API route سمت سرور) دسترسی دارد.
alter table public.leads enable row level security;

-- =========================================================
-- پنل پشتیبانی: پروژه‌های مشتریان و تیکت‌ها
-- =========================================================

-- پروژه‌های مشتری: مشتری با project_code + contact وضعیت را پیگیری می‌کند.
create table if not exists public.support_projects (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  project_code          text not null unique,        -- کدی که به مشتری داده می‌شود (مثلا ARY-1024)
  access_password       text,                         -- هش scrypt رمز ورود مشتری (lib/auth.ts)
  customer_name         text,
  customer_contact      text,                         -- موبایل (09xxxxxxxxx) یا ایمیل (اختیاری)
  title                 text,                         -- عنوان پروژه
  service_type          text,                         -- 'website' | 'landing' | 'chatbot' | 'other'
  status                text not null default 'intake',
  -- intake | design | development | review | delivered | paused
  progress_percent      int not null default 0,
  estimated_delivery_at date,
  last_note             text,
  raw                   jsonb
);

-- مهاجرت برای جدول‌های موجود (create table if not exists ستون جدید اضافه نمی‌کند):
alter table public.support_projects add column if not exists access_password text;
alter table public.support_projects alter column customer_contact drop not null;

create index if not exists support_projects_code_idx on public.support_projects (project_code);
create index if not exists support_projects_contact_idx on public.support_projects (customer_contact);

-- تیکت‌های پشتیبانی
create table if not exists public.support_tickets (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  ticket_code      text not null unique,             -- کد تیکت (مثلا TK-93F1)
  project_id       uuid references public.support_projects (id) on delete set null,
  customer_name    text,
  customer_contact text not null,
  subject          text not null,
  category         text,                              -- 'technical' | 'billing' | 'content' | 'other'
  priority         text not null default 'normal',    -- low | normal | high | urgent
  status           text not null default 'open',      -- open | in_progress | answered | closed
  message          text not null,
  user_agent       text,
  raw              jsonb
);

create index if not exists support_tickets_created_at_idx on public.support_tickets (created_at desc);
create index if not exists support_tickets_contact_idx on public.support_tickets (customer_contact);
create index if not exists support_tickets_project_idx on public.support_tickets (project_id);

-- RLS فعال و بدون policy عمومی: فقط service_role (API سمت سرور) دسترسی دارد.
alter table public.support_projects enable row level security;
alter table public.support_tickets enable row level security;
