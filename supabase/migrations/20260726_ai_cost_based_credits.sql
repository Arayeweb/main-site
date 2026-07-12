-- =========================================================
-- Cost-based AI credits: expiring credit lots + financial run fields
-- =========================================================

create table if not exists public.ai_credit_lots (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  user_id          uuid not null references public.ai_users(id) on delete cascade,
  source           text not null default 'purchase',
  amount           int not null check (amount > 0),
  remaining        int not null check (remaining >= 0),
  expires_at       timestamptz,
  related_order_id uuid references public.ai_orders(id) on delete set null,
  metadata         jsonb not null default '{}'
);

create index if not exists idx_ai_credit_lots_user_available
  on public.ai_credit_lots(user_id, expires_at, created_at)
  where remaining > 0;

alter table public.ai_credit_lots enable row level security;
revoke all on public.ai_credit_lots from anon, authenticated;

insert into public.ai_credit_lots (user_id, source, amount, remaining, expires_at, metadata)
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
    select 1 from public.ai_credit_lots l
    where l.user_id = ai_users.id
  );

alter table public.model_calls
  add column if not exists displayed_model text,
  add column if not exists actual_model text,
  add column if not exists reasoning_tokens int,
  add column if not exists tool_cost_usd numeric(12,8),
  add column if not exists exchange_rate_toman int,
  add column if not exists pricing_multiplier numeric(8,4),
  add column if not exists credit_value_toman int,
  add column if not exists revenue_toman int,
  add column if not exists gross_profit_toman int,
  add column if not exists gross_margin_percent numeric(6,2),
  add column if not exists pricing_snapshot jsonb;

alter table public.ai_runs
  add column if not exists total_provider_cost_usd numeric(12,8),
  add column if not exists total_revenue_toman int,
  add column if not exists total_gross_profit_toman int,
  add column if not exists pricing_snapshot jsonb;

update public.ai_settings
set data = jsonb_set(
  coalesce(data, '{}'::jsonb),
  '{free_signup_credits}',
  '10'::jsonb,
  true
)
where id = 1;

update public.ai_plans
set credits = 10,
    description = 'رایگان امتحان کنید — چند گفت‌وگوی اولیه برای آشنایی با آرایه AI',
    features = '["رایگان امتحان کنید", "چند گفت‌وگوی اولیه", "فقط مدل‌های اقتصادی"]'::jsonb,
    updated_at = now()
where id = 'free';

update public.ai_plans
set price_toman = 299000, credits = 260, updated_at = now()
where id = 'plus';

update public.ai_plans
set price_toman = 649000, credits = 600, is_featured = true, updated_at = now()
where id = 'pro';

update public.ai_plans
set price_toman = 1290000, credits = 1250, updated_at = now()
where id = 'max';

update public.ai_plans
set is_active = false, updated_at = now()
where id in ('team_mini', 'business');

alter table public.ai_users alter column credits set default 10;

create or replace function public.ai_consume_credit_lots(
  p_user_id uuid,
  p_amount int
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_remaining int := p_amount;
  v_take int;
  v_lot record;
  v_lots jsonb := '[]'::jsonb;
begin
  if p_amount <= 0 then
    raise exception 'amount must be > 0';
  end if;

  for v_lot in
    select id, remaining
      from public.ai_credit_lots
     where user_id = p_user_id
       and remaining > 0
       and (expires_at is null or expires_at > now())
     order by expires_at asc nulls last, created_at asc
     for update
  loop
    exit when v_remaining <= 0;
    v_take := least(v_lot.remaining, v_remaining);
    update public.ai_credit_lots
       set remaining = remaining - v_take
     where id = v_lot.id;
    v_lots := v_lots || jsonb_build_array(jsonb_build_object('lot_id', v_lot.id, 'amount', v_take));
    v_remaining := v_remaining - v_take;
  end loop;

  if v_remaining > 0 then
    raise exception 'insufficient_credit_lots';
  end if;

  return v_lots;
end;
$$;

create or replace function public.ai_restore_credit_lots(
  p_user_id uuid,
  p_run_id uuid,
  p_amount int
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_remaining int := p_amount;
  v_item jsonb;
  v_take int;
  v_lots jsonb;
begin
  if p_amount <= 0 then
    return;
  end if;

  select metadata -> 'lots'
    into v_lots
    from public.ai_credit_ledger
   where user_id = p_user_id
     and run_id = p_run_id
     and reason = 'reserve'
   order by created_at desc
   limit 1;

  if v_lots is null then
    return;
  end if;

  for v_item in select * from jsonb_array_elements(v_lots)
  loop
    exit when v_remaining <= 0;
    v_take := least((v_item ->> 'amount')::int, v_remaining);
    update public.ai_credit_lots
       set remaining = remaining + v_take
     where id = (v_item ->> 'lot_id')::uuid
       and user_id = p_user_id;
    v_remaining := v_remaining - v_take;
  end loop;
end;
$$;

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
    raise exception 'run_already_exists';
end;
$$;

create or replace function public.ai_refund_credits(
  p_user_id uuid,
  p_amount  int,
  p_run_id  uuid,
  p_note    text default 'refund'
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
  v_reserved int;
  v_charged int;
  v_refunded int;
  v_status text;
  v_remaining_refundable int;
begin
  if p_amount <= 0 then
    raise exception 'amount must be > 0';
  end if;

  select reserved_credits, charged_credits, refunded_credits, status
    into v_reserved, v_charged, v_refunded, v_status
    from public.ai_runs
   where id = p_run_id
     and user_id = p_user_id
   for update;

  if v_reserved is null then
    raise exception 'run_not_found';
  end if;
  if v_status <> 'running' then
    raise exception 'run_not_running';
  end if;

  v_remaining_refundable := greatest(v_reserved - v_charged - v_refunded, 0);
  if p_amount > v_remaining_refundable then
    raise exception 'refund_exceeds_reserved';
  end if;

  perform public.ai_restore_credit_lots(p_user_id, p_run_id, p_amount);

  update public.ai_users
     set credits = credits + p_amount
   where id = p_user_id
  returning credits into v_balance;

  update public.ai_runs
     set refunded_credits = refunded_credits + p_amount
   where id = p_run_id;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id)
  values (p_user_id, p_amount, v_balance, 'refund', p_note, p_run_id);

  return v_balance;
end;
$$;

create or replace function public.ai_settle_credits(
  p_user_id  uuid,
  p_run_id   uuid,
  p_reserved int,
  p_actual   int
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
  v_refund  int;
  v_reserved int;
  v_charged int;
  v_refunded int;
  v_status text;
begin
  if p_actual < 0 then
    raise exception 'charged must be >= 0';
  end if;

  select reserved_credits, charged_credits, refunded_credits, status
    into v_reserved, v_charged, v_refunded, v_status
    from public.ai_runs
   where id = p_run_id
     and user_id = p_user_id
   for update;

  if v_reserved is null then
    raise exception 'run_not_found';
  end if;
  if v_status <> 'running' then
    raise exception 'run_not_running';
  end if;
  if v_charged <> 0 or v_refunded <> 0 then
    raise exception 'run_already_settled';
  end if;
  if p_reserved <> v_reserved then
    raise exception 'reserved_amount_mismatch';
  end if;
  if p_actual > v_reserved then
    raise exception 'charged_exceeds_reserved';
  end if;

  v_refund := v_reserved - p_actual;

  if v_refund > 0 then
    perform public.ai_restore_credit_lots(p_user_id, p_run_id, v_refund);
    update public.ai_users
       set credits = credits + v_refund
     where id = p_user_id
    returning credits into v_balance;
  else
    select credits into v_balance from public.ai_users where id = p_user_id;
  end if;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id, metadata)
  values (
    p_user_id,
    0,
    v_balance,
    'charge',
    format('charged %s of %s reserved', p_actual, v_reserved),
    p_run_id,
    jsonb_build_object(
      'reserved_credits', v_reserved,
      'charged_credits', p_actual,
      'refunded_credits', v_refund
    )
  );

  if v_refund > 0 then
    insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id)
    values (p_user_id, v_refund, v_balance, 'refund', 'unused reserved credits', p_run_id);
  end if;

  update public.ai_runs
     set charged_credits = p_actual,
         refunded_credits = v_refund
   where id = p_run_id;

  return v_balance;
end;
$$;

revoke all on function public.ai_consume_credit_lots(uuid, int) from public, anon, authenticated;
revoke all on function public.ai_restore_credit_lots(uuid, uuid, int) from public, anon, authenticated;
grant execute on function public.ai_consume_credit_lots(uuid, int) to service_role;
grant execute on function public.ai_restore_credit_lots(uuid, uuid, int) to service_role;
