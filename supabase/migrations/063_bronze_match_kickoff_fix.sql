-- ============================================================
-- Migration 063 — correct bronze/3rd-place match kickoff time
-- ============================================================
-- Stored kickoff_at (20:00 UTC) was off by one hour. Cross-checked
-- against a news report (2:00 PM PDT / 21:00 UTC, Hard Rock Stadium,
-- Miami) and the live API-Football fixture (id 1591865), which agree
-- on 21:00 UTC. Correcting so Israel-time display becomes 00:00
-- (start of the next calendar day) instead of 23:00.

update public.matches
set kickoff_at = '2026-07-18T21:00:00+00:00'
where api_fixture_id = 1591865
  and stage = '3rd';
