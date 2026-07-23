-- ============================================================
-- Migration 071 — International friendlies coverage.
--
-- Data-ingestion only, following the same pattern as migration 065/068/070
-- — no schema change beyond widening the `competitions.type` check
-- constraint, since friendlies fit none of the existing three values:
-- not a 'league' (no table), not a 'cup' (no bracket), not a 'tournament'
-- (open-ended, no fixed field/knockout structure). A dedicated 'friendly'
-- type also keeps this row OUT of getContinentalInvolvement()'s
-- `type = 'cup' and country is null` query (lib/services/matches.ts) —
-- that query powers the Continental Watch card for followed CLUB teams in
-- continental cups (UCL/UEL/UECL/Libertadores/Sudamericana); a national-team
-- friendlies row with country=null would otherwise be swept into it.
--
-- Single competition row covers all countries — see TRACKED_FRIENDLY_TEAMS
-- in lib/services/league-football.ts for the per-team allowlist, since
-- friendlies have no per-competition fixture list on API-Football (only
-- fetchable one national team at a time: team={id}&league=10&season=Y).
-- ============================================================

alter table public.competitions drop constraint if exists competitions_type_check;
alter table public.competitions add constraint competitions_type_check
  check (type in ('league', 'cup', 'tournament', 'friendly'));

insert into public.competitions (name, type, country)
select 'International Friendlies', 'friendly', null
where not exists (
  select 1 from public.competitions where name = 'International Friendlies'
);
