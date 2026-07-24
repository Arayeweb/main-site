-- =========================================================
-- Growth Hub — eliminate gh_accept_invite OUT/column name collisions
--
-- 20260743 still fails on staging: PL/pgSQL OUT params named
-- workspace_id / member_role collide with INSERT column lists and
-- ON CONFLICT (workspace_id, user_id) inference columns (42702).
--
-- Fix: drop + recreate with non-colliding return column names, and
-- reference the unique constraint by name in ON CONFLICT.
-- App/types updated to match the new return shape.
-- =========================================================

drop function if exists public.gh_accept_invite(text);

create function public.gh_accept_invite(p_token_hash text)
returns table (
  accepted_workspace_id uuid,
  accepted_workspace_slug text,
  accepted_member_role text
)
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

  if v_invite.email is not null
     and lower(v_invite.email) <> v_email then
    raise exception 'gh_invite_email_mismatch' using errcode = 'P0001';
  end if;

  insert into public.gh_profiles (id)
  values (v_uid)
  on conflict (id) do nothing;

  select not exists (
    select 1
    from public.gh_workspace_members as m
    where m.workspace_id = v_invite.workspace_id
      and m.user_id = v_uid
      and m.status = 'active'
  ) into v_first;

  insert into public.gh_workspace_members
    (workspace_id, user_id, role, status, invited_at, joined_at, invited_by)
  values
    (v_invite.workspace_id, v_uid, v_invite.role, 'active',
     v_invite.created_at, now(), v_invite.created_by)
  on conflict on constraint gh_workspace_members_ws_user_uidx do update
    set status    = 'active',
        role      = excluded.role,
        joined_at = coalesce(public.gh_workspace_members.joined_at, now());

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

  insert into public.gh_activity_events
    (workspace_id, actor_id, entity_type, entity_id, event_type, metadata)
  values
    (v_invite.workspace_id, v_uid, 'membership', v_invite.id, 'invitation_accepted',
     jsonb_build_object('role', v_invite.role, 'first_activation', v_first));

  accepted_workspace_id := v_ws.id;
  accepted_workspace_slug := v_ws.slug;
  accepted_member_role := v_invite.role;
  return next;
end;
$$;

revoke all on function public.gh_accept_invite(text) from public, anon;
grant execute on function public.gh_accept_invite(text) to authenticated;
