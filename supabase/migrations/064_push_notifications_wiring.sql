-- ============================================================
-- Migration 064 — Web Push: schema drift catch-up + new pref categories
-- ============================================================
-- Migration 012 created push_subscriptions.auth (text), but every piece of
-- code that has ever written or read this table (lib/pwa.ts subscribeToPush,
-- app/api/push/route.ts) uses "auth_key" — the live table has always
-- actually had an auth_key column, not auth. This documents that reality
-- rather than the never-matching original spec. Non-destructive: if a
-- database somehow still has the original "auth" column (never observed in
-- production, but possible on an unmigrated environment), it's renamed
-- rather than dropped so no data is lost.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'push_subscriptions' and column_name = 'auth'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'push_subscriptions' and column_name = 'auth_key'
  ) then
    alter table public.push_subscriptions rename column auth to auth_key;
  end if;
end $$;

alter table public.push_subscriptions
  add column if not exists auth_key text;

comment on column public.push_subscriptions.auth_key is
  'PushSubscriptionKeys.auth, base64-encoded — named auth_key (not auth, migration 012''s original name) to match every reader/writer in lib/pwa.ts and app/api/push/route.ts.';

-- ── Push preference categories ──────────────────────────────────────────────
-- Wiring up the previously-unused push_subscriptions table (see project
-- history) adds two new push categories beyond the five already exposed in
-- components/notifications/notifications-client.tsx (goals, results,
-- leaderboard, chat, newmember): oracle_duel and match_reminder. Both
-- default OFF (see lib/services/push.ts PUSH_PREF_DEFAULTS), matching the
-- established pattern for every new opt-in notification category
-- (TELEGRAM_PREF_DEFAULTS' match_reminder, weekly_digest, etc.).
comment on column public.profiles.notification_preferences is
  'Per-channel notification opt-in/out: {"push": {goals, results, leaderboard, chat, newmember, oracle_duel, match_reminder}, "telegram": {goals, results, locking_reminder, weekly_digest, leaderboard, match_reminder}}. Missing keys fall back to per-key defaults in app code, not a blanket on/off.';
