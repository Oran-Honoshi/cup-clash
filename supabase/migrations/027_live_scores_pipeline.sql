-- Link matches rows to API-Football fixture IDs for cross-referencing in cron
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS api_fixture_id integer;
CREATE INDEX IF NOT EXISTS idx_matches_api_fixture_id ON public.matches(api_fixture_id);

-- Allow server-side (cron) writes to live_scores.
-- Service role always bypasses RLS; these policies cover the anon-key fallback.
CREATE POLICY "Service can insert live_scores" ON public.live_scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update live_scores" ON public.live_scores
  FOR UPDATE USING (true);
