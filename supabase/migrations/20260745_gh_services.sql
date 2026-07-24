-- =========================================================
-- Growth Hub — Sprint 2: service templates, services, milestones
-- Additive only. Does not modify Sprint 1B tables.
-- Canonical status: waiting_on_client (DATA-MODEL.md — not waiting_for_client).
-- Milestone status: pending | in_progress | blocked | completed | skipped
--   (DATA-MODEL has skipped; Sprint 2 brief needs blocked — both kept.)
-- =========================================================

-- ----- gh_service_templates (global catalog) -----
create table if not exists public.gh_service_templates (
  id                  uuid primary key default gen_random_uuid(),
  key                 text not null,
  title               text not null,
  description         text,
  default_milestones  jsonb not null default '[]'::jsonb,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint gh_service_templates_key_uidx unique (key),
  constraint gh_service_templates_milestones_is_array
    check (jsonb_typeof(default_milestones) = 'array')
);

create index if not exists gh_service_templates_active_idx
  on public.gh_service_templates (is_active)
  where is_active = true;

-- ----- gh_services (tenant instances) -----
create table if not exists public.gh_services (
  id                   uuid primary key default gen_random_uuid(),
  workspace_id         uuid not null references public.gh_workspaces(id) on delete cascade,
  service_template_id  uuid references public.gh_service_templates(id) on delete set null,
  title                text not null,
  status               text not null default 'starting'
                         check (status in (
                           'starting', 'active', 'in_progress', 'waiting_on_client',
                           'paused', 'completed', 'cancelled'
                         )),
  progress             smallint not null default 0
                         check (progress between 0 and 100),
  -- Nullable: staff may lack gh_profiles (admin cookie auth). Display-only.
  owner_id             uuid references public.gh_profiles(id) on delete set null,
  start_date           date,
  due_date             date,
  renewal_date         date,
  latest_update        text,
  next_action          text,
  waiting_reason       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint gh_services_dates_order
    check (due_date is null or start_date is null or due_date >= start_date),
  constraint gh_services_completed_progress
    check (status <> 'completed' or progress = 100),
  constraint gh_services_waiting_reason
    check (status <> 'waiting_on_client' or (waiting_reason is not null and length(trim(waiting_reason)) > 0)),
  constraint gh_services_waiting_next_action
    check (status <> 'waiting_on_client' or (next_action is not null and length(trim(next_action)) > 0)),
  constraint gh_services_completed_no_next
    check (status <> 'completed' or next_action is null or length(trim(next_action)) = 0)
);

create index if not exists gh_services_workspace_status_idx
  on public.gh_services (workspace_id, status);
create index if not exists gh_services_owner_idx
  on public.gh_services (owner_id)
  where owner_id is not null;
create index if not exists gh_services_template_idx
  on public.gh_services (service_template_id);

-- ----- gh_service_milestones -----
create table if not exists public.gh_service_milestones (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid not null references public.gh_services(id) on delete cascade,
  -- Denormalized for RLS index performance (always = parent service.workspace_id).
  workspace_id  uuid not null references public.gh_workspaces(id) on delete cascade,
  title         text not null,
  status        text not null default 'pending'
                  check (status in ('pending', 'in_progress', 'blocked', 'completed', 'skipped')),
  sort_order    int not null default 0,
  due_date      date,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint gh_service_milestones_sort_uidx unique (service_id, sort_order),
  constraint gh_service_milestones_completed_at
    check (
      (status = 'completed' and completed_at is not null)
      or (status <> 'completed' and completed_at is null)
    )
);

create index if not exists gh_service_milestones_service_idx
  on public.gh_service_milestones (service_id, sort_order);
create index if not exists gh_service_milestones_ws_idx
  on public.gh_service_milestones (workspace_id);

-- updated_at triggers
drop trigger if exists gh_service_templates_set_updated_at on public.gh_service_templates;
create trigger gh_service_templates_set_updated_at
  before update on public.gh_service_templates
  for each row execute function public.gh_set_updated_at();

drop trigger if exists gh_services_set_updated_at on public.gh_services;
create trigger gh_services_set_updated_at
  before update on public.gh_services
  for each row execute function public.gh_set_updated_at();

drop trigger if exists gh_service_milestones_set_updated_at on public.gh_service_milestones;
create trigger gh_service_milestones_set_updated_at
  before update on public.gh_service_milestones
  for each row execute function public.gh_set_updated_at();

-- =========================================================
-- Progress recalculation (deterministic):
-- floor(completed_count / total_count * 100); empty → 0
-- =========================================================
create or replace function public.gh_recalc_service_progress(p_service_id uuid)
returns smallint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total     int;
  v_completed int;
  v_progress  smallint;
begin
  select count(*)::int,
         count(*) filter (where status = 'completed')::int
    into v_total, v_completed
  from public.gh_service_milestones
  where service_id = p_service_id;

  if v_total = 0 then
    v_progress := 0;
  else
    v_progress := floor((v_completed::numeric / v_total::numeric) * 100)::smallint;
  end if;

  update public.gh_services
    set progress = v_progress
    where id = p_service_id
      and status not in ('completed', 'cancelled');

  return v_progress;
end;
$$;

revoke all on function public.gh_recalc_service_progress(uuid) from public, anon, authenticated;
grant execute on function public.gh_recalc_service_progress(uuid) to service_role;

-- =========================================================
-- Atomic service creation from template
-- =========================================================
create or replace function public.gh_create_service_from_template(
  p_workspace_id uuid,
  p_template_id  uuid,
  p_title        text,
  p_start_date   date default null,
  p_due_date     date default null,
  p_actor_label  text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_template public.gh_service_templates%rowtype;
  v_ws       public.gh_workspaces%rowtype;
  v_service_id uuid;
  v_item     jsonb;
  v_title    text;
  v_order    int;
begin
  if p_title is null or length(trim(p_title)) < 2 then
    raise exception 'gh_service_invalid_title' using errcode = 'P0001';
  end if;

  if p_due_date is not null and p_start_date is not null and p_due_date < p_start_date then
    raise exception 'gh_service_invalid_dates' using errcode = 'P0001';
  end if;

  select * into v_ws from public.gh_workspaces where id = p_workspace_id;
  if not found then
    raise exception 'gh_service_workspace_missing' using errcode = 'P0001';
  end if;
  if v_ws.status <> 'active' then
    raise exception 'gh_service_workspace_inactive' using errcode = 'P0001';
  end if;

  select * into v_template
  from public.gh_service_templates
  where id = p_template_id;
  if not found then
    raise exception 'gh_service_template_missing' using errcode = 'P0001';
  end if;
  if not v_template.is_active then
    raise exception 'gh_service_template_inactive' using errcode = 'P0001';
  end if;

  insert into public.gh_services
    (workspace_id, service_template_id, title, status, progress, start_date, due_date)
  values
    (p_workspace_id, p_template_id, trim(p_title), 'starting', 0, p_start_date, p_due_date)
  returning id into v_service_id;

  for v_item in
    select value
    from jsonb_array_elements(coalesce(v_template.default_milestones, '[]'::jsonb))
    order by (value->>'sort_order')::int nulls last
  loop
    v_title := coalesce(nullif(trim(v_item->>'title'), ''), 'مرحله');
    v_order := coalesce((v_item->>'sort_order')::int, 0);
    insert into public.gh_service_milestones
      (service_id, workspace_id, title, status, sort_order)
    values
      (v_service_id, p_workspace_id, v_title, 'pending', v_order);
  end loop;

  insert into public.gh_activity_events
    (workspace_id, actor_id, entity_type, entity_id, event_type, metadata)
  values
    (p_workspace_id, null, 'service', v_service_id, 'service_created',
     jsonb_build_object(
       'template_key', v_template.key,
       'title', trim(p_title),
       'client_visible', true,
       'staff_actor', p_actor_label
     ));

  return v_service_id;
end;
$$;

revoke all on function public.gh_create_service_from_template(uuid, uuid, text, date, date, text)
  from public, anon, authenticated;
grant execute on function public.gh_create_service_from_template(uuid, uuid, text, date, date, text)
  to service_role;
-- Called only via service-role after assertGrowthHubStaffAccess().

-- =========================================================
-- RLS
-- =========================================================
alter table public.gh_service_templates   enable row level security;
alter table public.gh_services            enable row level security;
alter table public.gh_service_milestones  enable row level security;

revoke all on public.gh_service_templates  from anon, authenticated;
revoke all on public.gh_services           from anon, authenticated;
revoke all on public.gh_service_milestones from anon, authenticated;

grant select on public.gh_service_templates  to authenticated;
grant select on public.gh_services           to authenticated;
grant select on public.gh_service_milestones to authenticated;
-- No client writes — staff mutations use service_role (BYPASSRLS).

drop policy if exists gh_service_templates_select_active on public.gh_service_templates;
create policy gh_service_templates_select_active on public.gh_service_templates
  for select to authenticated
  using (is_active = true);

drop policy if exists gh_services_select_member on public.gh_services;
create policy gh_services_select_member on public.gh_services
  for select to authenticated
  using (public.gh_is_active_member(workspace_id));

drop policy if exists gh_service_milestones_select_member on public.gh_service_milestones;
create policy gh_service_milestones_select_member on public.gh_service_milestones
  for select to authenticated
  using (public.gh_is_active_member(workspace_id));

-- =========================================================
-- Idempotent seed: 5 service templates (PRD / Sprint 2 brief)
-- =========================================================
insert into public.gh_service_templates (key, title, description, default_milestones, is_active)
values
  (
    'fastweb',
    'FastWeb',
    'راه‌اندازی سریع وب‌سایت کسب‌وکار',
    '[
      {"title":"دریافت اطلاعات","sort_order":1},
      {"title":"آماده‌سازی محتوا","sort_order":2},
      {"title":"طراحی و پیاده‌سازی","sort_order":3},
      {"title":"بازبینی","sort_order":4},
      {"title":"انتشار","sort_order":5},
      {"title":"تحویل","sort_order":6}
    ]'::jsonb,
    true
  ),
  (
    'website-design',
    'طراحی سایت',
    'طراحی و توسعه وب‌سایت سفارشی',
    '[
      {"title":"دریافت اطلاعات","sort_order":1},
      {"title":"معماری محتوا","sort_order":2},
      {"title":"طراحی اولیه","sort_order":3},
      {"title":"توسعه","sort_order":4},
      {"title":"بازبینی مشتری","sort_order":5},
      {"title":"انتشار","sort_order":6},
      {"title":"تحویل","sort_order":7}
    ]'::jsonb,
    true
  ),
  (
    'seo',
    'SEO',
    'بهینه‌سازی موتورهای جستجو',
    '[
      {"title":"بررسی اولیه","sort_order":1},
      {"title":"اصلاح فنی","sort_order":2},
      {"title":"تحقیق کلمات","sort_order":3},
      {"title":"بهینه‌سازی صفحات","sort_order":4},
      {"title":"تولید یا اصلاح محتوا","sort_order":5},
      {"title":"گزارش دوره","sort_order":6}
    ]'::jsonb,
    true
  ),
  (
    'website-maintenance',
    'نگهداری سایت',
    'نگهداری، به‌روزرسانی و پشتیبان‌گیری',
    '[
      {"title":"بررسی سلامت","sort_order":1},
      {"title":"به‌روزرسانی","sort_order":2},
      {"title":"پشتیبان‌گیری","sort_order":3},
      {"title":"اصلاح مشکلات","sort_order":4},
      {"title":"گزارش دوره","sort_order":5}
    ]'::jsonb,
    true
  ),
  (
    'google-business',
    'Google Business',
    'راه‌اندازی و تکمیل پروفایل Google Business',
    '[
      {"title":"دریافت اطلاعات","sort_order":1},
      {"title":"بررسی وضعیت","sort_order":2},
      {"title":"ثبت یا اصلاح پروفایل","sort_order":3},
      {"title":"تکمیل اطلاعات","sort_order":4},
      {"title":"تأیید و تحویل","sort_order":5}
    ]'::jsonb,
    true
  )
on conflict (key) do update
  set title              = excluded.title,
      description        = excluded.description,
      default_milestones = excluded.default_milestones,
      is_active          = excluded.is_active,
      updated_at         = now();
