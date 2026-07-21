-- Allow unified auth OTP purpose (login-or-register in one flow)
alter table public.ai_otp_challenges
  drop constraint if exists ai_otp_challenges_purpose_check;

alter table public.ai_otp_challenges
  add constraint ai_otp_challenges_purpose_check
  check (purpose in ('login', 'register', 'reset', 'auth'));
