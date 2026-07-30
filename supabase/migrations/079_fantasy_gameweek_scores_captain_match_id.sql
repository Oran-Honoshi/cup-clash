-- Snapshot which match the captain's points/multiplier were resolved
-- against, alongside the columns added in 078 — avoids re-deriving the
-- match from api_team_id/gameweek on every popup read.
alter table public.fantasy_gameweek_scores
  add column if not exists captain_match_id text references public.matches(id);
