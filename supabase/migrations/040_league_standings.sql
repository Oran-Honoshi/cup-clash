-- ============================================================
-- Migration 040 — Multi-league fixtures/standings: Phase 2 data model
-- Purely additive. No existing table altered destructively, no existing
-- column renamed/removed, no World Cup stage-based logic touched.
-- ============================================================

-- ============================================================
-- ROUND LABEL — free-text round/matchday display for non-World-Cup
-- matches (e.g. "Matchday 15", "Group Stage – MD3", "Round of 16").
-- WC bracket/scoring/tab code reads only `stage`, never this column.
-- ============================================================
alter table public.matches
  add column if not exists round_label text;

-- ============================================================
-- TEAMS — track the API-Football team id so club teams can be
-- resolved/upserted idempotently across fetcher runs without relying
-- on fragile name matching (World Cup national teams are unaffected —
-- this column stays null for the 48 rows seeded in migration 037).
-- ============================================================
alter table public.teams
  add column if not exists api_team_id integer;

create unique index if not exists idx_teams_api_team_id
  on public.teams (api_team_id)
  where api_team_id is not null;

-- ============================================================
-- STANDINGS — snapshots fetched directly from API-Football's standings
-- endpoint (not recomputed from match results), so domestic tie-break
-- rules stay correct without reimplementing them here. group_label
-- distinguishes UCL group-stage tables ("Group A", ...); null for a
-- normal single-table domestic league.
-- ============================================================
create table if not exists public.standings (
  id                uuid default gen_random_uuid() primary key,
  competition_id    uuid references public.competitions(id) on delete cascade not null,
  season_id         uuid references public.seasons(id) on delete cascade not null,
  team_id           uuid references public.teams(id) not null,
  group_label       text,
  position          int not null,
  played            int not null default 0,
  won               int not null default 0,
  drawn             int not null default 0,
  lost              int not null default 0,
  goals_for         int not null default 0,
  goals_against     int not null default 0,
  goal_difference   int not null default 0,
  points            int not null default 0,
  form              text,
  updated_at        timestamptz not null default now(),
  unique (competition_id, season_id, team_id, group_label)
);

alter table public.standings enable row level security;

create policy "Standings are publicly readable"
  on public.standings for select using (true);
