-- =========================================================
-- Combined prepare + reserve — one round-trip for ai_runs insert + credit hold
-- =========================================================

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
begin
  if p_reserved_credits <= 0 then
    raise exception 'amount must be > 0';
  end if;

  if p_mode not in ('direct', 'compare', 'council') then
    raise exception 'invalid_mode';
  end if;

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

  v_conv := coalesce(p_conversation_id, p_run_id);

  insert into public.ai_runs (
    id,
    user_id,
    conversation_id,
    mode,
    status,
    reserved_credits,
    metadata
  ) values (
    p_run_id,
    p_user_id,
    v_conv,
    p_mode,
    'running',
    p_reserved_credits,
    coalesce(p_metadata, '{}'::jsonb)
  );

  update public.ai_users
     set credits = credits - p_reserved_credits
   where id = p_user_id
  returning credits into v_balance;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id)
  values (p_user_id, -p_reserved_credits, v_balance, 'reserve', 'reserve for run', p_run_id);

  return jsonb_build_object(
    'ok', true,
    'run_id', p_run_id,
    'conversation_id', v_conv,
    'plan', v_plan,
    'credits_remaining', v_balance
  );
exception
  when unique_violation then
    raise exception 'run_already_exists';
end;
$$;

revoke all on function public.ai_prepare_run_and_reserve_credits(uuid, uuid, text, uuid, int, jsonb) from public;
revoke all on function public.ai_prepare_run_and_reserve_credits(uuid, uuid, text, uuid, int, jsonb) from anon;
revoke all on function public.ai_prepare_run_and_reserve_credits(uuid, uuid, text, uuid, int, jsonb) from authenticated;
grant execute on function public.ai_prepare_run_and_reserve_credits(uuid, uuid, text, uuid, int, jsonb) to service_role;
