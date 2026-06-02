ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auto_fill_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_fill_home    int     NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS auto_fill_away    int     NOT NULL DEFAULT 0;
