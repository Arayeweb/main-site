-- Image generation jobs in ai_media_jobs (async poll-driven processing)

alter table public.ai_media_jobs
  drop constraint if exists ai_media_jobs_kind_check;

alter table public.ai_media_jobs
  add constraint ai_media_jobs_kind_check
  check (kind in ('video', 'audio', 'transcribe', 'image'));

alter table public.ai_media_jobs
  add column if not exists reference_url text;

comment on column public.ai_media_jobs.reference_url is 'Optional reference image URL for image/video generation';
