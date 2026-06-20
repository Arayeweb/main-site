-- جدول لیدها برای فرم چندمرحله‌ای و چت‌بات سایت آرایه.
-- در داشبورد Supabase → SQL Editor اجرا کنید.

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  source      text not null,            -- 'multistep_form' | 'chatbot'
  page        text,                     -- index | clinic | doctors | restaurant
  name        text,
  contact     text not null,            -- موبایل (09xxxxxxxxx) یا ایمیل
  goal        text,
  budget      text,
  plan        text,
  channel     text,
  sitetype    text,
  intent      text,                     -- مخصوص چت‌بات
  detail      text,                     -- مخصوص چت‌بات
  consent     boolean default true,
  raw         jsonb,                    -- کل payload خام برای اطمینان
  user_agent  text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx on public.leads (source);

-- RLS فعال و بدون policy عمومی:
-- مرورگر/anon نمی‌تواند مستقیم بنویسد یا بخواند. فقط service_role (API route سمت سرور) دسترسی دارد.
alter table public.leads enable row level security;
