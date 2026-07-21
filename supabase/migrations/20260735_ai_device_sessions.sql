-- نشست‌های دستگاه برای آرایه AI (لیست / لغو از حساب کاربر)
create table if not exists public.ai_device_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.ai_users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  revoked_at    timestamptz,
  user_agent    text,
  ip            text,
  device_label  text not null default 'دستگاه ناشناس',
  device_kind   text not null default 'unknown' -- desktop | mobile | tablet | unknown
);

create index if not exists ai_device_sessions_user_idx
  on public.ai_device_sessions (user_id, revoked_at, last_seen_at desc);

create index if not exists ai_device_sessions_active_id_idx
  on public.ai_device_sessions (id)
  where revoked_at is null;

alter table public.ai_device_sessions enable row level security;
