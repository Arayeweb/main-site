-- Align free signup bonus with FREE_SIGNUP_CREDITS = 10 in lib/aiPricingConfig.ts
update public.ai_settings
set data = jsonb_set(
  coalesce(data, '{}'::jsonb),
  '{free_signup_credits}',
  '10'::jsonb,
  true
)
where id = 1;

update public.ai_plans
set
  credits = 10,
  description = 'رایگان امتحان کنید — چند گفت‌وگوی اولیه برای آشنایی با آرایه AI',
  features = '["رایگان امتحان کنید", "چند گفت‌وگوی اولیه", "فقط مدل‌های اقتصادی"]'::jsonb,
  updated_at = now()
where id = 'free';

alter table public.ai_users alter column credits set default 10;
