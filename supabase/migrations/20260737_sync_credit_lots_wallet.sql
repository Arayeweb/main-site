-- =========================================================
-- Sync ai_users.credits wallet with ai_credit_lots balance
-- and keep them consistent going forward.
-- =========================================================

-- 1. Backfill missing credit lots for any user whose wallet is positive but has no lots.
--    This covers users credited before the lot system or via paths that only updated the column.
insert into public.ai_credit_lots (
  user_id,
  source,
  amount,
  remaining,
  expires_at,
  metadata
)
select
  id,
  'legacy_balance',
  credits,
  credits,
  now() + interval '12 months',
  jsonb_build_object('backfilled_from_ai_users_credits', true)
from public.ai_users
where credits > 0
  and not exists (
    select 1 from public.ai_credit_lots l where l.user_id = ai_users.id
  );

-- 2. Recompute ai_users.credits from the sum of remaining lots for all users.
--    Users with no lots get 0.
update public.ai_users u
set credits = coalesce(t.lot_balance, 0)
from (
  select user_id, coalesce(sum(remaining), 0) as lot_balance
  from public.ai_credit_lots
  group by user_id
) t
where t.user_id = u.id;

update public.ai_users
set credits = 0
where credits > 0
  and not exists (
    select 1 from public.ai_credit_lots l where l.user_id = ai_users.id
  );

-- 3. Helper function: sync one user's wallet to their lot balance.
create or replace function public.ai_sync_user_credits(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lot_balance int;
  v_current int;
begin
  select coalesce(sum(remaining), 0)
    into v_lot_balance
    from public.ai_credit_lots
   where user_id = p_user_id;

  select credits into v_current from public.ai_users where id = p_user_id;

  if v_current is distinct from v_lot_balance then
    update public.ai_users
       set credits = v_lot_balance
     where id = p_user_id;
  end if;

  return v_lot_balance;
end;
$$;

revoke all on function public.ai_sync_user_credits(uuid) from public, anon, authenticated;
grant execute on function public.ai_sync_user_credits(uuid) to service_role;

-- 4. Patch the reserve function to sync the wallet before the balance check,
--    so any drift between ai_users.credits and lots is self-healing.
create or replace function public.ai_prepare_run_and_reserve_credits(
  p_user_id          uuid,
  p_run_id           uuid,
  p_mode             text,
  p_conversation_id  uuid,
  p_reserved_credits int,
  p_metadata         jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan text;
  v_balance int;
  v_conv uuid;
  v_lots jsonb;
begin
  if p_reserved_credits <= 0 then
    raise exception 'amount must be > 0';
  end if;

  if p_mode not in ('direct', 'compare', 'council') then
    raise exception 'invalid_mode';
  end if;

  -- Heal drift before checking balance.
  perform public.ai_sync_user_credits(p_user_id);

  select plan, credits
    into v_plan, v_balance
    from public.ai_users
   where id = p_user_id
   for update;

  if v_plan is null then
    raise exception 'user_not_found';
  end if;

  if v_balance < p_reserved_credits then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credits');
  end if;

  begin
    v_lots := public.ai_consume_credit_lots(p_user_id, p_reserved_credits);
  exception
    when others then
      return jsonb_build_object('ok', false, 'error', 'insufficient_credits');
  end;

  v_conv := coalesce(p_conversation_id, p_run_id);

  insert into public.ai_runs (
    id, user_id, conversation_id, mode, status, reserved_credits, metadata
  ) values (
    p_run_id, p_user_id, v_conv, p_mode, 'running', p_reserved_credits, coalesce(p_metadata, '{}'::jsonb)
  );

  update public.ai_users
     set credits = credits - p_reserved_credits
   where id = p_user_id
  returning credits into v_balance;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id, metadata)
  values (
    p_user_id,
    -p_reserved_credits,
    v_balance,
    'reserve',
    'reserve for run',
    p_run_id,
    jsonb_build_object('lots', v_lots)
  );

  return jsonb_build_object(
    'ok', true,
    'run_id', p_run_id,
    'conversation_id', v_conv,
    'plan', v_plan,
    'credits_remaining', v_balance
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'run_exists');
  when others then
    raise;
end;
$$;
