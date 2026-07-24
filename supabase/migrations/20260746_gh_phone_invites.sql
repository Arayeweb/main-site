-- =========================================================
-- Growth Hub — phone-bound invites + OTP challenges
-- Invite token = workspace/role binding; OTP = phone ownership.
-- invited_phone_e164 is authoritative for accept matching.
-- =========================================================

-- Prefer explicit E.164 column; keep legacy email/phone nullable.
alter table public.gh_workspace_invites
  add column if not exists invited_phone_e164 text;

create index if not exists gh_workspace_invites_phone_idx
  on public.gh_workspace_invites (invited_phone_e164)
  where invited_phone_e164 is not null;

-- Contact must still be present (email OR phone OR invited_phone_e164).
alter table public.gh_workspace_invites
  drop constraint if exists gh_workspace_invites_contact_present;

alter table public.gh_workspace_invites
  add constraint gh_workspace_invites_contact_present
  check (
    email is not null
    or phone is not null
    or invited_phone_e164 is not null
  );

-- OTP challenges for Growth Hub only (never share ai_otp_challenges).
create table if not exists public.gh_phone_otp_challenges (
  id           uuid primary key default gen_random_uuid(),
  phone_e164   text not null,
  purpose      text not null
                 check (purpose in ('invite_accept', 'login')),
  invite_id    uuid references public.gh_workspace_invites(id) on delete cascade,
  code_hash    text not null,
  attempts     int not null default 0,
  max_attempts int not null default 5,
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  created_at   timestamptz not null default now(),
  constraint gh_phone_otp_invite_purpose
    check (
      (purpose = 'invite_accept' and invite_id is not null)
      or (purpose = 'login' and invite_id is null)
    )
);

create index if not exists gh_phone_otp_phone_created_idx
  on public.gh_phone_otp_challenges (phone_e164, created_at desc);

alter table public.gh_phone_otp_challenges enable row level security;
revoke all on public.gh_phone_otp_challenges from anon, authenticated;
-- service_role only (BYPASSRLS); no client policies.

-- ----- Update peek: include masked phone (never full number) -----
drop function if exists public.gh_peek_invite(text);

create function public.gh_peek_invite(p_token_hash text)
returns table (
  workspace_name text,
  member_role text,
  expires_at timestamptz,
  phone_masked text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    w.name,
    i.role,
    i.expires_at,
    case
      when i.invited_phone_e164 is null then null
      when length(regexp_replace(i.invited_phone_e164, '\D', '', 'g')) >= 10 then
        -- +98912••••180 style from E.164
        '+' || left(regexp_replace(i.invited_phone_e164, '\D', '', 'g'), 5)
        || '••••'
        || right(regexp_replace(i.invited_phone_e164, '\D', '', 'g'), 3)
      else '••••'
    end
  from public.gh_workspace_invites i
  join public.gh_workspaces w on w.id = i.workspace_id
  where i.token_hash = p_token_hash
    and i.accepted_at is null
    and i.revoked_at is null
    and i.expires_at > now();
$$;

revoke all on function public.gh_peek_invite(text) from public;
grant execute on function public.gh_peek_invite(text) to anon, authenticated;

-- ----- Accept: phone match is required when invite is phone-bound -----
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
  v_phone  text := coalesce(
    (select u.phone from auth.users u where u.id = v_uid),
    ''
  );
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

  -- Phone-bound invite: auth phone must match exactly (E.164).
  if v_invite.invited_phone_e164 is not null then
    if v_phone is null or v_phone = '' or v_phone <> v_invite.invited_phone_e164 then
      raise exception 'gh_invite_phone_mismatch' using errcode = 'P0001';
    end if;
  elsif v_invite.email is not null
     and lower(v_invite.email) <> v_email then
    -- Legacy email invites only.
    raise exception 'gh_invite_email_mismatch' using errcode = 'P0001';
  end if;

  insert into public.gh_profiles (id, phone)
  values (v_uid, nullif(v_phone, ''))
  on conflict (id) do update
    set phone = coalesce(excluded.phone, public.gh_profiles.phone);

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
     jsonb_build_object(
       'role', v_invite.role,
       'first_activation', v_first,
       'channel', case when v_invite.invited_phone_e164 is not null then 'phone' else 'email' end
     ));

  accepted_workspace_id := v_ws.id;
  accepted_workspace_slug := v_ws.slug;
  accepted_member_role := v_invite.role;
  return next;
end;
$$;

revoke all on function public.gh_accept_invite(text) from public, anon;
grant execute on function public.gh_accept_invite(text) to authenticated;
