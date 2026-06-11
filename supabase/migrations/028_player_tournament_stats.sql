-- Tracks cumulative goals and assists per player across all WC2026 matches.
-- Rebuilt from scratch after each cron run by reading live_scores.raw_data.goals.
CREATE TABLE IF NOT EXISTS public.player_tournament_stats (
  api_player_id  integer PRIMARY KEY,
  player_name    text NOT NULL,   -- abbreviated name from API (e.g. "J. Quinones")
  full_name      text,            -- full name from players table (e.g. "Julio González")
  team_name      text,
  goals          integer NOT NULL DEFAULT 0,
  assists        integer NOT NULL DEFAULT 0,
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE public.player_tournament_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read player tournament stats"
  ON public.player_tournament_stats FOR SELECT USING (true);
