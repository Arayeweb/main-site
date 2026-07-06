-- =========================================================
-- Araaye AI orchestration — runs, model calls, outputs, votes,
-- credit reserve/settle infrastructure
-- =========================================================

-- ---------- ai_runs: یک run = یک درخواست کاربر (direct/compare/council) ----------
create table if not exists public.ai_runs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.ai_users(id) on delete cascade,
  conversation_id  uuid,                          -- thread continuity (ai_battles.thread_id سازگار)
  mode             text not null check (mode in ('direct','compare','council')),
  status           text not null default 'running'
                     check (status in ('running','completed','failed','cancelled','settlement_failed')),
  reserved_credits int  not null default 0,
  charged_credits  int  not null default 0,
  refunded_credits int  not null default 0,
  metadata         jsonb not null default '{}',
  created_at       timestamptz not null default now(),
  completed_at     timestamptz,
  constraint ai_runs_credit_nonnegative
    check (reserved_credits >= 0 and charged_credits >= 0 and refunded_credits >= 0),
  constraint ai_runs_credit_settlement_check
    check (
      (status = 'running' and charged_credits + refunded_credits <= reserved_credits)
      or status = 'settlement_failed'
      or (status in ('completed','failed','cancelled') and charged_credits + refunded_credits = reserved_credits)
    )
);

create index if not exists idx_ai_runs_user on public.ai_runs(user_id, created_at desc);
create index if not exists idx_ai_runs_status on public.ai_runs(status) where status = 'running';
create index if not exists idx_ai_runs_conversation on public.ai_runs(conversation_id, created_at desc);

-- Idempotent hardening for environments where an earlier draft of this migration
-- may already have been applied.
alter table public.ai_runs add column if not exists refunded_credits int not null default 0;
alter table public.ai_runs drop constraint if exists ai_runs_status_check;
alter table public.ai_runs
  add constraint ai_runs_status_check
  check (status in ('running','completed','failed','cancelled','settlement_failed'));
update public.ai_runs
   set refunded_credits = greatest(reserved_credits - charged_credits, 0)
 where status in ('completed','failed','cancelled')
   and charged_credits <= reserved_credits
   and charged_credits + refunded_credits <> reserved_credits;
update public.ai_runs
   set status = 'settlement_failed'
 where charged_credits < 0
    or refunded_credits < 0
    or reserved_credits < 0
    or charged_credits + refunded_credits > reserved_credits;
alter table public.ai_runs drop constraint if exists ai_runs_credit_nonnegative;
alter table public.ai_runs
  add constraint ai_runs_credit_nonnegative
  check (reserved_credits >= 0 and charged_credits >= 0 and refunded_credits >= 0);
alter table public.ai_runs drop constraint if exists ai_runs_credit_settlement_check;
alter table public.ai_runs
  add constraint ai_runs_credit_settlement_check
  check (
    (status = 'running' and charged_credits + refunded_credits <= reserved_credits)
    or status = 'settlement_failed'
    or (status in ('completed','failed','cancelled') and charged_credits + refunded_credits = reserved_credits)
  );

-- ---------- model_calls: هر تماس provider در یک run ----------
create table if not exists public.model_calls (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references public.ai_runs(id) on delete cascade,
  provider        text not null,                  -- 'openrouter' | 'openai' | ...
  model           text not null,                  -- شناسه داخلی مدل
  role            text not null default 'answer'  -- answer | critique | synthesis
                    check (role in ('answer','critique','synthesis')),
  status          text not null default 'running'
                    check (status in ('running','completed','failed','cancelled')),
  input_tokens    int,
  output_tokens   int,
  cached_tokens   int,
  cost_usd        numeric(12,8),
  credits_charged int not null default 0,
  ttft_ms         int,
  latency_ms      int,
  error_code      text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_model_calls_run on public.model_calls(run_id);
create index if not exists idx_model_calls_model on public.model_calls(model, created_at desc);

-- ---------- model_outputs: متن نهایی هر تماس ----------
create table if not exists public.model_outputs (
  id             uuid primary key default gen_random_uuid(),
  run_id         uuid not null references public.ai_runs(id) on delete cascade,
  model_call_id  uuid references public.model_calls(id) on delete set null,
  model          text not null,
  content        text not null default '',
  role           text not null default 'assistant',
  created_at     timestamptz not null default now()
);

create index if not exists idx_model_outputs_run on public.model_outputs(run_id);

-- ---------- feedback_votes: رأی کاربر روی خروجی compare/council ----------
create table if not exists public.feedback_votes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.ai_users(id) on delete cascade,
  run_id         uuid not null references public.ai_runs(id) on delete cascade,
  selected_model text,
  rating         int check (rating between 1 and 5),
  metadata       jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  unique (user_id, run_id)
);

create index if not exists idx_feedback_votes_run on public.feedback_votes(run_id);

-- ---------- ai_credit_ledger: اتصال به run و reasonهای جدید ----------
alter table public.ai_credit_ledger
  add column if not exists run_id uuid references public.ai_runs(id) on delete set null;
alter table public.ai_credit_ledger
  add column if not exists metadata jsonb not null default '{}';

create index if not exists idx_ai_credit_ledger_run on public.ai_credit_ledger(run_id);
create index if not exists idx_ai_credit_ledger_user on public.ai_credit_ledger(user_id, created_at desc);

-- reasonهای معتبر جدید (ستون text است؛ فقط مستندسازی):
-- 'reserve' | 'charge' | 'refund' | 'topup' | 'subscription_grant'
-- | 'admin_adjustment' | 'referral_bonus' | 'image_refund' | 'video_refund' | 'usage'

-- ---------- توابع اتمیک کردیت ----------

-- کسر اتمیک: فقط اگر موجودی کافی باشد کم می‌کند و موجودی جدید را برمی‌گرداند.
-- در صورت کمبود موجودی null برمی‌گرداند.
create or replace function public.ai_reserve_credits(
  p_user_id uuid,
  p_amount  int,
  p_run_id  uuid
) returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
  v_reserved int;
  v_status text;
begin
  if p_amount <= 0 then
    raise exception 'amount must be > 0';
  end if;

  select reserved_credits, status
    into v_reserved, v_status
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
  if v_reserved <> p_amount then
    raise exception 'reserve_amount_mismatch';
  end if;
  if exists (
    select 1 from public.ai_credit_ledger
     where run_id = p_run_id and reason = 'reserve'
  ) then
    raise exception 'run_already_reserved';
  end if;

  update public.ai_users
     set credits = credits - p_amount
   where id = p_user_id
     and credits >= p_amount
  returning credits into v_balance;

  if v_balance is null then
    return null; -- insufficient credits
  end if;

  insert into public.ai_credit_ledger (user_id, delta, balance_after, reason, note, run_id)
  values (p_user_id, -p_amount, v_balance, 'reserve', 'reserve for run', p_run_id);

  return v_balance;
end;
$$;

revoke all on function public.ai_reserve_credits(uuid, int, uuid) from public;
revoke all on function public.ai_reserve_credits(uuid, int, uuid) from anon;
revoke all on function public.ai_reserve_credits(uuid, int, uuid) from authenticated;
grant execute on function public.ai_reserve_credits(uuid, int, uuid) to service_role;

-- بازگرداندن اعتبار (refund) — همیشه موفق است.
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

revoke all on function public.ai_refund_credits(uuid, int, uuid, text) from public;
revoke all on function public.ai_refund_credits(uuid, int, uuid, text) from anon;
revoke all on function public.ai_refund_credits(uuid, int, uuid, text) from authenticated;
grant execute on function public.ai_refund_credits(uuid, int, uuid, text) to service_role;

-- تسویه نهایی: charge واقعی را ثبت می‌کند (اعتبار قبلاً هنگام reserve کسر شده؛
-- این تابع فقط مابه‌التفاوت را برمی‌گرداند و ledger را کامل می‌کند).
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
    update public.ai_users
       set credits = credits + v_refund
     where id = p_user_id
    returning credits into v_balance;
  else
    select credits into v_balance from public.ai_users where id = p_user_id;
  end if;

  -- ثبت charge واقعی (delta صفر چون کسر در reserve انجام شده — فقط audit)
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

revoke all on function public.ai_settle_credits(uuid, uuid, int, int) from public;
revoke all on function public.ai_settle_credits(uuid, uuid, int, int) from anon;
revoke all on function public.ai_settle_credits(uuid, uuid, int, int) from authenticated;
grant execute on function public.ai_settle_credits(uuid, uuid, int, int) to service_role;

-- ---------- RLS / direct table access ----------
alter table public.ai_runs enable row level security;
alter table public.model_calls enable row level security;
alter table public.model_outputs enable row level security;
alter table public.feedback_votes enable row level security;

revoke all on public.ai_runs from anon, authenticated;
revoke all on public.model_calls from anon, authenticated;
revoke all on public.model_outputs from anon, authenticated;
revoke all on public.feedback_votes from anon, authenticated;

grant select on public.ai_runs to authenticated;
grant select on public.model_calls to authenticated;
grant select on public.model_outputs to authenticated;
grant select, insert, update on public.feedback_votes to authenticated;

drop policy if exists "ai_runs_select_own" on public.ai_runs;
create policy "ai_runs_select_own"
  on public.ai_runs
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "model_calls_select_own_run" on public.model_calls;
create policy "model_calls_select_own_run"
  on public.model_calls
  for select
  to authenticated
  using (
    exists (
      select 1 from public.ai_runs r
       where r.id = model_calls.run_id
         and r.user_id = auth.uid()
    )
  );

drop policy if exists "model_outputs_select_own_run" on public.model_outputs;
create policy "model_outputs_select_own_run"
  on public.model_outputs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.ai_runs r
       where r.id = model_outputs.run_id
         and r.user_id = auth.uid()
    )
  );

drop policy if exists "feedback_votes_select_own" on public.feedback_votes;
create policy "feedback_votes_select_own"
  on public.feedback_votes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "feedback_votes_insert_own_run" on public.feedback_votes;
create policy "feedback_votes_insert_own_run"
  on public.feedback_votes
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ai_runs r
       where r.id = feedback_votes.run_id
         and r.user_id = auth.uid()
    )
  );

drop policy if exists "feedback_votes_update_own" on public.feedback_votes;
create policy "feedback_votes_update_own"
  on public.feedback_votes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ai_runs r
       where r.id = feedback_votes.run_id
         and r.user_id = auth.uid()
    )
  );
