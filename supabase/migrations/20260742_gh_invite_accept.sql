-- =========================================================
-- Growth Hub — atomic, single-use invitation acceptance
-- SECURITY DEFINER so a signed-in client (authenticated) can create
-- their own membership without service-role in the client path.
-- Acceptance is bound to the caller's auth.uid() / auth.email().
-- Fails safely on invalid, expired, revoked, reused, or mismatched invites.
-- Raw tokens are never stored or logged: caller passes a SHA-256 hash.
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
  v_invite public.gh_workspace_invites;
  v_ws     public.gh_workspaces;
  v_first  boolean;
begin
  if v_uid is null then
    raise exception 'gh_invite_not_authenticated' using errcode = '28000';
  end if;

  -- Lock the invite row for the duration of the transaction.
  select * into v_invite
  from public.gh_workspace_invites
  where token_hash = p_token_hash
  for update;

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
  insert into public.gh_profiles (id)
  values (v_uid)
  on conflict (id) do nothing;

  -- Detect first activation for this workspace membership (for analytics/audit).
  select not exists (
    select 1 from public.gh_workspace_members
    where workspace_id = v_invite.workspace_id and user_id = v_uid and status = 'active'
  ) into v_first;

  -- Create or (re)activate the membership atomically.
  insert into public.gh_workspace_members
    (workspace_id, user_id, role, status, invited_at, joined_at, invited_by)
  values
    (v_invite.workspace_id, v_uid, v_invite.role, 'active',
     v_invite.created_at, now(), v_invite.created_by)
  on conflict (workspace_id, user_id) do update
    set status    = 'active',
        role      = excluded.role,
        joined_at = coalesce(public.gh_workspace_members.joined_at, now());

  -- Single-use: mark accepted.
  update public.gh_workspace_invites
    set accepted_at = now(), accepted_by = v_uid
    where id = v_invite.id;

  select * into v_ws from public.gh_workspaces where id = v_invite.workspace_id;

  -- Audit event (not client-visible).
  insert into public.gh_activity_events
    (workspace_id, actor_id, entity_type, entity_id, event_type, metadata)
  values
    (v_invite.workspace_id, v_uid, 'membership', v_invite.id, 'invitation_accepted',
     jsonb_build_object('role', v_invite.role, 'first_activation', v_first));

  return query select v_ws.id, v_ws.slug, v_invite.role;
end;
$$;

revoke all on function public.gh_accept_invite(text) from public, anon;
grant execute on function public.gh_accept_invite(text) to authenticated;

-- =========================================================
-- gh_peek_invite: reveal ONLY non-sensitive invite metadata (workspace name +
-- role) to a caller who already possesses the valid raw token (passed as its
-- hash). Returns nothing for invalid / expired / revoked / accepted invites.
-- Never returns the invited email/phone and never reveals whether an unrelated
-- account exists. Safe to expose to anon (pre-auth invite landing page).
-- =========================================================
create or replace function public.gh_peek_invite(p_token_hash text)
returns table (workspace_name text, member_role text, expires_at timestamptz)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select w.name, i.role, i.expires_at
  from public.gh_workspace_invites i
  join public.gh_workspaces w on w.id = i.workspace_id
  where i.token_hash = p_token_hash
    and i.accepted_at is null
    and i.revoked_at is null
    and i.expires_at > now();
$$;

revoke all on function public.gh_peek_invite(text) from public;
grant execute on function public.gh_peek_invite(text) to anon, authenticated;
