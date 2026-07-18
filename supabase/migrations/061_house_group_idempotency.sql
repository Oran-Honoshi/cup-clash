-- At most one auto-created house-rules public group per competition — the
-- DB-level backstop for scripts/create-house-group.ts's idempotent
-- creation (mirrors the news_articles/user_follows dedupe pattern:
-- migrations 038/039).
CREATE UNIQUE INDEX IF NOT EXISTS groups_house_public_per_competition_key
  ON groups (competition_id)
  WHERE rules_mode = 'house_rules' AND is_public = true AND competition_id IS NOT NULL;
