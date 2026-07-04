-- Arena Personas — persona_key on ai_battles for history/analytics
alter table public.ai_battles add column if not exists persona_key text;

create index if not exists ai_battles_persona_key_idx
  on public.ai_battles (persona_key, created_at desc)
  where persona_key is not null;
