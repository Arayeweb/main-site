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
  ('free', 'رایگان', 0, 5, 'شروع رایگان برای آشنایی با محصول.', '["۵ کردیت ابتدایی", "نبرد اقتصادی مدل‌ها"]', true, false),
  ('starter', 'استارتر', 79000, 50, 'برای شروع و استفاده شخصی.', '["≈ ۵۰ پرسش چت", "۵ شخصیت هوش مصنوعی", "استودیو تصویر"]', true, false),
  ('pro', 'Pro', 229000, 180, 'برای فریلنسرها و کسب‌وکارهای کوچک.', '["≈ ۱۸۰ پرسش", "مدل‌های پرچم‌دار", "اولویت پاسخ‌دهی"]', true, true),
  ('business', 'Business', 549000, 500, 'برای تیم‌ها و استفاده حرفه‌ای.', '["≈ ۵۰۰ پرسش", "کامل‌ترین دسترسی", "کمترین قیمت به‌ازای پرسش"]', true, false)
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
  "free_signup_credits": 5,
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
