alter table public.profiles
  add column if not exists telegram_language_code text;

comment on column public.profiles.telegram_language_code is
  'IETF language tag from Telegram message.from.language_code at link time — lets server-sent Telegram notifications (goal alerts, digests, etc.) route through lib/i18n.ts instead of hardcoded English.';
