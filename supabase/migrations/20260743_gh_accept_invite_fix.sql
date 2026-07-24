-- =========================================================
-- Growth Hub — fix gh_accept_invite PL/pgSQL name collision (G2 hotfix)
--
-- Bug: RETURNS TABLE (workspace_id, workspace_slug, member_role) introduces
-- output variables that shadow table columns. Unqualified references such as
-- `where workspace_id = v_invite.workspace_id` raise:
--   42702 column reference "workspace_id" is ambiguous
--
-- Fix: keep the public return shape unchanged (app + types stay compatible)
-- and fully qualify every table column reference inside the function body.
-- Additive: CREATE OR REPLACE only; does not edit 20260742.
-- =========================================================
create or replace function public.gh_accept_invite(p_token_hash text)
returns table (workspace_id uuid, workspace_slug text, member_role text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := auth.uid();
  v_email  text := lower(coalesce(auth.email(), ''));
  v_invite public.gh_workspace_invites%rowtype;
  v_ws     public.gh_workspaces%rowtype;
  v_first  boolean;
begin
  if v_uid is null then
    raise exception 'gh_invite_not_authenticated' using errcode = '28000';
  end if;

  -- Lock the invite row for the duration of the transaction.
  select i.* into v_invite
  from public.gh_workspace_invites as i
  where i.token_hash = p_token_hash
  for update of i;

  if not found then
    raise exception 'gh_invite_invalid' using errcode = 'P0001';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'gh_invite_revoked' using errcode = 'P0001';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'gh_invite_used' using errcode = 'P0001';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'gh_invite_expired' using errcode = 'P0001';
  end if;

  -- Email binding: if the invite targets an email it must match the
  -- authenticated user's email (normalized). Do not reveal which side failed.
  if v_invite.email is not null
     and lower(v_invite.email) <> v_email then
    raise exception 'gh_invite_email_mismatch' using errcode = 'P0001';
  end if;

  -- Ensure the accepting user has a profile row.
  insert into public.gh_profiles as p (id)
  values (v_uid)
  on conflict (id) do nothing;

  -- Detect first activation for this workspace membership (for analytics/audit).
  -- Fully qualify m.workspace_id so it cannot collide with the OUT param.
  select not exists (
    select 1
    from public.gh_workspace_members as m
    where m.workspace_id = v_invite.workspace_id
      and m.user_id = v_uid
      and m.status = 'active'
  ) into v_first;

  -- Create or (re)activate the membership atomically.
  insert into public.gh_workspace_members as m
    (workspace_id, user_id, role, status, invited_at, joined_at, invited_by)
  values
    (v_invite.workspace_id, v_uid, v_invite.role, 'active',
     v_invite.created_at, now(), v_invite.created_by)
  on conflict (workspace_id, user_id) do update
    set status    = 'active',
        role      = excluded.role,
        joined_at = coalesce(public.gh_workspace_members.joined_at, now());

  -- Single-use: mark accepted.
  update public.gh_workspace_invites as i
    set accepted_at = now(),
        accepted_by = v_uid
    where i.id = v_invite.id;

  select w.* into v_ws
  from public.gh_workspaces as w
  where w.id = v_invite.workspace_id;

  if not found then
    raise exception 'gh_invite_invalid' using errcode = 'P0001';
  end if;

  -- Audit event (not client-visible).
  insert into public.gh_activity_events as a
    (workspace_id, actor_id, entity_type, entity_id, event_type, metadata)
  values
    (v_invite.workspace_id, v_uid, 'membership', v_invite.id, 'invitation_accepted',
     jsonb_build_object('role', v_invite.role, 'first_activation', v_first));

  -- Assign OUT params explicitly (avoids RETURN QUERY / OUT-name collisions).
  workspace_id := v_ws.id;
  workspace_slug := v_ws.slug;
  member_role := v_invite.role;
  return next;
end;
$$;

revoke all on function public.gh_accept_invite(text) from public, anon;
grant execute on function public.gh_accept_invite(text) to authenticated;
