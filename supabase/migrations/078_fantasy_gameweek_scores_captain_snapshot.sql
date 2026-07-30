-- ============================================================
-- FANTASY GAMEWEEK SCORES — captain result snapshot
-- ============================================================
-- The Oracle Captain celebration popup (mirrors OracleDuelResultPopup)
-- needs the captain's own points/multiplier, not just the squad's total —
-- same reasoning oracle_duels stores points_user/points_oracle directly on
-- the resolved row rather than recomputing on every read. Snapshotted by
-- lib/services/fantasy-scoring.ts's scoreGameweek() at scoring time (it
-- already computes these per player in its loop), not derived later.
--
-- captain_oracle_active is copied from the pick at scoring time (not
-- joined live) so the popup query never needs to touch
-- fantasy_gameweek_picks — and so a later pick edit for a FUTURE gameweek
-- can never retroactively change what a past resolved result showed.

alter table public.fantasy_gameweek_scores
  add column if not exists captain_fantasy_player_id uuid references public.fantasy_players(id),
  add column if not exists captain_oracle_active boolean not null default false,
  add column if not exists captain_base_points int,
  add column if not exists captain_multiplier int;
