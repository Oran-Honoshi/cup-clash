-- Group stage phase prize: optional reward for the member leading after all 48 group stage matches
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS enable_group_stage_prize BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_stage_prize_amount  NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS group_stage_prize_label   TEXT;
