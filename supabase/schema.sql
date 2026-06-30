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
-- منابع معتبر source: 'multistep_form' | 'chatbot' | 'hero_form' | 'telegram_bot' | 'partner_signup_form'
-- partner_signup_form: لیدهای صفحه همکاری در فروش (/hamkari)
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

-- =========================================================
-- نقش‌بندی کاربران پنل مدیریت
-- =========================================================

create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  email         text not null unique,
  name          text,
  role          text not null default 'sales', -- admin | sales | support
  password_hash text not null,                 -- scrypt$...$...
  is_active     boolean not null default true,
  last_login_at timestamptz
);

alter table public.admin_users enable row level security;

-- =========================================================
-- CRM فروش: وضعیت پایپ‌لاین، مالک لید و فعالیت‌ها
-- =========================================================

-- ستون‌های CRM روی جدول leads (برای جدول‌های موجود اضافه می‌شوند):
-- crm_status: new | contacted | qualified | proposal | won | lost
alter table public.leads add column if not exists crm_status text not null default 'new';
alter table public.leads add column if not exists owner_id uuid references public.admin_users (id) on delete set null;
alter table public.leads add column if not exists next_followup_at timestamptz;
alter table public.leads add column if not exists crm_note text;            -- آخرین یادداشت کوتاه
alter table public.leads add column if not exists crm_updated_at timestamptz;
alter table public.leads add column if not exists company text;             -- نام کسب‌وکار مشتری (ورود دستی)

create index if not exists leads_crm_status_idx on public.leads (crm_status);
create index if not exists leads_owner_idx on public.leads (owner_id);
create index if not exists leads_followup_idx on public.leads (next_followup_at);
-- منبع 'manual_entry': لیدهایی که تیم فروش دستی از منابع مختلف وارد می‌کند.

-- تاریخچهٔ فعالیت روی هر لید (یادداشت، تماس، تغییر وضعیت)
create table if not exists public.lead_activities (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  author_id   uuid references public.admin_users (id) on delete set null,
  author_name text,                                  -- اسنپ‌شات نام نویسنده برای نمایش
  kind        text not null default 'note',          -- note | call | status_change | followup
  body        text
);

create index if not exists lead_activities_lead_idx on public.lead_activities (lead_id, created_at desc);

alter table public.lead_activities enable row level security;

-- =========================================================
-- لینک‌کوتاه‌کن (URL shortener) برای لینک‌های UTM‌دار طولانی
-- =========================================================
-- لینک کامل با UTM در target_url ذخیره می‌شود؛ کاربر فقط /s/<slug> را به اشتراک می‌گذارد.
-- مسیر /s/<slug> به مقصد ریدایرکت و شمارنده‌ی کلیک را یکی زیاد می‌کند.
create table if not exists public.short_links (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  slug        text not null unique,        -- کد کوتاه (a-z 0-9 - _)
  target_url  text not null,               -- لینک کامل مقصد (همراه UTM)
  title       text,                        -- یادداشت کوتاه برای شناسایی در پنل
  clicks      int not null default 0,
  is_active   boolean not null default true,
  created_by  uuid references public.admin_users (id) on delete set null
);

create index if not exists short_links_slug_idx on public.short_links (slug);

-- RLS فعال و بدون policy عمومی: فقط service_role (API سمت سرور) دسترسی دارد.
alter table public.short_links enable row level security;

-- =========================================================
-- فاکتور و پیش‌فاکتور
-- =========================================================
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  invoice_number  text not null unique,              -- شماره فاکتور، مثلاً INV-1001 یا PRO-1001
  kind            text not null default 'invoice',   -- invoice | proforma
  status          text not null default 'draft',     -- draft | sent | paid | cancelled
  issue_date      date not null default current_date,
  due_date        date,
  customer_name   text not null,
  customer_contact text,                             -- موبایل یا ایمیل
  customer_address text,
  project_id      uuid references public.support_projects (id) on delete set null,
  items           jsonb not null default '[]',       -- [{title,qty,unit_price,discount,tax}]
  discount_total  numeric(14,0) not null default 0,
  tax_total       numeric(14,0) not null default 0,
  subtotal        numeric(14,0) not null default 0,
  grand_total     numeric(14,0) not null default 0,
  currency        text not null default 'IRR',       -- IRR | USD
  note            text,
  terms           text,
  created_by      uuid references public.admin_users (id) on delete set null,
  paid_at         timestamptz,
  raw             jsonb
);

create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists invoices_kind_idx on public.invoices (kind);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_project_idx on public.invoices (project_id);

alter table public.invoices enable row level security;

-- =========================================================
-- پنل تبلیغات: ثبت و تحلیل داده‌های کمپین‌های تبلیغاتی
-- =========================================================
create table if not exists public.ad_campaigns (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  date          date not null,                          -- تاریخ داده
  platform      text not null,                          -- instagram | google | telegram | other
  campaign_name text,                                   -- نام کمپین
  spend         numeric(14,0) not null default 0,       -- هزینه
  impressions   int not null default 0,                 -- تعداد نمایش
  clicks        int not null default 0,                 -- تعداد کلیک
  leads         int not null default 0,                 -- تعداد لید/تبدیل
  currency      text not null default 'IRR',            -- IRR | USD
  note          text,
  created_by    uuid references public.admin_users (id) on delete set null
);

create index if not exists ad_campaigns_date_idx on public.ad_campaigns (date desc);
create index if not exists ad_campaigns_platform_idx on public.ad_campaigns (platform);

alter table public.ad_campaigns enable row level security;

-- =========================================================
-- کارت ویزیت آنلاین (bizcard)
-- =========================================================
create table if not exists public.bizcards (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  slug          text not null unique,
  business_name text not null,
  category      text,
  phone         text,
  maps_url      text,
  neshan_url    text,
  balad_url     text,
  address       text,
  instagram     text,
  telegram      text,
  website       text,
  hours         text,
  logo_url      text,
  theme_color   text not null default 'blue',
  is_active     boolean not null default true
);

-- مهاجرت برای جدول‌های موجود (اگر جدول از قبل وجود داشته باشد):
alter table public.bizcards add column if not exists logo_url text;
alter table public.bizcards add column if not exists theme_color text not null default 'blue';
alter table public.bizcards add column if not exists neshan_url text;
alter table public.bizcards add column if not exists balad_url text;

-- ساخت bucket آپلود تصویر در Supabase Dashboard → Storage:
--   نام: bizcards   |   Public bucket: فعال   |   Max file size: 3MB
-- یا از SQL Editor:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bizcards', 'bizcards', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create index if not exists bizcards_slug_idx on public.bizcards (slug);
create index if not exists bizcards_active_idx on public.bizcards (is_active);
alter table public.bizcards enable row level security;

-- =========================================================
-- اتاق فکر هوشمند آرایه (Araaye AI)
-- araaye.com/ai — سیستم چت چند مدلی
-- =========================================================

create table if not exists public.ai_users (
  id               uuid primary key default gen_random_uuid(),
  phone            text not null unique,         -- 09xxxxxxxxx
  password_hash    text not null,                -- scrypt$...$...
  plan             text not null default 'free', -- free | pro | business
  credits          int  not null default 5,      -- اعتبار باقی‌مانده
  brainstorm_demos int  not null default 2,      -- دمو رایگان همفکری برای کاربر free
  created_at       timestamptz default now(),
  last_login_at    timestamptz
);
create index if not exists ai_users_phone_idx on public.ai_users (phone);
alter table public.ai_users enable row level security;

create table if not exists public.ai_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.ai_users(id) on delete cascade,
  title      text,
  mode       text not null,  -- quick | brainstorm | critique
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists ai_conversations_user_idx on public.ai_conversations (user_id, created_at desc);
alter table public.ai_conversations enable row level security;

create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role            text not null,  -- user | assistant
  content         text not null,
  created_at      timestamptz default now()
);
create index if not exists ai_messages_conv_idx on public.ai_messages (conversation_id, created_at);
alter table public.ai_messages enable row level security;

create table if not exists public.ai_responses (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.ai_messages(id) on delete cascade,
  mode        text not null,
  agent_role  text not null,
  -- quick: "quick"
  -- brainstorm: "logical_analyst"|"exec_advisor"|"risk_critic"|"creative"|"synthesizer"
  -- critique: "initial"|"accuracy_critic"|"logic_critic"|"practical_critic"|"final_improved"
  content     text not null,
  order_index int  not null default 0,
  model_name  text,
  created_at  timestamptz default now()
);
create index if not exists ai_responses_msg_idx on public.ai_responses (message_id, order_index);
alter table public.ai_responses enable row level security;

create table if not exists public.ai_usage (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.ai_users(id),
  conversation_id uuid,
  mode            text,
  tokens_used     int,
  cost_usd        numeric(10,6),
  created_at      timestamptz default now()
);
create index if not exists ai_usage_user_idx on public.ai_usage (user_id, created_at desc);
alter table public.ai_usage enable row level security;

-- =========================================================
-- سیستم معرفی (Referral / Affiliate)
-- =========================================================
-- مشتریان کد معرفی می‌گیرند و برای هر معرفی موفق ۱۰۰ هزار تومان تخفیف می‌گیرند.
create table if not exists public.referrals (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  code             text not null unique,           -- ARY-XXXXXX
  referrer_name    text,
  referrer_phone   text not null,                  -- موبایل معرفی‌کننده
  status           text not null default 'active', -- active | paused | redeemed
  referral_count   int  not null default 0,        -- تعداد معرفی‌های موفق
  reward_earned    numeric(14,0) not null default 0, -- مبلغ تخفیف کسب‌شده (تومان)
  last_referral_at timestamptz,
  raw              jsonb
);

create index if not exists referrals_code_idx on public.referrals (code);
create index if not exists referrals_phone_idx on public.referrals (referrer_phone);
alter table public.referrals enable row level security;

-- =========================================================
-- کارت ویزیت — فلو لیدگیری (بدون OTP)
-- =========================================================
-- فیلدهای اضافه روی bizcards برای فرم کوتاه اولیه (شهر + واتساپ)
alter table public.bizcards add column if not exists city     text;
alter table public.bizcards add column if not exists whatsapp text;

-- لیدهای فروش‌محور حاصل از کارت ویزیت.
-- هر کارت بعد از ساخت می‌تواند یک ردیف لید داشته باشد که با
-- جواب سوال‌های لیدگیری و درخواست سرویس به‌روزرسانی می‌شود.
create table if not exists public.bizcard_leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  bizcard_id        uuid references public.bizcards (id) on delete set null,
  slug              text,
  business_name     text not null,
  phone             text,
  category          text,
  city              text,
  -- جواب سوال‌های لیدگیری
  has_site          boolean,                 -- سایت دارد؟
  site_url          text,
  has_googlemap     text,                    -- yes | no | unknown
  wants_google      boolean,                 -- می‌خواهد از گوگل مشتری بگیرد؟
  wants_review      boolean,                 -- بررسی رایگان توسط مشاور آرایه؟
  -- درخواست سرویس
  requested_service text,                    -- website | googlemap | seo | null
  -- امتیاز و وضعیت فروش
  lead_score        int  not null default 0,
  sales_status      text not null default 'new', -- new|auto_followed|contacted|interested|proposal_sent|won|lost|not_answered
  last_followup_at  timestamptz,
  source            text not null default 'bizcard',
  raw               jsonb
);

create index if not exists bizcard_leads_created_idx  on public.bizcard_leads (created_at desc);
create index if not exists bizcard_leads_status_idx   on public.bizcard_leads (sales_status);
create index if not exists bizcard_leads_score_idx    on public.bizcard_leads (lead_score desc);
create index if not exists bizcard_leads_bizcard_idx  on public.bizcard_leads (bizcard_id);
create index if not exists bizcard_leads_phone_idx    on public.bizcard_leads (phone);
alter table public.bizcard_leads enable row level security;
