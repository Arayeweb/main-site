-- Owner edit panel: private access_token (magic link), same pattern as fastweb_orders
alter table public.bizcards
  add column if not exists access_token text;

create unique index if not exists bizcards_access_token_uidx
  on public.bizcards (access_token)
  where access_token is not null;
