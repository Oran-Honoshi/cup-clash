-- ============================================================
-- Migration 047 — Telegram notifications: linking security + movement tracking
-- ============================================================
-- The existing Telegram link flow (migration 012) passed the raw profile id
-- as the /start deep-link payload. Anyone who learned another user's id
-- (visible to groupmates via member lists) could send /start <their-id>
-- from their own Telegram account and silently redirect that user's
-- Telegram notifications to themselves. This adds a one-time, expiring
-- token so the deep link payload is a secret the account owner generates
-- themselves, not a guessable/enumerable id.

alter table public.profiles
  add column if not exists telegram_link_token            text,
  add column if not exists telegram_link_token_expires_at timestamptz;

create unique index if not exists profiles_telegram_link_token_key
  on public.profiles (telegram_link_token)
  where telegram_link_token is not null;

comment on column public.profiles.notification_preferences is
  'Per-channel notification opt-in/out: {"push": {goals, results, leaderboard, chat, newmember}, "telegram": {goals, results, locking_reminder, weekly_digest, leaderboard}}. Missing keys fall back to per-key defaults in app code, not a blanket on/off.';

-- ============================================================
-- Leaderboard movement tracking — ranks are computed live (see
-- lib/services/groups.ts getMembers / lib/leaderboard-sort.ts), nothing
-- persists a "previous rank" anywhere. This gives the Telegram "someone
-- overtook you" notification a baseline to diff against per user/group.
-- ============================================================
create table if not exists public.telegram_leaderboard_rank (
  user_id          uuid not null references public.profiles(id) on delete cascade,
  group_id         uuid not null references public.groups(id)   on delete cascade,
  last_rank        integer not null,
  last_notified_at timestamptz,
  updated_at       timestamptz not null default now(),
  primary key (user_id, group_id)
);

alter table public.telegram_leaderboard_rank enable row level security;

-- Written only by the scores cron (service role). No end-user access needed.
create policy "Service role manages leaderboard rank tracking"
  on public.telegram_leaderboard_rank for all
  using (false)
  with check (false);
