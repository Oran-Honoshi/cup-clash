-- ============================================================
-- Migration 065 — Expanded competition coverage: Copa Libertadores,
-- Copa Sudamericana, MLS, Brazil Serie A.
--
-- Data-ingestion only (per today's investigation, see
-- expanded-competition-coverage-investigation memory). Purely additive
-- seed rows following the exact pattern from migration 037 — no schema
-- change needed (`competitions.type` check constraint already allows
-- 'league'/'cup'/'tournament').
--
-- Deliberately NOT creating public house-rules groups for these four —
-- that's a separate product decision, out of scope for this migration.
-- ============================================================

insert into public.competitions (name, type)
select v.name, v.type
from (values
  ('Copa Libertadores', 'cup'),
  ('Copa Sudamericana', 'cup'),
  ('MLS',                'league'),
  ('Brazil Serie A',     'league')
) as v(name, type)
where not exists (
  select 1 from public.competitions c where c.name = v.name
);
