-- Migration 016 — Progressive stage scoring
-- Adds per-stage point columns and a feature flag to scoring_rules.
-- Defaults match existing flat values so all current groups are unaffected.

ALTER TABLE public.scoring_rules
  ADD COLUMN IF NOT EXISTS gs_correct_outcome  int  NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS gs_exact_score      int  NOT NULL DEFAULT 25,

  ADD COLUMN IF NOT EXISTS r32_correct_outcome int  NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS r32_exact_score     int  NOT NULL DEFAULT 25,

  ADD COLUMN IF NOT EXISTS r16_correct_outcome int  NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS r16_exact_score     int  NOT NULL DEFAULT 25,

  ADD COLUMN IF NOT EXISTS qf_correct_outcome  int  NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS qf_exact_score      int  NOT NULL DEFAULT 25,

  ADD COLUMN IF NOT EXISTS sf_correct_outcome  int  NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS sf_exact_score      int  NOT NULL DEFAULT 25,

  ADD COLUMN IF NOT EXISTS third_correct_outcome int NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS third_exact_score     int NOT NULL DEFAULT 25,

  ADD COLUMN IF NOT EXISTS final_correct_outcome int NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS final_exact_score     int NOT NULL DEFAULT 25,

  ADD COLUMN IF NOT EXISTS use_progressive_scoring boolean NOT NULL DEFAULT false;
