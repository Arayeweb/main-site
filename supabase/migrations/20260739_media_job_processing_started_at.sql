-- Track when an image/video job entered processing so stale serverless workers can be reclaimed.
alter table public.ai_media_jobs
  add column if not exists processing_started_at timestamptz;

comment on column public.ai_media_jobs.processing_started_at is
  'Set when a worker claims the job; used to reclaim jobs stuck after function timeout';
