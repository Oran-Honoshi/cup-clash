-- ============================================================
-- Migration 070 — Domestic cup coverage: FA Cup, League Cup, Copa del
-- Rey, Coppa Italia, DFB-Pokal, Coupe de France, Israel State Cup, Copa
-- do Brasil, US Open Cup.
--
-- Data-ingestion only, following the exact pattern from migration
-- 065/068 — no schema change needed (`competitions.type` already allows
-- 'cup', `competitions.country` already exists since migration 069).
--
-- country values reuse the exact strings already backfilled in
-- migration 069 (England/Spain/Italy/Germany/France/Israel/United
-- States/Brazil) so these cups join straight into the existing
-- country-follow model without a second backfill pass.
-- ============================================================

insert into public.competitions (name, type, country)
select v.name, v.type, v.country
from (values
  ('FA Cup',            'cup', 'England'),
  ('League Cup',        'cup', 'England'),
  ('Copa del Rey',      'cup', 'Spain'),
  ('Coppa Italia',      'cup', 'Italy'),
  ('DFB-Pokal',         'cup', 'Germany'),
  ('Coupe de France',   'cup', 'France'),
  ('Israel State Cup',  'cup', 'Israel'),
  ('Copa do Brasil',    'cup', 'Brazil'),
  ('US Open Cup',       'cup', 'United States')
) as v(name, type, country)
where not exists (
  select 1 from public.competitions c where c.name = v.name
);
