-- Async video/audio job tracking for Arena media studios

create table if not exists public.ai_media_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ai_users(id) on delete cascade,
  kind text not null check (kind in ('video', 'audio', 'transcribe')),
  model_id text not null,
  prompt text,
  duration_sec int,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  openrouter_job_id text,
  polling_url text,
  credit_cost int not null default 0,
  cost_usd numeric,
  output_url text,
  error text,
  battle_id uuid references public.ai_battles(id) on delete set null,
  thread_id uuid,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_media_jobs_user_id_idx on public.ai_media_jobs(user_id);
create index if not exists ai_media_jobs_status_idx on public.ai_media_jobs(status);

comment on table public.ai_media_jobs is 'Async OpenRouter video jobs + metadata for Arena studios';
comment on column public.ai_battles.mode_kind is 'text | vision | image_gen | video_gen | audio_gen | transcribe';
