-- ============================================================
-- Migration 055 — Game Room Phase 3: "Guess the Score" + 1v1 Daily Duels
-- ============================================================
-- Additive only. Two independent features sharing this migration since
-- both ship as part of the same Game Room build.

-- ── Guess the Score ──────────────────────────────────────────────────────
-- Unlike daily_challenges, the puzzle content itself is a small curated,
-- code-defined list (lib/data/historic-scores.ts) picked deterministically
-- by day-of-year — no admin authoring flow needed, and it never changes
-- meaning, so there's no need for a `score_challenges` puzzle-content
-- table. Only the per-user attempt needs to persist, keyed by the plain
-- calendar date rather than a challenge_id FK.
create table if not exists public.score_challenge_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_date date not null,
  guesses       jsonb not null default '[]'::jsonb,
  guess_count   integer not null default 0,
  solved        boolean not null default false,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists score_challenge_attempts_user_date_key
  on public.score_challenge_attempts (user_id, challenge_date);

comment on column public.score_challenge_attempts.guesses is
  'Ordered jsonb array of {home, away, home_feedback, away_feedback} guess records for that day''s historic-score puzzle.';

alter table public.score_challenge_attempts enable row level security;

create policy "Users manage their own score challenge attempts"
  on public.score_challenge_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 1v1 Daily Duels ──────────────────────────────────────────────────────
-- A same-day, single-puzzle head-to-head challenge on that day's Daily
-- Challenge (guess_footballer/guess_club) — distinct from Rival Tracker's
-- persistent season-long tracking (migration 053). No stat columns here by
-- design: the result is computed on read by joining both participants'
-- existing daily_challenge_attempts rows for that date, so there's nothing
-- to keep in sync and no trigger/cron needed.
create table if not exists public.daily_duels (
  id             uuid primary key default gen_random_uuid(),
  challenger_id  uuid not null references public.profiles(id) on delete cascade,
  opponent_id    uuid not null references public.profiles(id) on delete cascade,
  challenge_date date not null,
  status         text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at     timestamptz not null default now(),
  responded_at   timestamptz,
  constraint daily_duels_distinct_users check (challenger_id <> opponent_id)
);

-- One duel per unordered pair per day, regardless of who challenges whom.
create unique index if not exists daily_duels_pair_date_key
  on public.daily_duels (challenge_date, least(challenger_id, opponent_id), greatest(challenger_id, opponent_id));

create index if not exists daily_duels_opponent_idx on public.daily_duels (opponent_id, challenge_date);
create index if not exists daily_duels_challenger_idx on public.daily_duels (challenger_id, challenge_date);

alter table public.daily_duels enable row level security;

create policy "Participants can read their duels"
  on public.daily_duels for select
  using (auth.uid() = challenger_id or auth.uid() = opponent_id);

create policy "Service role manages duels"
  on public.daily_duels for insert
  with check (false);

create policy "Service role updates duels"
  on public.daily_duels for update
  using (false) with check (false);
