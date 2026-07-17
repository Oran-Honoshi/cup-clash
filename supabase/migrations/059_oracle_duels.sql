-- ============================================================
-- Migration 059 — Oracle Duel
-- ============================================================
-- A separate, independent head-to-head mechanic against the Oracle. Unlike
-- the "Beat the Oracle" Game Room section (oracle_predictions vs a user's
-- own group_predictions, computed on read), this is its own prediction
-- input — a user duels the Oracle whether or not they're in any group, and
-- it never reads/writes group_predictions.
--
-- Fixed scoring for ALL duels regardless of any group's scoring_rules
-- (10 correct outcome / 25 exact score — see lib/services/predictions.ts's
-- calcLivePoints default rules), graded against the 90-minute result only,
-- never extra time. Locks 5 minutes before kickoff, same convention as
-- everywhere else (lib/isMatchLocked.ts).
--
-- oracle_home_score/oracle_away_score are copied from oracle_predictions at
-- duel-creation time rather than joined live — oracle_predictions is itself
-- "generate once, never regenerate" (migration 057), so a live join would
-- always resolve to the same value anyway, and copying keeps duel rows a
-- self-contained historical record and avoids a join for every read.
create table if not exists public.oracle_duels (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  match_id           text not null references public.matches(id) on delete cascade,
  user_home_score    int not null check (user_home_score >= 0),
  user_away_score    int not null check (user_away_score >= 0),
  oracle_home_score  int not null,
  oracle_away_score  int not null,
  points_user        int,
  points_oracle      int,
  locked_at          timestamptz not null,
  created_at         timestamptz not null default now(),
  resolved_at        timestamptz
);

comment on column public.oracle_duels.locked_at is
  'Prediction-lock deadline for this match (kickoff minus 5 minutes), stamped at duel creation/update — not a "when it got locked" audit timestamp.';
comment on column public.oracle_duels.points_user is
  'Null until resolved_at is set (match not yet finished). Graded via calcLivePoints default rules against the 90-minute score only.';

-- One duel per user per match — re-predicting before lock upserts in place.
create unique index if not exists oracle_duels_user_match_key
  on public.oracle_duels (user_id, match_id);

create index if not exists oracle_duels_match_idx on public.oracle_duels (match_id);

alter table public.oracle_duels enable row level security;

create policy "Users can read their own oracle duels"
  on public.oracle_duels for select
  using (auth.uid() = user_id);

-- Written only via the API route (service role), after it validates the
-- lock deadline server-side and copies the Oracle's real prediction — same
-- convention as daily_duels (migration 055) and oracle_predictions
-- (migration 057). A pure client-side RLS check couldn't safely enforce
-- either of those.
create policy "Service role manages oracle duels"
  on public.oracle_duels for insert
  with check (false);

create policy "Service role updates oracle duels"
  on public.oracle_duels for update
  using (false) with check (false);
