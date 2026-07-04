-- Allow users to hide in-progress video jobs from the chat UI (job keeps running on OpenRouter)

alter table public.ai_media_jobs
  add column if not exists dismissed_at timestamptz;

create index if not exists ai_media_jobs_dismissed_at_idx
  on public.ai_media_jobs(user_id, dismissed_at)
  where dismissed_at is null;
