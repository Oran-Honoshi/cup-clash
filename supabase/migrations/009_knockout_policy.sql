ALTER TABLE scoring_rules
  ADD COLUMN IF NOT EXISTS knockout_policy text
  NOT NULL DEFAULT 'regular_90'
  CHECK (knockout_policy IN ('regular_90', 'inc_extra_time', 'to_qualify'));
