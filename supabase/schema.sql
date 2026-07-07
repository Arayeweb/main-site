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

-- رویدادهای GTM / analytics (ثبت از pushGtmEvent)
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

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name, created_at desc);

alter table public.analytics_events enable row level security;

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

-- ستون برای جلوگیری از ارسال تکراری لید به تلگرام (cron notifier)
alter table public.leads add column if not exists telegram_notified_at timestamptz;
create index if not exists leads_tg_notified_idx on public.leads (telegram_notified_at);

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
  is_active     boolean not null default true,
  updated_at    timestamptz
);

-- مهاجرت برای جدول‌های موجود (اگر جدول از قبل وجود داشته باشد):
alter table public.bizcards add column if not exists logo_url text;
alter table public.bizcards add column if not exists theme_color text not null default 'blue';
alter table public.bizcards add column if not exists neshan_url text;
alter table public.bizcards add column if not exists balad_url text;
alter table public.bizcards add column if not exists snap_url text;
alter table public.bizcards add column if not exists osm_url text;
alter table public.bizcards add column if not exists updated_at timestamptz;

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
  credits          int  not null default 20,     -- اعتبار باقی‌مانده
  brainstorm_demos int  not null default 2,      -- دمو رایگان همفکری برای کاربر free
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
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

-- ---------------------------------------------------------
-- Araaye Arena — Battle Mode (نسخه جدید araaye.com/ai)
-- ---------------------------------------------------------

-- نبردها/مقایسه‌ها: هر ردیف = یک پرامپت + پاسخ(ها) + رأی کاربر
-- حالت‌ها: نبرد ناشناس (tier=economy|standard|premium)،
-- مقایسه انتخابی (tier=side_by_side)، گفتگوی مستقیم (tier=direct — model_b/response_b خالی)
create table if not exists public.ai_battles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.ai_users(id) on delete cascade,
  guest_token  text,
  prompt       text not null,
  model_a      text not null,
  model_b      text not null default '',
  response_a   text not null,
  response_b   text not null default '',
  tier         text not null default 'economy',
  mode_kind    text not null default 'text',
  credit_cost  int  not null default 1,
  cost_usd     numeric(10,6),
  tokens_used  int,
  winner       text,
  voted_at     timestamptz,
  is_public    boolean not null default false,
  share_slug   text unique,
  attachments  jsonb not null default '[]',
  thread_id    uuid references public.ai_battles(id) on delete cascade,
  persona_key  text,
  created_at   timestamptz default now()
);
create index if not exists ai_battles_user_idx on public.ai_battles (user_id, created_at desc);
create index if not exists ai_battles_thread_idx on public.ai_battles (thread_id, created_at asc);
create index if not exists ai_battles_share_slug_idx on public.ai_battles (share_slug) where share_slug is not null;
create index if not exists ai_battles_guest_token_idx on public.ai_battles (guest_token) where guest_token is not null;
alter table public.ai_battles enable row level security;

create table if not exists public.ai_promo_codes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  code         text not null unique,
  kind         text not null default 'percent',
  value        numeric(14,0) not null,
  max_uses     int not null default 1000,
  used_count   int not null default 0,
  expires_at   timestamptz,
  active       boolean not null default true
);
create index if not exists ai_promo_codes_code_idx on public.ai_promo_codes (upper(code));
alter table public.ai_promo_codes enable row level security;

insert into public.ai_promo_codes (code, kind, value, max_uses)
values
  ('WELCOME10', 'percent', 10, 1000),
  ('SUMMER20', 'percent', 20, 500),
  ('PAGEA20', 'percent', 20, 50),
  ('PAGEB20', 'percent', 20, 50),
  ('PAGEC20', 'percent', 20, 50),
  ('PAGED20', 'percent', 20, 50),
  ('PAGEE20', 'percent', 20, 50)
on conflict (code) do nothing;

create table if not exists public.ai_referral_codes (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  user_id          uuid not null unique references public.ai_users(id) on delete cascade,
  code             text not null unique,
  total_referrals  int not null default 0,
  credits_earned   int not null default 0
);
create index if not exists ai_referral_codes_code_idx on public.ai_referral_codes (upper(code));
alter table public.ai_referral_codes enable row level security;

create table if not exists public.ai_referral_redemptions (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  user_id           uuid not null unique references public.ai_users(id) on delete cascade,
  referral_code_id  uuid not null references public.ai_referral_codes(id) on delete cascade,
  order_id          uuid not null references public.ai_orders(id) on delete cascade
);
create index if not exists ai_referral_redemptions_code_idx on public.ai_referral_redemptions (referral_code_id);
alter table public.ai_referral_redemptions enable row level security;

-- سفارش‌های خرید پکیج اعتباری (زیبال)
create table if not exists public.ai_orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.ai_users(id) on delete cascade,
  package_id      text not null,
  amount_toman    int  not null,
  list_amount_toman int,
  discount_toman  int not null default 0,
  promo_code      text,
  referral_code   text,
  referrer_user_id uuid references public.ai_users(id) on delete set null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  credits_granted int  not null,
  zibal_track_id  text unique,
  status          text not null default 'pending',
  paid_at         timestamptz,
  created_at      timestamptz default now()
);
create index if not exists ai_orders_user_idx on public.ai_orders (user_id, created_at desc);
create index if not exists ai_orders_track_idx on public.ai_orders (zibal_track_id);
alter table public.ai_orders enable row level security;

-- Storage bucket آپلود تصویر AI (vision + image gen)
-- Dashboard → Storage → ai-uploads | Public | Max 4MB | jpeg/png/webp
-- Path: {user_id}/{uuid}.{ext} — upload فقط از API با service role
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ai-uploads', 'ai-uploads', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- تیکت‌های پشتیبانی کاربران AI (araaye.com/ai/support)
create table if not exists public.ai_support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.ai_users(id) on delete cascade,
  subject     text not null,
  body        text not null,
  status      text not null default 'open',   -- open | answered | closed
  priority    text not null default 'normal', -- low | normal | high
  admin_reply text,
  replied_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ai_support_tickets_user_idx on public.ai_support_tickets (user_id, created_at desc);
create index if not exists ai_support_tickets_status_idx on public.ai_support_tickets (status, created_at desc);
alter table public.ai_support_tickets enable row level security;

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

-- ===== پروژه‌های فریلنس (scraper ponisha + karlancer) =====
create table if not exists public.freelance_projects (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  scanned_at   timestamptz not null default now(),
  source       text not null,           -- 'ponisha' | 'karlancer'
  title        text not null,
  url          text not null,
  budget       text,
  description  text,
  status       text not null default 'new',  -- new | applied | won | lost
  applied_at   timestamptz,
  result_note  text,
  unique(source, url)
);

create index if not exists freelance_scanned_idx on public.freelance_projects (scanned_at desc);
create index if not exists freelance_status_idx  on public.freelance_projects (status);
create index if not exists freelance_source_idx  on public.freelance_projects (source);
alter table public.freelance_projects enable row level security;

-- ===== پنل عملیاتی آرایه (CRM) =====
-- see also: supabase/migrations/20250702_admin_ops.sql

create table if not exists public.crm_clients (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  name            text not null,
  client_type     text not null default 'other',
  phone           text,
  email           text,
  address         text,
  city            text,
  website         text,
  instagram       text,
  lead_source     text,
  sales_owner     text,
  project_owner   text,
  status          text not null default 'active_client',
  internal_note   text,
  total_revenue   numeric(14,0) not null default 0,
  last_contact_at timestamptz
);
create index if not exists crm_clients_status_idx on public.crm_clients (status);
create index if not exists crm_clients_name_idx on public.crm_clients (name);
alter table public.crm_clients enable row level security;

create table if not exists public.crm_tasks (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  title        text not null,
  description  text,
  project_id   uuid references public.support_projects (id) on delete set null,
  client_id    uuid references public.crm_clients (id) on delete set null,
  project_name text,
  client_name  text,
  assigned_to  text,
  priority     text not null default 'medium',
  status       text not null default 'todo',
  due_date     date,
  checklist    jsonb not null default '[]'
);
create index if not exists crm_tasks_status_idx on public.crm_tasks (status);
create index if not exists crm_tasks_due_idx on public.crm_tasks (due_date);
alter table public.crm_tasks enable row level security;

create table if not exists public.crm_contracts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  contract_number   text not null unique,
  client_id         uuid references public.crm_clients (id) on delete set null,
  client_name       text not null,
  contract_type     text not null default 'website_design',
  amount            numeric(14,0) not null default 0,
  start_date        date,
  end_date          date,
  signature_status  text not null default 'draft',
  payment_status    text not null default 'unpaid',
  scope_of_work     text,
  deliverables      jsonb not null default '[]',
  payment_terms     text,
  support_terms     text,
  project_id        uuid references public.support_projects (id) on delete set null,
  notes             text
);
create index if not exists crm_contracts_client_idx on public.crm_contracts (client_id);
create index if not exists crm_contracts_status_idx on public.crm_contracts (signature_status);
alter table public.crm_contracts enable row level security;

create table if not exists public.crm_change_requests (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  title                 text not null,
  description           text,
  client_id             uuid references public.crm_clients (id) on delete set null,
  client_name           text not null,
  project_id            uuid references public.support_projects (id) on delete set null,
  project_name          text,
  request_type          text not null default 'other',
  status                text not null default 'new',
  cost                  numeric(14,0) not null default 0,
  assigned_to           text,
  included_in_contract  boolean not null default false,
  is_paid               boolean not null default false,
  estimated_cost        numeric(14,0) not null default 0,
  estimated_time        text,
  customer_approval     text not null default 'pending'
);
create index if not exists crm_change_requests_status_idx on public.crm_change_requests (status);
alter table public.crm_change_requests enable row level security;

create table if not exists public.crm_maintenance_plans (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  client_id             uuid references public.crm_clients (id) on delete set null,
  client_name           text not null,
  plan_type             text not null default 'basic_support',
  monthly_fee           numeric(14,0) not null default 0,
  start_date            date,
  renewal_date          date,
  payment_status        text not null default 'pending',
  support_status        text not null default 'active',
  included_services     jsonb not null default '[]',
  project_id            uuid references public.support_projects (id) on delete set null,
  upsell_opportunities  jsonb not null default '[]'
);
create index if not exists crm_maintenance_status_idx on public.crm_maintenance_plans (support_status);
alter table public.crm_maintenance_plans enable row level security;

create table if not exists public.company_settings (
  id         int primary key default 1 check (id = 1),
  updated_at timestamptz not null default now(),
  data       jsonb not null default '{}'
);
alter table public.company_settings enable row level security;
insert into public.company_settings (id, data) values (1, '{}') on conflict (id) do nothing;

alter table public.support_projects add column if not exists client_id uuid references public.crm_clients (id) on delete set null;
alter table public.support_projects add column if not exists owner_name text;
alter table public.support_projects add column if not exists contract_amount numeric(14,0) default 0;
alter table public.support_projects add column if not exists payment_status text default 'unpaid';
alter table public.support_projects add column if not exists project_type text;
-- =========================================================
-- Araaye AI — پنل عملیات ادمین (app/admin/ai-ops)
-- نقش‌ها از جدول admin_users موجود استفاده می‌کنند (role می‌تواند یکی از
-- ai_superadmin | ai_finance | ai_support | ai_ops باشد — نگاه کنید به lib/auth.ts).
-- این مهاجرت فقط جداول genuinely جدید را اضافه می‌کند؛ ai_users/ai_battles/
-- ai_orders/ai_usage/ai_promo_codes/ai_support_tickets/... از قبل موجودند.
-- =========================================================

-- ---------- نقش/دسترسی ماژول‌های پنل AI-ops (برای نمایش UI/مرجع) ----------
create table if not exists public.ai_admin_permissions (
  role       text primary key,
  modules    jsonb not null default '[]', -- لیست کلید ماژول‌های مجاز
  updated_at timestamptz not null default now()
);

insert into public.ai_admin_permissions (role, modules) values
  ('ai_superadmin', '["overview","users","plans","credits","models","providers","prompts","conversations","costs","payments","coupons","tickets","notifications","content","logs","settings","team","security"]'),
  ('ai_finance',    '["overview","plans","credits","costs","payments","coupons"]'),
  ('ai_support',    '["overview","users","tickets","notifications","conversations"]'),
  ('ai_ops',        '["overview","models","providers","prompts","content","logs","settings","users"]')
on conflict (role) do update set modules = excluded.modules;

alter table public.ai_admin_permissions enable row level security;

-- ---------- لاگ حسابرسی اقدامات ادمین در پنل AI-ops ----------
create table if not exists public.ai_admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  admin_id    uuid references public.admin_users(id) on delete set null,
  admin_name  text,
  admin_role  text,
  action      text not null,          -- مثلا 'credit.grant' | 'user.suspend' | 'model.update'
  entity_type text,                   -- 'ai_users' | 'ai_model_registry' | ...
  entity_id   text,
  meta        jsonb not null default '{}'
);
create index if not exists ai_admin_audit_log_created_idx on public.ai_admin_audit_log (created_at desc);
create index if not exists ai_admin_audit_log_entity_idx on public.ai_admin_audit_log (entity_type, entity_id);
alter table public.ai_admin_audit_log enable row level security;

-- ---------- رجیستری مدل‌ها (نسخه پایگاه‌داده‌ای lib/aiModels.ts) ----------
create table if not exists public.ai_model_registry (
  id                 text primary key,      -- برابر AIModelInfo.id در lib/aiModels.ts
  route_id           text not null,
  kind               text not null,         -- direct | compare | image
  brand              text not null,
  name               text not null,
  persona_name       text,
  tier               text not null,         -- economy | mid | premium
  cost_per_1k_tokens numeric(10,6) not null default 0,
  credit_cost        int,                   -- برای مدل‌های تصویر
  enabled            boolean not null default true,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
alter table public.ai_model_registry enable row level security;

-- ---------- ارائه‌دهنده‌های API (OpenRouter و مسیرهای برند) ----------
create table if not exists public.ai_providers (
  id               text primary key,        -- 'openai' | 'anthropic' | 'google' | 'x-ai' | 'deepseek' | 'meta' | 'mistral' | 'openrouter'
  name             text not null,
  base_url         text,
  api_key_env      text,                    -- نام env var (بدون مقدار — امنیت)
  api_key_masked   text,                    -- نمایش ماسک‌شده مثل sk-...ab12
  status           text not null default 'operational', -- operational | degraded | down
  enabled          boolean not null default true,
  error_rate       numeric(6,4) not null default 0,      -- 0..1
  avg_latency_ms   int,
  uptime_percent   numeric(5,2) not null default 100,
  last_checked_at  timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.ai_providers enable row level security;

insert into public.ai_providers (id, name, base_url, status, enabled) values
  ('openai', 'OpenAI', 'https://api.openai.com', 'operational', true),
  ('anthropic', 'Anthropic', 'https://api.anthropic.com', 'operational', true),
  ('google', 'Google (Gemini)', 'https://generativelanguage.googleapis.com', 'operational', true),
  ('x-ai', 'xAI (Grok)', 'https://api.x.ai', 'operational', true),
  ('deepseek', 'DeepSeek', 'https://api.deepseek.com', 'operational', true),
  ('meta-llama', 'Meta (Llama via OpenRouter)', 'https://openrouter.ai', 'operational', true),
  ('mistralai', 'Mistral', 'https://api.mistral.ai', 'operational', true)
on conflict (id) do nothing;

-- ---------- کتابخانه پرامپت/شخصیت ----------
create table if not exists public.ai_prompt_templates (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text not null,
  category     text not null default 'persona', -- persona | system | marketing | support
  persona_key  text,                              -- مثلا 'precise' | 'critic' — اگر معادل شخصیت باشد
  content      text not null,
  is_active    boolean not null default true,
  usage_count  int not null default 0,
  created_by   uuid references public.admin_users(id) on delete set null
);
create index if not exists ai_prompt_templates_category_idx on public.ai_prompt_templates (category);
alter table public.ai_prompt_templates enable row level security;

-- ---------- اعلان‌های سیستمی/broadcast به کاربران ----------
create table if not exists public.ai_notifications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  title         text not null,
  body          text not null,
  audience      text not null default 'all',  -- all | plan | user
  target_plan   text,                          -- اگر audience=plan
  target_user_id uuid references public.ai_users(id) on delete set null, -- اگر audience=user
  status        text not null default 'draft', -- draft | scheduled | sent
  scheduled_at  timestamptz,
  sent_at       timestamptz,
  sent_count    int not null default 0,
  created_by    uuid references public.admin_users(id) on delete set null
);
create index if not exists ai_notifications_status_idx on public.ai_notifications (status, created_at desc);
alter table public.ai_notifications enable row level security;

-- ---------- دفتر کل کردیت (اعطا/کسر دستی توسط ادمین + رخدادهای سیستمی) ----------
create table if not exists public.ai_credit_ledger (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  user_id          uuid not null references public.ai_users(id) on delete cascade,
  delta            int not null,             -- مثبت = افزایش، منفی = کاهش
  balance_after    int,
  reason           text not null,            -- 'admin_grant' | 'admin_revoke' | 'package_purchase' | 'referral_bonus' | 'usage'
  note             text,
  related_order_id uuid references public.ai_orders(id) on delete set null,
  admin_id         uuid references public.admin_users(id) on delete set null
);
create index if not exists ai_credit_ledger_user_idx on public.ai_credit_ledger (user_id, created_at desc);
alter table public.ai_credit_ledger enable row level security;

-- ---------- کاتالوگ پلن (نسخه پایگاه‌داده‌ای lib/aiPackages.ts) ----------
create table if not exists public.ai_plans (
  id           text primary key,   -- free | starter | pro | business
  name         text not null,
  price_toman  int not null default 0,
  credits      int not null default 0,
  description  text,
  features     jsonb not null default '[]',
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  updated_at   timestamptz not null default now()
);
insert into public.ai_plans (id, name, price_toman, credits, description, features, is_active, is_featured) values
  ('free', 'رایگان', 0, 20, '۲۰ کردیت هدیه برای تست اولیه', '["۲۰ کردیت هدیه", "مدل‌های اقتصادی"]', true, false),
  ('starter', 'شروع', 99000, 80, 'مناسب تست و استفاده سبک', '["۸۰ کردیت", "مدل‌های اقتصادی"]', true, false),
  ('plus', 'پلاس', 249000, 240, 'مناسب استفاده روزمره', '["۲۴۰ کردیت", "مدل‌های میانی"]', true, false),
  ('pro', 'حرفه‌ای', 499000, 550, 'بهترین گزینه برای اکثر کاربران', '["۵۵۰ کردیت", "مدل‌های پیشرفته"]', true, true),
  ('max', 'مکس', 990000, 1200, 'مناسب مصرف بالا', '["۱۲۰۰ کردیت", "Sora و ۱۰۸۰p"]', true, false),
  ('team_mini', 'تیم کوچک', 1900000, 2500, 'تیم‌های کوچک', '["۲۵۰۰ کردیت", "۳ کاربر"]', true, false),
  ('business', 'سازمانی', 4900000, 6500, 'تیم و مصرف بالا', '["۶۵۰۰+ کردیت", "اتصال اختصاصی"]', true, false)
on conflict (id) do nothing;
alter table public.ai_plans enable row level security;

-- ---------- بلوک‌های محتوای قابل ویرایش (لندینگ/اعلامیه/قوانین لیدربورد) ----------
create table if not exists public.ai_content_blocks (
  id           text primary key,   -- 'landing_hero' | 'leaderboard_rules' | 'announcement_banner' | ...
  title        text not null,
  body         text not null default '',
  kind         text not null default 'markdown', -- markdown | html | json
  is_published boolean not null default true,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references public.admin_users(id) on delete set null
);
insert into public.ai_content_blocks (id, title, body, kind, is_published) values
  ('announcement_banner', 'بنر اعلامیه', '', 'markdown', false),
  ('leaderboard_rules', 'قوانین لیدربورد', 'امتیاز بر اساس تعداد رأی‌های برد در نبردهای عمومی محاسبه می‌شود.', 'markdown', true),
  ('landing_intro', 'معرفی صفحه اصلی AI', 'چند مدل هوش مصنوعی را همزمان مقایسه کن.', 'markdown', true)
on conflict (id) do nothing;
alter table public.ai_content_blocks enable row level security;

-- ---------- تنظیمات کلی پنل AI-ops (تک‌ردیفی، مثل company_settings) ----------
create table if not exists public.ai_settings (
  id         int primary key default 1 check (id = 1),
  updated_at timestamptz not null default now(),
  data       jsonb not null default '{}'
);
insert into public.ai_settings (id, data) values (1, '{
  "default_plan": "free",
  "free_signup_credits": 20,
  "rate_limit_per_minute": 12,
  "feature_flags": { "image_studio": true, "code_studio": true, "battle_mode": true, "referrals": true },
  "max_battle_cost_usd": 0.25
}') on conflict (id) do nothing;
alter table public.ai_settings enable row level security;

-- ---------- وضعیت کاربر برای تعلیق/مسدودسازی + امتیاز سوءاستفاده ----------
alter table public.ai_users add column if not exists status text not null default 'active'; -- active | suspended | banned
alter table public.ai_users add column if not exists abuse_score numeric(6,2) not null default 0;
alter table public.ai_users add column if not exists admin_note text;
create index if not exists ai_users_status_idx on public.ai_users (status);

-- ---------- نگاشت email در admin_users برای نقش‌های ai_* (فقط یادداشت) ----------
-- نقش‌های مجاز admin_users.role از این پس شامل: admin, sales, support,
-- ai_superadmin, ai_finance, ai_support, ai_ops (بدون محدودیت CHECK — ستون متنی است).

-- =========================================================
-- Orchestration (migration 20260715_ai_orchestration.sql)
-- =========================================================
-- =========================================================
-- Araaye AI orchestration — runs, model calls, outputs, votes,
-- credit reserve/settle infrastructure
-- =========================================================

-- ---------- ai_runs: یک run = یک درخواست کاربر (direct/compare/council) ----------
create table if not exists public.ai_runs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.ai_users(id) on delete cascade,
  conversation_id  uuid,                          -- thread continuity (ai_battles.thread_id سازگار)
  mode             text not null check (mode in ('direct','compare','council')),
  status           text not null default 'running'
                     check (status in ('running','completed','failed','cancelled','settlement_failed')),
  reserved_credits int  not null default 0,
  charged_credits  int  not null default 0,
  refunded_credits int  not null default 0,
  metadata         jsonb not null default '{}',
  created_at       timestamptz not null default now(),
  completed_at     timestamptz,
  constraint ai_runs_credit_nonnegative
    check (reserved_credits >= 0 and charged_credits >= 0 and refunded_credits >= 0),
  constraint ai_runs_credit_settlement_check
    check (
      (status = 'running' and charged_credits + refunded_credits <= reserved_credits)
      or status = 'settlement_failed'
      or (status in ('completed','failed','cancelled') and charged_credits + refunded_credits = reserved_credits)
    )
);

create index if not exists idx_ai_runs_user on public.ai_runs(user_id, created_at desc);
create index if not exists idx_ai_runs_status on public.ai_runs(status) where status = 'running';
create index if not exists idx_ai_runs_conversation on public.ai_runs(conversation_id, created_at desc);

-- Idempotent hardening for environments where an earlier draft of this migration
-- may already have been applied.
alter table public.ai_runs add column if not exists refunded_credits int not null default 0;
alter table public.ai_runs drop constraint if exists ai_runs_status_check;
alter table public.ai_runs
  add constraint ai_runs_status_check
  check (status in ('running','completed','failed','cancelled','settlement_failed'));
update public.ai_runs
   set refunded_credits = greatest(reserved_credits - charged_credits, 0)
 where status in ('completed','failed','cancelled')
   and charged_credits <= reserved_credits
   and charged_credits + refunded_credits <> reserved_credits;
update public.ai_runs
   set status = 'settlement_failed'
 where charged_credits < 0
    or refunded_credits < 0
    or reserved_credits < 0
    or charged_credits + refunded_credits > reserved_credits;
alter table public.ai_runs drop constraint if exists ai_runs_credit_nonnegative;
alter table public.ai_runs
  add constraint ai_runs_credit_nonnegative
  check (reserved_credits >= 0 and charged_credits >= 0 and refunded_credits >= 0);
alter table public.ai_runs drop constraint if exists ai_runs_credit_settlement_check;
alter table public.ai_runs
  add constraint ai_runs_credit_settlement_check
  check (
    (status = 'running' and charged_credits + refunded_credits <= reserved_credits)
    or status = 'settlement_failed'
    or (status in ('completed','failed','cancelled') and charged_credits + refunded_credits = reserved_credits)
  );

-- ---------- model_calls: هر تماس provider در یک run ----------
create table if not exists public.model_calls (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references public.ai_runs(id) on delete cascade,
  provider        text not null,                  -- 'openrouter' | 'openai' | ...
  model           text not null,                  -- شناسه داخلی مدل
  role            text not null default 'answer'  -- answer | critique | synthesis
                    check (role in ('answer','critique','synthesis')),
  status          text not null default 'running'
                    check (status in ('running','completed','failed','cancelled')),
  input_tokens    int,
  output_tokens   int,
  cached_tokens   int,
  cost_usd        numeric(12,8),
  credits_charged int not null default 0,
  ttft_ms         int,
  latency_ms      int,
  error_code      text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_model_calls_run on public.model_calls(run_id);
create index if not exists idx_model_calls_model on public.model_calls(model, created_at desc);

-- ---------- model_outputs: متن نهایی هر تماس ----------
create table if not exists public.model_outputs (
  id             uuid primary key default gen_random_uuid(),
  run_id         uuid not null references public.ai_runs(id) on delete cascade,
  model_call_id  uuid references public.model_calls(id) on delete set null,
  model          text not null,
  content        text not null default '',
  role           text not null default 'assistant',
  created_at     timestamptz not null default now()
);

create index if not exists idx_model_outputs_run on public.model_outputs(run_id);

-- ---------- feedback_votes: رأی کاربر روی خروجی compare/council ----------
create table if not exists public.feedback_votes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.ai_users(id) on delete cascade,
  run_id         uuid not null references public.ai_runs(id) on delete cascade,
  selected_model text,
  rating         int check (rating between 1 and 5),
  metadata       jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  unique (user_id, run_id)
);

create index if not exists idx_feedback_votes_run on public.feedback_votes(run_id);

-- ---------- ai_credit_ledger: اتصال به run و reasonهای جدید ----------
alter table public.ai_credit_ledger
  add column if not exists run_id uuid references public.ai_runs(id) on delete set null;
alter table public.ai_credit_ledger
  add column if not exists metadata jsonb not null default '{}';

create index if not exists idx_ai_credit_ledger_run on public.ai_credit_ledger(run_id);
create index if not exists idx_ai_credit_ledger_user on public.ai_credit_ledger(user_id, created_at desc);

-- reasonهای معتبر جدید (ستون text است؛ فقط مستندسازی):
-- 'reserve' | 'charge' | 'refund' | 'topup' | 'subscription_grant'
-- | 'admin_adjustment' | 'referral_bonus' | 'image_refund' | 'video_refund' | 'usage'

-- ---------- توابع اتمیک کردیت ----------

-- کسر اتمیک: فقط اگر موجودی کافی باشد کم می‌کند و موجودی جدید را برمی‌گرداند.
-- در صورت کمبود موجودی null برمی‌گرداند.
create or replace function public.ai_reserve_credits(
  p_user_id uuid,
  p_amount  int,
  p_run_id  uuid
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
  v_reserved int;
  v_status text;
begin
  if p_amount <= 0 then
    raise exception 'amount must be > 0';
  end if;

  select reserved_credits, status
    into v_reserved, v_status
    from public.ai_runs
   where id = p_run_id
     and user_id = p_user_id
   for update;

  if v_reserved is null then
    raise exception 'run_not_found';
  end if;
  if v_status <> 'running' then
    raise exception 'run_not_running';
  end if;
  if v_reserved <> p_amount then
    raise exception 'reserve_amount_mismatch';
  end if;
  if exists (
    select 1 from public.ai_credit_ledger
     where run_id = p_run_id and reason = 'reserve'
  ) then
    raise exception 'run_already_reserved';
  end if;

  update public.ai_users
     set credits = credits - p_amount
   where id = p_user_id
     and credits >= p_amount
  returning credits into v_balance;

  if v_balance is null then
    return null; -- insufficient credits
  end if;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id)
  values (p_user_id, -p_amount, v_balance, 'reserve', 'reserve for run', p_run_id);

  return v_balance;
end;
$$;

revoke all on function public.ai_reserve_credits(uuid, int, uuid) from public;
revoke all on function public.ai_reserve_credits(uuid, int, uuid) from anon;
revoke all on function public.ai_reserve_credits(uuid, int, uuid) from authenticated;
grant execute on function public.ai_reserve_credits(uuid, int, uuid) to service_role;

-- بازگرداندن اعتبار (refund) — همیشه موفق است.
create or replace function public.ai_refund_credits(
  p_user_id uuid,
  p_amount  int,
  p_run_id  uuid,
  p_note    text default 'refund'
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
  v_reserved int;
  v_charged int;
  v_refunded int;
  v_status text;
  v_remaining_refundable int;
begin
  if p_amount <= 0 then
    raise exception 'amount must be > 0';
  end if;

  select reserved_credits, charged_credits, refunded_credits, status
    into v_reserved, v_charged, v_refunded, v_status
    from public.ai_runs
   where id = p_run_id
     and user_id = p_user_id
   for update;

  if v_reserved is null then
    raise exception 'run_not_found';
  end if;
  if v_status <> 'running' then
    raise exception 'run_not_running';
  end if;

  v_remaining_refundable := greatest(v_reserved - v_charged - v_refunded, 0);
  if p_amount > v_remaining_refundable then
    raise exception 'refund_exceeds_reserved';
  end if;

  update public.ai_users
     set credits = credits + p_amount
   where id = p_user_id
  returning credits into v_balance;

  update public.ai_runs
     set refunded_credits = refunded_credits + p_amount
   where id = p_run_id;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id)
  values (p_user_id, p_amount, v_balance, 'refund', p_note, p_run_id);

  return v_balance;
end;
$$;

revoke all on function public.ai_refund_credits(uuid, int, uuid, text) from public;
revoke all on function public.ai_refund_credits(uuid, int, uuid, text) from anon;
revoke all on function public.ai_refund_credits(uuid, int, uuid, text) from authenticated;
grant execute on function public.ai_refund_credits(uuid, int, uuid, text) to service_role;

-- تسویه نهایی: charge واقعی را ثبت می‌کند (اعتبار قبلاً هنگام reserve کسر شده؛
-- این تابع فقط مابه‌التفاوت را برمی‌گرداند و ledger را کامل می‌کند).
create or replace function public.ai_settle_credits(
  p_user_id  uuid,
  p_run_id   uuid,
  p_reserved int,
  p_actual   int
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
  v_refund  int;
  v_reserved int;
  v_charged int;
  v_refunded int;
  v_status text;
begin
  if p_actual < 0 then
    raise exception 'charged must be >= 0';
  end if;

  select reserved_credits, charged_credits, refunded_credits, status
    into v_reserved, v_charged, v_refunded, v_status
    from public.ai_runs
   where id = p_run_id
     and user_id = p_user_id
   for update;

  if v_reserved is null then
    raise exception 'run_not_found';
  end if;
  if v_status <> 'running' then
    raise exception 'run_not_running';
  end if;
  if v_charged <> 0 or v_refunded <> 0 then
    raise exception 'run_already_settled';
  end if;
  if p_reserved <> v_reserved then
    raise exception 'reserved_amount_mismatch';
  end if;
  if p_actual > v_reserved then
    raise exception 'charged_exceeds_reserved';
  end if;

  v_refund := v_reserved - p_actual;

  if v_refund > 0 then
    update public.ai_users
       set credits = credits + v_refund
     where id = p_user_id
    returning credits into v_balance;
  else
    select credits into v_balance from public.ai_users where id = p_user_id;
  end if;

  -- ثبت charge واقعی (delta صفر چون کسر در reserve انجام شده — فقط audit)
  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id, metadata)
  values (
    p_user_id,
    0,
    v_balance,
    'charge',
    format('charged %s of %s reserved', p_actual, v_reserved),
    p_run_id,
    jsonb_build_object(
      'reserved_credits', v_reserved,
      'charged_credits', p_actual,
      'refunded_credits', v_refund
    )
  );

  if v_refund > 0 then
    insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id)
    values (p_user_id, v_refund, v_balance, 'refund', 'unused reserved credits', p_run_id);
  end if;

  update public.ai_runs
     set charged_credits = p_actual,
         refunded_credits = v_refund
   where id = p_run_id;

  return v_balance;
end;
$$;

revoke all on function public.ai_settle_credits(uuid, uuid, int, int) from public;
revoke all on function public.ai_settle_credits(uuid, uuid, int, int) from anon;
revoke all on function public.ai_settle_credits(uuid, uuid, int, int) from authenticated;
grant execute on function public.ai_settle_credits(uuid, uuid, int, int) to service_role;

-- ---------- RLS / direct table access ----------
alter table public.ai_runs enable row level security;
alter table public.model_calls enable row level security;
alter table public.model_outputs enable row level security;
alter table public.feedback_votes enable row level security;

revoke all on public.ai_runs from anon, authenticated;
revoke all on public.model_calls from anon, authenticated;
revoke all on public.model_outputs from anon, authenticated;
revoke all on public.feedback_votes from anon, authenticated;

grant select on public.ai_runs to authenticated;
grant select on public.model_calls to authenticated;
grant select on public.model_outputs to authenticated;
grant select, insert, update on public.feedback_votes to authenticated;

drop policy if exists "ai_runs_select_own" on public.ai_runs;
create policy "ai_runs_select_own"
  on public.ai_runs
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "model_calls_select_own_run" on public.model_calls;
create policy "model_calls_select_own_run"
  on public.model_calls
  for select
  to authenticated
  using (
    exists (
      select 1 from public.ai_runs r
       where r.id = model_calls.run_id
         and r.user_id = auth.uid()
    )
  );

drop policy if exists "model_outputs_select_own_run" on public.model_outputs;
create policy "model_outputs_select_own_run"
  on public.model_outputs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.ai_runs r
       where r.id = model_outputs.run_id
         and r.user_id = auth.uid()
    )
  );

drop policy if exists "feedback_votes_select_own" on public.feedback_votes;
create policy "feedback_votes_select_own"
  on public.feedback_votes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "feedback_votes_insert_own_run" on public.feedback_votes;
create policy "feedback_votes_insert_own_run"
  on public.feedback_votes
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ai_runs r
       where r.id = feedback_votes.run_id
         and r.user_id = auth.uid()
    )
  );

drop policy if exists "feedback_votes_update_own" on public.feedback_votes;
create policy "feedback_votes_update_own"
  on public.feedback_votes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ai_runs r
       where r.id = feedback_votes.run_id
         and r.user_id = auth.uid()
    )
  );

-- ---------- Telegram acquisition funnel (20260718) ----------
-- See supabase/migrations/20260718_telegram_acquisition.sql for full DDL + RPCs.
-- Fresh installs: run that migration after schema.sql if tables are missing.
