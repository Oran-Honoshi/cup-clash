-- Per-match live statistics snapshot (possession, corners, shots, fouls, cards)
-- fetched from API-Football fixtures/statistics endpoint for live matches only.
-- Nullable: not every competition/match has full stats coverage, and it's only
-- populated once a match goes live.
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS live_stats jsonb;

-- Track the elapsed minute stats were last fetched at, so the cron can skip
-- redundant fixtures/statistics calls when the match minute hasn't advanced
-- (e.g. during half-time or VAR stoppages).
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS live_stats_minute integer;
