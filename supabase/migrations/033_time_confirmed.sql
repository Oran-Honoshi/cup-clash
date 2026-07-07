-- ============================================================
-- Migration 033 — time_confirmed flag for placeholder kickoff dates
-- ============================================================
-- QF/SF/Final rows are sometimes created before API-Football has published
-- the real fixture (bracket structure is known before scheduling is). Such
-- rows carry a guessed kickoff_at so the UI can honestly show "Date TBD"
-- instead of a fake date users might plan around.

alter table public.matches
  add column if not exists time_confirmed boolean not null default true;

comment on column public.matches.time_confirmed is
  'False when kickoff_at/stadium/city are a guessed placeholder, not yet confirmed by API-Football.';

-- Backfill: the QF/SF/Final rows manually seeded ahead of API confirmation
-- (no api_fixture_id yet) carry guessed dates copied from the bracket UI's
-- fallback skeleton, not real fixture data.
update public.matches
set time_confirmed = false
where stage in ('QF', 'SF', 'Final')
  and api_fixture_id is null;
