-- =========================================================
-- Araaye AI — Support tickets (کاربران /ai)
-- =========================================================

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
