-- Sync ai_media_jobs for image/video studios (safe to re-run on production).
-- Fixes: PGRST204 "Could not find the 'reference_url' column"

alter table public.ai_media_jobs
  add column if not exists dismissed_at timestamptz;

create index if not exists ai_media_jobs_dismissed_at_idx
  on public.ai_media_jobs(user_id, dismissed_at)
  where dismissed_at is null;

alter table public.ai_media_jobs
  add column if not exists reference_url text;

alter table public.ai_media_jobs
  drop constraint if exists ai_media_jobs_kind_check;

alter table public.ai_media_jobs
  add constraint ai_media_jobs_kind_check
  check (kind in ('video', 'audio', 'transcribe', 'image'));

comment on column public.ai_media_jobs.reference_url is 'Optional reference image URL for image/video generation';
