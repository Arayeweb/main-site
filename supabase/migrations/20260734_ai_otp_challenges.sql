-- OTP challenges for Araaye AI auth (login / register / password reset)
create table if not exists public.ai_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  purpose text not null check (purpose in ('login', 'register', 'reset', 'auth')),
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ai_otp_challenges_lookup_idx
  on public.ai_otp_challenges (phone, purpose, created_at desc);

create index if not exists ai_otp_challenges_expires_idx
  on public.ai_otp_challenges (expires_at);

alter table public.ai_otp_challenges enable row level security;
