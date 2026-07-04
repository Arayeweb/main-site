-- =========================================================
-- Araaye Arena — Battle Mode + فروش پکیج اعتباری
-- جایگزین محصول قبلی «اتاق فکر» (ai_conversations/messages/responses
-- برای داده تاریخی نگه داشته می‌شوند ولی دیگر استفاده نمی‌شوند).
-- =========================================================

-- نبردها/مقایسه‌ها: هر ردیف = یک پرامپت + پاسخ(ها) + رأی کاربر
-- حالت‌ها: نبرد ناشناس (tier=economy|standard|premium)،
-- مقایسه انتخابی (tier=side_by_side)، گفتگوی مستقیم (tier=direct — model_b/response_b خالی)
create table if not exists public.ai_battles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.ai_users(id) on delete cascade,
  prompt       text not null,
  model_a      text not null,            -- اسلاگ OpenRouter
  model_b      text not null default '',
  response_a   text not null,
  response_b   text not null default '',
  tier         text not null default 'economy', -- economy | standard | premium | side_by_side | direct
  credit_cost  int  not null default 1,
  cost_usd     numeric(10,6),            -- هزینه واقعی OpenRouter
  tokens_used  int,
  winner       text,                     -- a | b | tie
  voted_at     timestamptz,
  created_at   timestamptz default now()
);
create index if not exists ai_battles_user_idx on public.ai_battles (user_id, created_at desc);
alter table public.ai_battles enable row level security;

-- سفارش‌های خرید پکیج (زیبال)
create table if not exists public.ai_orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.ai_users(id) on delete cascade,
  package_id      text not null,          -- starter | pro | business
  amount_toman    int  not null,
  credits_granted int  not null,
  zibal_track_id  text unique,
  status          text not null default 'pending', -- pending | paid | failed
  paid_at         timestamptz,
  created_at      timestamptz default now()
);
create index if not exists ai_orders_user_idx on public.ai_orders (user_id, created_at desc);
create index if not exists ai_orders_track_idx on public.ai_orders (zibal_track_id);
alter table public.ai_orders enable row level security;
