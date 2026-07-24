alter table public.analytics_events
  add column if not exists dedupe_key text,
  add column if not exists event_origin text not null default 'client',
  add column if not exists actor_id text,
  add column if not exists account_id text;

create unique index if not exists analytics_events_dedupe_key_uidx
  on public.analytics_events (dedupe_key)
  where dedupe_key is not null;

create index if not exists analytics_events_origin_created_idx
  on public.analytics_events (event_origin, created_at desc);

create index if not exists analytics_events_actor_created_idx
  on public.analytics_events (actor_id, created_at desc)
  where actor_id is not null;

alter table public.analytics_events
  add constraint analytics_events_origin_check
  check (event_origin in ('client', 'server'));

