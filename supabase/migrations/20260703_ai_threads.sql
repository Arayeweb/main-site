-- =========================================================
-- چت چندمرحله‌ای (مثل ChatGPT) — هر گفتگوی direct یک thread است.
-- thread_id = id اولین ردیف thread. برای ردیف اول NULL می‌ماند
-- و در کد به‌صورت coalesce(thread_id, id) خوانده می‌شود.
-- =========================================================

alter table public.ai_battles
  add column if not exists thread_id uuid references public.ai_battles(id) on delete cascade;

create index if not exists ai_battles_thread_idx
  on public.ai_battles (thread_id, created_at asc);
