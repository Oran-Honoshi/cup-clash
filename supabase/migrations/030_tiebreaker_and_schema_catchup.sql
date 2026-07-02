-- ============================================================
-- Migration 030 — Golden Guess tiebreaker + schema drift catch-up
-- Safe to run even if columns already exist live.
-- ============================================================

-- ── Catch-up: columns that were added directly to production without a
--    tracked migration. Declared here so migration history matches reality.
alter table public.group_predictions
  add column if not exists pred_type  text,
  add column if not exists pred_value text;

alter table public.matches
  add column if not exists minute       integer,
  add column if not exists match_events jsonb;

-- ── Golden Guess tiebreaker: "guess the minute of the first goal in the Final".
--    Collected the same way as Tournament Winner / Top Scorer / Top Assister —
--    a group_predictions row with match_id = 'tournament_final_goal_minute',
--    pred_type = 'final_goal_minute', pred_value = the guessed minute (as text).
--    No new column needed; this reuses the existing pred_type/pred_value pattern.

-- Store the actual result once the Final is played: the minute of the first
-- goal event in matches.match_events for the Final match (id = 'final').
alter table public.matches
  add column if not exists final_first_goal_minute integer;

comment on column public.matches.final_first_goal_minute is
  'Minute of the first goal scored in the Final match (any goal/own_goal/penalty event), used as the Golden Guess tiebreaker. Populated once the Final is played.';
