-- =========================================================
-- Arena Viral + Promo + Multimodal
-- share battles, promo/referral codes, attachments, ai-uploads bucket
-- =========================================================

-- ---------- Viral: ai_battles extensions ----------
alter table public.ai_battles add column if not exists is_public boolean not null default false;
alter table public.ai_battles add column if not exists share_slug text unique;
alter table public.ai_battles add column if not exists attachments jsonb not null default '[]';
alter table public.ai_battles add column if not exists mode_kind text not null default 'text';
-- mode_kind: text | vision | image_gen

-- Guest battles (بدون login — حداکثر ۲ نبرد)
alter table public.ai_battles alter column user_id drop not null;
alter table public.ai_battles add column if not exists guest_token text;

create index if not exists ai_battles_share_slug_idx on public.ai_battles (share_slug) where share_slug is not null;
create index if not exists ai_battles_guest_token_idx on public.ai_battles (guest_token) where guest_token is not null;

-- ---------- Promo codes ----------
create table if not exists public.ai_promo_codes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  code         text not null unique,
  kind         text not null default 'percent', -- percent | fixed
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
  ('SUMMER20', 'percent', 20, 500)
on conflict (code) do nothing;

-- ---------- AI referral codes (محصول Arena — جدا از referrals/ARY-) ----------
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

-- ---------- ai_orders: تخفیف و معرفی ----------
alter table public.ai_orders add column if not exists list_amount_toman int;
alter table public.ai_orders add column if not exists discount_toman int not null default 0;
alter table public.ai_orders add column if not exists promo_code text;
alter table public.ai_orders add column if not exists referral_code text;
alter table public.ai_orders add column if not exists referrer_user_id uuid references public.ai_users(id) on delete set null;

-- ---------- Referral redemption (یک بار per buyer) ----------
create table if not exists public.ai_referral_redemptions (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  user_id           uuid not null unique references public.ai_users(id) on delete cascade,
  referral_code_id  uuid not null references public.ai_referral_codes(id) on delete cascade,
  order_id          uuid not null references public.ai_orders(id) on delete cascade
);
create index if not exists ai_referral_redemptions_code_idx on public.ai_referral_redemptions (referral_code_id);
alter table public.ai_referral_redemptions enable row level security;

-- ---------- Supabase Storage: ai-uploads ----------
-- Dashboard → Storage → New bucket:
--   id: ai-uploads | Public: true | Max size: 4MB
--   Allowed MIME: image/jpeg, image/png, image/webp
-- Path pattern from API: {user_id}/{uuid}.{ext}
-- Upload only via service role in /api/ai/upload and /api/ai/image
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-uploads',
  'ai-uploads',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
