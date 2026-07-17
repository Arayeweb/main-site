-- One lifetime free image per Telegram user (acquisition taste)
alter table public.telegram_users
  add column if not exists free_image_used boolean not null default false;
