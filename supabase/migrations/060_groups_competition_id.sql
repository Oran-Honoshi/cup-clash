-- Links a group to a specific competition (Premier League, La Liga, UEFA
-- Champions League, ...) instead of the implicit "World Cup 2026" every
-- group has assumed until now. Nullable + backward-compatible: every
-- existing group keeps competition_id = null, and every surface that reads
-- it must keep treating null as "World Cup 2026, use the legacy
-- WORLD_CUP_STAGE_LIST stage filter" (see lib/schedule.ts).
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS competition_id uuid
  REFERENCES competitions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS groups_competition_id_idx ON groups (competition_id) WHERE competition_id IS NOT NULL;
