-- =========================================================
-- Araaye AI — Telegram acquisition funnel (Phase 1)
-- Bot = acquisition channel; web = Compare/Council product.
-- Admin metrics: query telegram_events grouped by event name.
-- =========================================================

-- ---------- telegram_users ----------
create table if not exists public.telegram_users (
  id                    uuid primary key default gen_random_uuid(),
  telegram_id           bigint not null unique,
  username              text,
  first_name            text,
  last_name             text,
  phone                 text,
  araaye_user_id        uuid references public.ai_users(id) on delete set null,
  joined_required_channel boolean not null default false,
  joined_sales_channel  boolean not null default false,
  free_daily_used       int not null default 0,
  free_daily_reset_at   timestamptz,
  total_messages        int not null default 0,
  total_web_clicks      int not null default 0,
  total_payments        int not null default 0,
  state                 text not null default 'idle',
  state_data            jsonb not null default '{}',
  chat_context          jsonb not null default '[]',
  is_chat_running       boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint telegram_users_state_check
    check (state in ('idle', 'chat', 'awaiting_phone', 'confirm_order')),
  constraint telegram_users_free_daily_nonneg
    check (free_daily_used >= 0)
);

create index if not exists telegram_users_telegram_id_idx on public.telegram_users (telegram_id);
create index if not exists telegram_users_araaye_user_id_idx on public.telegram_users (araaye_user_id);
create index if not exists telegram_users_created_at_idx on public.telegram_users (created_at desc);
create index if not exists telegram_users_free_daily_reset_idx on public.telegram_users (free_daily_reset_at);

-- ---------- telegram_messages ----------
create table if not exists public.telegram_messages (
  id                uuid primary key default gen_random_uuid(),
  telegram_user_id  uuid not null references public.telegram_users(id) on delete cascade,
  direction         text not null check (direction in ('in', 'out')),
  message_type      text not null default 'text',
  text_preview      text,
  ai_run_id         uuid references public.ai_runs(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists telegram_messages_user_idx on public.telegram_messages (telegram_user_id, created_at desc);

-- ---------- telegram_events ----------
create table if not exists public.telegram_events (
  id                uuid primary key default gen_random_uuid(),
  telegram_user_id  uuid references public.telegram_users(id) on delete set null,
  telegram_id       bigint,
  event             text not null,
  metadata          jsonb not null default '{}',
  created_at        timestamptz not null default now()
);

create index if not exists telegram_events_event_idx on public.telegram_events (event, created_at desc);
create index if not exists telegram_events_user_idx on public.telegram_events (telegram_user_id, created_at desc);
create index if not exists telegram_events_telegram_id_idx on public.telegram_events (telegram_id, created_at desc);

-- ---------- telegram_payment_orders ----------
create table if not exists public.telegram_payment_orders (
  id                uuid primary key default gen_random_uuid(),
  telegram_user_id  uuid not null references public.telegram_users(id) on delete cascade,
  package_id        text not null,
  amount_toman      int not null,
  credits           int not null,
  phone             text,
  zibal_track_id    text,
  status            text not null default 'pending'
                      check (status in ('pending', 'paid', 'failed')),
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create index if not exists telegram_payment_orders_track_idx on public.telegram_payment_orders (zibal_track_id);
create index if not exists telegram_payment_orders_user_idx on public.telegram_payment_orders (telegram_user_id, created_at desc);
create index if not exists telegram_payment_orders_status_idx on public.telegram_payment_orders (status, created_at desc);

-- ---------- RLS: service_role only ----------
alter table public.telegram_users enable row level security;
alter table public.telegram_messages enable row level security;
alter table public.telegram_events enable row level security;
alter table public.telegram_payment_orders enable row level security;

revoke all on public.telegram_users from anon, authenticated;
revoke all on public.telegram_messages from anon, authenticated;
revoke all on public.telegram_events from anon, authenticated;
revoke all on public.telegram_payment_orders from anon, authenticated;

-- ---------- RPC: free quota status (reset bucket in Asia/Tehran) ----------
create or replace function public.telegram_get_free_quota(
  p_telegram_id       bigint,
  p_daily_limit       int,
  p_first_day_limit   int
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user public.telegram_users%rowtype;
  v_limit int;
  v_today_tehran date;
  v_reset_at timestamptz;
begin
  v_today_tehran := (now() at time zone 'Asia/Tehran')::date;
  v_reset_at := ((v_today_tehran + 1)::timestamp at time zone 'Asia/Tehran');

  select * into v_user
    from public.telegram_users
   where telegram_id = p_telegram_id
   for update;

  if v_user.id is null then
    return jsonb_build_object('ok', false, 'error', 'user_not_found');
  end if;

  if v_user.free_daily_reset_at is null
     or v_user.free_daily_reset_at <= now() then
    update public.telegram_users
       set free_daily_used = 0,
           free_daily_reset_at = v_reset_at,
           updated_at = now()
     where id = v_user.id;
    v_user.free_daily_used := 0;
  end if;

  if (v_user.created_at at time zone 'Asia/Tehran')::date = v_today_tehran then
    v_limit := p_first_day_limit;
  else
    v_limit := p_daily_limit;
  end if;

  return jsonb_build_object(
    'ok', true,
    'user_id', v_user.id,
    'used', v_user.free_daily_used,
    'limit', v_limit,
    'remaining', greatest(0, v_limit - v_user.free_daily_used),
    'can_use', v_user.free_daily_used < v_limit
  );
end;
$$;

-- ---------- RPC: consume one free message (after successful AI response) ----------
create or replace function public.telegram_consume_free_quota(
  p_telegram_user_id  uuid,
  p_daily_limit       int,
  p_first_day_limit   int
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user public.telegram_users%rowtype;
  v_limit int;
  v_today_tehran date;
  v_reset_at timestamptz;
begin
  v_today_tehran := (now() at time zone 'Asia/Tehran')::date;
  v_reset_at := ((v_today_tehran + 1)::timestamp at time zone 'Asia/Tehran');

  select * into v_user
    from public.telegram_users
   where id = p_telegram_user_id
   for update;

  if v_user.id is null then
    return jsonb_build_object('ok', false, 'error', 'user_not_found');
  end if;

  if v_user.free_daily_reset_at is null
     or v_user.free_daily_reset_at <= now() then
    update public.telegram_users
       set free_daily_used = 0,
           free_daily_reset_at = v_reset_at
     where id = v_user.id;
    v_user.free_daily_used := 0;
  end if;

  if (v_user.created_at at time zone 'Asia/Tehran')::date = v_today_tehran then
    v_limit := p_first_day_limit;
  else
    v_limit := p_daily_limit;
  end if;

  if v_user.free_daily_used >= v_limit then
    return jsonb_build_object('ok', false, 'error', 'limit_reached', 'limit', v_limit);
  end if;

  update public.telegram_users
     set free_daily_used = free_daily_used + 1,
         total_messages = total_messages + 1,
         updated_at = now()
   where id = p_telegram_user_id;

  return jsonb_build_object(
    'ok', true,
    'used', v_user.free_daily_used + 1,
    'limit', v_limit,
    'remaining', greatest(0, v_limit - v_user.free_daily_used - 1)
  );
end;
$$;

-- ---------- RPC: idempotent payment settlement ----------
create or replace function public.telegram_settle_payment_order(
  p_order_id    uuid,
  p_track_id    text,
  p_paid_amount int,
  p_araaye_user_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.telegram_payment_orders%rowtype;
  v_balance int;
  v_tolerance int := 10;
begin
  select * into v_order
    from public.telegram_payment_orders
   where id = p_order_id
   for update;

  if v_order.id is null then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  if v_order.status = 'paid' then
    return jsonb_build_object(
      'ok', true,
      'already_paid', true,
      'credits_granted', v_order.credits,
      'araaye_user_id', p_araaye_user_id
    );
  end if;

  if abs(p_paid_amount - v_order.amount_toman) > v_tolerance then
    return jsonb_build_object('ok', false, 'error', 'amount_mismatch');
  end if;

  if p_araaye_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'no_araaye_user');
  end if;

  update public.ai_users
     set credits = credits + v_order.credits
   where id = p_araaye_user_id
  returning credits into v_balance;

  if v_balance is null then
    return jsonb_build_object('ok', false, 'error', 'user_not_found');
  end if;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note)
  values (
    p_araaye_user_id,
    v_order.credits,
    v_balance,
    'topup',
    'telegram package ' || v_order.package_id
  );

  update public.telegram_payment_orders
     set status = 'paid',
         paid_at = now(),
         zibal_track_id = coalesce(zibal_track_id, p_track_id)
   where id = p_order_id;

  update public.telegram_users
     set total_payments = total_payments + 1,
         araaye_user_id = coalesce(araaye_user_id, p_araaye_user_id),
         updated_at = now()
   where id = v_order.telegram_user_id;

  return jsonb_build_object(
    'ok', true,
    'already_paid', false,
    'credits_granted', v_order.credits,
    'araaye_user_id', p_araaye_user_id,
    'balance_after', v_balance
  );
end;
$$;

revoke all on function public.telegram_get_free_quota(bigint, int, int) from public, anon, authenticated;
grant execute on function public.telegram_get_free_quota(bigint, int, int) to service_role;

revoke all on function public.telegram_consume_free_quota(uuid, int, int) from public, anon, authenticated;
grant execute on function public.telegram_consume_free_quota(uuid, int, int) to service_role;

revoke all on function public.telegram_settle_payment_order(uuid, text, int, uuid) from public, anon, authenticated;
grant execute on function public.telegram_settle_payment_order(uuid, text, int, uuid) to service_role;
