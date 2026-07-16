-- Growth KPI foundation: lead scoring columns + experiment backlog

alter table public.leads add column if not exists lead_score int not null default 0;
alter table public.leads add column if not exists is_auto_qualified boolean not null default false;
alter table public.leads add column if not exists qualified_at timestamptz;
alter table public.leads add column if not exists won_at timestamptz;
alter table public.leads add column if not exists referred_by_lead_id uuid references public.leads (id) on delete set null;

create index if not exists leads_lead_score_idx on public.leads (lead_score desc);
create index if not exists leads_qualified_at_idx on public.leads (qualified_at desc);
create index if not exists leads_won_at_idx on public.leads (won_at desc);
create index if not exists leads_auto_qualified_idx on public.leads (is_auto_qualified) where is_auto_qualified = true;

create table if not exists public.growth_experiments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  squad text not null check (squad in ('acquisition', 'conversion', 'product', 'cs', 'experimentation')),
  idea text not null,
  hypothesis text not null,
  kpi_target text not null,
  impact int not null check (impact between 1 and 10),
  confidence int not null check (confidence between 1 and 10),
  effort int not null check (effort between 1 and 10),
  score numeric generated always as ((impact::numeric * confidence::numeric) / nullif(effort, 0)::numeric) stored,
  status text not null default 'backlog'
    check (status in ('backlog', 'running', 'measuring', 'shipped', 'killed')),
  bucket text not null default 'optimize'
    check (bucket in ('core', 'optimize', 'new')),
  sprint_week date,
  result_notes text,
  measured_value text,
  owner_id uuid references public.admin_users (id) on delete set null
);

create index if not exists growth_experiments_score_idx on public.growth_experiments (score desc);
create index if not exists growth_experiments_sprint_idx on public.growth_experiments (sprint_week desc);
create index if not exists growth_experiments_status_idx on public.growth_experiments (status);

alter table public.growth_experiments enable row level security;

create or replace function public.growth_experiments_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists growth_experiments_set_updated_at on public.growth_experiments;
create trigger growth_experiments_set_updated_at
before update on public.growth_experiments
for each row execute function public.growth_experiments_set_updated_at();
