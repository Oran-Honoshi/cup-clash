ALTER TABLE scoring_rules
ADD COLUMN IF NOT EXISTS tournament_lock_at timestamptz;
