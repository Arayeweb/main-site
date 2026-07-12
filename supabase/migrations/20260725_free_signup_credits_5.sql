-- Align free signup bonus with homepage copy (۵ پیام / ۵ کردیت)
update public.ai_settings
set data = jsonb_set(
  coalesce(data, '{}'::jsonb),
  '{free_signup_credits}',
  '5'::jsonb,
  true
)
where id = 1;

update public.ai_plans
set
  credits = 5,
  description = '۵ کردیت هدیه برای تست اولیه',
  features = '["۵ کردیت هدیه", "مدل‌های اقتصادی"]'::jsonb,
  updated_at = now()
where id = 'free';

alter table public.ai_users alter column credits set default 5;
