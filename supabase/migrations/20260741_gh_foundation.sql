-- =========================================================
-- Growth Hub — Sprint 1B production foundation
-- Tables: gh_profiles, gh_workspaces, gh_workspace_members,
--         gh_workspace_invites, gh_activity_events
-- Tenancy enforced by RLS on the Supabase Auth (authenticated) role.
-- Staff mutations use the service-role client (BYPASSRLS) strictly
-- behind assertGrowthHubStaffAccess(); no client-facing write policies.
-- See docs/growth-hub/DATA-MODEL.md and rls-matrix.md.
-- Additive and idempotent; does NOT modify any existing table.
-- =========================================================

-- ----- gh_profiles: 1:1 with auth.users -----
create table if not exists public.gh_profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  phone            text,
  avatar_url       text,
  preferred_locale text not null default 'fa',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists gh_profiles_phone_idx
  on public.gh_profiles (phone) where phone is not null;

-- ----- gh_workspaces: tenant root (no account_manager_id — D-022) -----
create table if not exists public.gh_workspaces (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null,
  logo_url           text,
  industry           text,
  website_url        text,
  status             text not null default 'active'
                       check (status in ('active', 'suspended', 'archived')),
  crm_client_id      uuid,
  support_project_id uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  archived_at        timestamptz,
  constraint gh_workspaces_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 2 and 63)
);

create unique index if not exists gh_workspaces_slug_uidx
  on public.gh_workspaces (slug);
create index if not exists gh_workspaces_status_idx
  on public.gh_workspaces (status);

-- ----- gh_workspace_members: authoritative access + manager assignment -----
create table if not exists public.gh_workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.gh_workspaces(id) on delete cascade,
  user_id      uuid not null references public.gh_profiles(id) on delete cascade,
  role         text not null
                 check (role in ('client_owner', 'client_member', 'araaye_manager')),
  status       text not null default 'invited'
                 check (status in ('invited', 'active', 'removed')),
  invited_at   timestamptz,
  joined_at    timestamptz,
  invited_by   uuid references public.gh_profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- One membership row per (workspace, user): prevents duplicate active memberships.
  constraint gh_workspace_members_ws_user_uidx unique (workspace_id, user_id)
);

create index if not exists gh_workspace_members_user_idx
  on public.gh_workspace_members (user_id, status);
create index if not exists gh_workspace_members_ws_idx
  on public.gh_workspace_members (workspace_id);
create index if not exists gh_workspace_members_manager_idx
  on public.gh_workspace_members (user_id, workspace_id)
  where role = 'araaye_manager' and status = 'active';

-- ----- gh_workspace_invites: hashed, expiring, single-use -----
create table if not exists public.gh_workspace_invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.gh_workspaces(id) on delete cascade,
  email        text,
  phone        text,
  role         text not null
                 check (role in ('client_owner', 'client_member')),
  token_hash   text not null,
  expires_at   timestamptz not null,
  accepted_at  timestamptz,
  accepted_by  uuid references public.gh_profiles(id),
  revoked_at   timestamptz,
  -- Nullable: Growth Hub staff authenticate via the admin cookie (not Supabase
  -- Auth), so they have no gh_profiles row. The acting staff id is recorded in
  -- gh_activity_events.metadata instead. Null = created by staff/system.
  created_by   uuid references public.gh_profiles(id),
  created_at   timestamptz not null default now(),
  constraint gh_workspace_invites_contact_present
    check (email is not null or phone is not null)
);

create unique index if not exists gh_workspace_invites_token_uidx
  on public.gh_workspace_invites (token_hash);
create index if not exists gh_workspace_invites_ws_idx
  on public.gh_workspace_invites (workspace_id);
create index if not exists gh_workspace_invites_expires_idx
  on public.gh_workspace_invites (expires_at);

-- ----- gh_activity_events: audit + activity feed foundation -----
create table if not exists public.gh_activity_events (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.gh_workspaces(id) on delete cascade,
  actor_id     uuid references public.gh_profiles(id),
  entity_type  text not null,
  entity_id    uuid not null,
  event_type   text not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists gh_activity_events_ws_idx
  on public.gh_activity_events (workspace_id, created_at desc);

-- =========================================================
-- updated_at trigger
-- =========================================================
create or replace function public.gh_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gh_profiles_set_updated_at on public.gh_profiles;
create trigger gh_profiles_set_updated_at
  before update on public.gh_profiles
  for each row execute function public.gh_set_updated_at();

drop trigger if exists gh_workspaces_set_updated_at on public.gh_workspaces;
create trigger gh_workspaces_set_updated_at
  before update on public.gh_workspaces
  for each row execute function public.gh_set_updated_at();

drop trigger if exists gh_workspace_members_set_updated_at on public.gh_workspace_members;
create trigger gh_workspace_members_set_updated_at
  before update on public.gh_workspace_members
  for each row execute function public.gh_set_updated_at();

-- =========================================================
-- RLS helper functions (SECURITY DEFINER to avoid recursive RLS
-- when a policy on gh_workspace_members must read membership).
-- Minimum privilege: read-only membership lookups bound to auth.uid().
-- =========================================================
create or replace function public.gh_is_active_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.gh_workspace_members m
    where m.workspace_id = ws
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.gh_is_workspace_manager(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.gh_workspace_members m
    where m.workspace_id = ws
      and m.user_id = auth.uid()
      and m.role = 'araaye_manager'
      and m.status = 'active'
  );
$$;

revoke all on function public.gh_is_active_member(uuid) from public;
revoke all on function public.gh_is_workspace_manager(uuid) from public;
grant execute on function public.gh_is_active_member(uuid) to authenticated;
grant execute on function public.gh_is_workspace_manager(uuid) to authenticated;

-- =========================================================
-- Enable RLS. Default deny: any operation without a matching
-- policy is rejected. anon gets no policies (no access).
-- service_role has BYPASSRLS for authorized staff mutations.
-- =========================================================
alter table public.gh_profiles          enable row level security;
alter table public.gh_workspaces         enable row level security;
alter table public.gh_workspace_members  enable row level security;
alter table public.gh_workspace_invites  enable row level security;
alter table public.gh_activity_events    enable row level security;

-- Base grants: RLS still filters rows. Nothing granted to anon.
revoke all on public.gh_profiles         from anon, authenticated;
revoke all on public.gh_workspaces        from anon, authenticated;
revoke all on public.gh_workspace_members from anon, authenticated;
revoke all on public.gh_workspace_invites from anon, authenticated;
revoke all on public.gh_activity_events   from anon, authenticated;

grant select, insert, update on public.gh_profiles to authenticated;
grant select on public.gh_workspaces to authenticated;
grant select on public.gh_workspace_members to authenticated;
grant select on public.gh_activity_events to authenticated;
-- gh_workspace_invites: no grants to authenticated → not enumerable by clients.

-- ---------------- gh_profiles policies ----------------
drop policy if exists gh_profiles_select_own on public.gh_profiles;
create policy gh_profiles_select_own on public.gh_profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists gh_profiles_insert_own on public.gh_profiles;
create policy gh_profiles_insert_own on public.gh_profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists gh_profiles_update_own on public.gh_profiles;
create policy gh_profiles_update_own on public.gh_profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------- gh_workspaces policies ----------------
-- Members see only workspaces where they have an active membership.
drop policy if exists gh_workspaces_select_member on public.gh_workspaces;
create policy gh_workspaces_select_member on public.gh_workspaces
  for select to authenticated
  using (public.gh_is_active_member(id));

-- ---------------- gh_workspace_members policies ----------------
-- Members see co-members of their active workspaces. No client writes
-- (role changes / staff memberships are service-role only).
drop policy if exists gh_workspace_members_select_member on public.gh_workspace_members;
create policy gh_workspace_members_select_member on public.gh_workspace_members
  for select to authenticated
  using (public.gh_is_active_member(workspace_id));

-- ---------------- gh_activity_events policies ----------------
-- Members read only client-visible events in their active workspaces.
-- Audit rows (membership/invite) omit client_visible → hidden.
drop policy if exists gh_activity_events_select_member on public.gh_activity_events;
create policy gh_activity_events_select_member on public.gh_activity_events
  for select to authenticated
  using (
    public.gh_is_active_member(workspace_id)
    and coalesce(metadata->>'client_visible', 'false') = 'true'
  );

-- gh_workspace_invites: no policies for authenticated/anon → fully denied
-- to clients. Acceptance happens through gh_accept_invite (SECURITY DEFINER).
