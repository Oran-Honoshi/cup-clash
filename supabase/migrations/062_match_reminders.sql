-- ============================================================
-- Migration 062 — Match reminder sent-log (24h/1h before-kickoff nudges)
-- ============================================================
-- New Telegram category "match_reminder" (lib/services/telegram.ts) and the
-- in-app reminder sheet both read eligibility from lib/services/match-
-- reminders.ts, which queries matches in a window around each tier (wider
-- than the ~10-15min cron cadence so a missed/delayed tick still catches
-- every match). Without a sent-log, the same match+tier would re-queue a
-- Telegram message on every tick inside that window. In-app dedup is
-- client-side (localStorage), consistent with every other sheet in the app,
-- so no popup-queue table is needed — this table only backstops Telegram.

create table if not exists public.match_reminder_sent (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  match_id text not null references public.matches(id)  on delete cascade,
  tier     text not null check (tier in ('24h', '1h')),
  sent_at  timestamptz not null default now(),
  primary key (user_id, match_id, tier)
);

alter table public.match_reminder_sent enable row level security;

-- Written only by the match-reminder cron (service role). No end-user access needed.
create policy "Service role manages match reminder sent log"
  on public.match_reminder_sent for all
  using (false)
  with check (false);

comment on column public.profiles.notification_preferences is
  'Per-channel notification opt-in/out: {"push": {goals, results, leaderboard, chat, newmember}, "telegram": {goals, results, locking_reminder, weekly_digest, leaderboard, match_reminder}}. Missing keys fall back to per-key defaults in app code, not a blanket on/off.';
