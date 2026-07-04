-- =========================================================
-- AI Campaign Attribution — UTM on orders/users + influencer promo codes
-- =========================================================

alter table public.ai_orders add column if not exists utm_source text;
alter table public.ai_orders add column if not exists utm_medium text;
alter table public.ai_orders add column if not exists utm_campaign text;

alter table public.ai_users add column if not exists utm_source text;
alter table public.ai_users add column if not exists utm_medium text;
alter table public.ai_users add column if not exists utm_campaign text;

create index if not exists ai_orders_utm_source_idx
  on public.ai_orders (utm_source, created_at desc)
  where utm_source is not null;

create index if not exists ai_orders_promo_paid_idx
  on public.ai_orders (promo_code, status)
  where promo_code is not null and status = 'paid';

create index if not exists ai_users_utm_source_idx
  on public.ai_users (utm_source, created_at desc)
  where utm_source is not null;

-- کدهای اینفلوئنسر — ۲۰٪ تخفیف، حداکثر ۵۰ استفاده، ۳۰ روز
insert into public.ai_promo_codes (code, kind, value, max_uses, expires_at)
values
  ('PAGEA20', 'percent', 20, 50, now() + interval '30 days'),
  ('PAGEB20', 'percent', 20, 50, now() + interval '30 days'),
  ('PAGEC20', 'percent', 20, 50, now() + interval '30 days'),
  ('PAGED20', 'percent', 20, 50, now() + interval '30 days'),
  ('PAGEE20', 'percent', 20, 50, now() + interval '30 days')
on conflict (code) do nothing;
