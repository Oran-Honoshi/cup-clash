-- ============================================================
-- FANTASY GAMEWEEK SCORES
-- ============================================================
-- One row per (fantasy_squad_id, gameweek_id) — the resolved point total
-- for that squad's XI that gameweek. Mirrors oracle_duels' idempotency
-- pattern (lib/services/oracle-duels.ts resolveOracleDuels): "already
-- scored" is queried directly off this table, and the scoring cron
-- (lib/services/fantasy-scoring.ts) always UPSERTS a full recompute
-- rather than gating on a status-transition flag — the same one-shot
-- design already logged as a bug against tournament winner/scorer
-- scoring (see feedback_oneshot_match_scoring_gap). A safe recompute
-- means a later stat correction from API-Football is recoverable on the
-- next cron tick instead of being permanently missed.

create table public.fantasy_gameweek_scores (
  id                uuid primary key default gen_random_uuid(),
  fantasy_squad_id  uuid not null references public.fantasy_squads(id) on delete cascade,
  gameweek_id       uuid not null references public.gameweeks(id) on delete cascade,
  points            int not null default 0,
  scored_at         timestamptz not null default now(),
  unique (fantasy_squad_id, gameweek_id)
);

create index fantasy_gameweek_scores_fantasy_squad_id_idx on public.fantasy_gameweek_scores (fantasy_squad_id);
create index fantasy_gameweek_scores_gameweek_id_idx on public.fantasy_gameweek_scores (gameweek_id);

alter table public.fantasy_gameweek_scores enable row level security;

-- Public read for league members (same convention as fantasy_squads),
-- writes via service role only (cron uses sbAdmin()) — no insert/update
-- policy needed, same as oracle_predictions.
create policy "League members can view fantasy gameweek scores"
  on public.fantasy_gameweek_scores for select
  using (
    exists (
      select 1 from public.fantasy_squads fs
      where fs.id = fantasy_squad_id
        and public.is_fantasy_league_member(fs.fantasy_league_id, auth.uid())
    )
  );
