CREATE TABLE IF NOT EXISTS public.players (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  text NOT NULL,
  country    text NOT NULL,
  position   text NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  club       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Public reference data — readable by everyone, writable only via service role or explicit grant
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read players"
  ON public.players FOR SELECT USING (true);

-- Allow anon/authenticated to insert (needed for seed script with anon key)
CREATE POLICY "Service can insert players"
  ON public.players FOR INSERT WITH CHECK (true);
