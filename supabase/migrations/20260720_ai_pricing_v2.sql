-- =========================================================
-- Araaye AI — pricing v2 (plans + signup credits)
-- Mirrors lib/aiPricingConfig.ts for admin reporting.
-- =========================================================

update public.ai_settings
set data = jsonb_set(
  coalesce(data, '{}'::jsonb),
  '{free_signup_credits}',
  '20'::jsonb,
  true
)
where id = 1;

insert into public.ai_plans (id, name, price_toman, credits, description, features, is_active, is_featured) values
  ('free', 'رایگان', 0, 20, '۲۰ کردیت هدیه برای تست اولیه', '["۲۰ کردیت هدیه", "مدل‌های اقتصادی"]', true, false),
  ('starter', 'شروع', 99000, 80, 'مناسب تست و استفاده سبک', '["۸۰ کردیت", "مدل‌های اقتصادی", "ویدیو سبک"]', true, false),
  ('plus', 'پلاس', 249000, 240, 'مناسب استفاده روزمره', '["۲۴۰ کردیت", "مدل‌های میانی", "ویدیو ۷۲۰p"]', true, false),
  ('pro', 'حرفه‌ای', 499000, 550, 'بهترین گزینه برای اکثر کاربران', '["۵۵۰ کردیت", "مدل‌های پیشرفته", "اولویت پاسخ"]', true, true),
  ('max', 'مکس', 990000, 1200, 'مناسب مصرف بالا و کاربران جدی', '["۱۲۰۰ کردیت", "Sora و ۱۰۸۰p", "مصرف بالا"]', true, false),
  ('team_mini', 'تیم کوچک', 1900000, 2500, 'مناسب تیم‌های کوچک', '["۲۵۰۰ کردیت", "۳ کاربر"]', true, false),
  ('business', 'سازمانی', 4900000, 6500, 'تیم، پشتیبانی، مصرف بالا', '["۶۵۰۰+ کردیت", "اتصال اختصاصی", "GPT-5.5-pro"]', true, false)
on conflict (id) do update set
  name = excluded.name,
  price_toman = excluded.price_toman,
  credits = excluded.credits,
  description = excluded.description,
  features = excluded.features,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  updated_at = now();

-- default signup credits for new users
alter table public.ai_users alter column credits set default 20;
