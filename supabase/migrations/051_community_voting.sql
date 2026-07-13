-- ============================================================
-- Migration 051 — Community Voting (Matchday MVP)
-- ============================================================
-- One MVP poll per finished match (vote_type='matchday_mvp', scope=matches.id).
-- `scope` is a free-text identifier rather than a hard FK to `matches` since
-- other vote_types ('monthly'/'season', not built yet) will scope to a
-- period string instead of a match id — matches this table's job of hosting
-- more than one kind of community vote over time.

create table if not exists public.community_votes (
  id         uuid primary key default gen_random_uuid(),
  vote_type  text not null default 'matchday_mvp' check (vote_type in ('matchday_mvp', 'monthly', 'season')),
  scope      text not null,
  created_at timestamptz not null default now(),
  closes_at  timestamptz not null
);

create unique index if not exists community_votes_type_scope_key
  on public.community_votes (vote_type, scope);

comment on column public.community_votes.scope is
  'match id for vote_type=matchday_mvp; a period identifier (e.g. "2026-08") for monthly/season votes.';

alter table public.community_votes enable row level security;

create policy "Anyone can read community votes"
  on public.community_votes for select
  using (true);

create policy "Service role manages community votes"
  on public.community_votes for insert
  with check (false);

-- Candidate players, snapshotted once at vote-creation time (not a live
-- re-derived list) so the poll's option set can't shift under voters.
create table if not exists public.community_vote_options (
  id        uuid primary key default gen_random_uuid(),
  vote_id   uuid not null references public.community_votes(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade
);

create unique index if not exists community_vote_options_vote_player_key
  on public.community_vote_options (vote_id, player_id);

alter table public.community_vote_options enable row level security;

create policy "Anyone can read community vote options"
  on public.community_vote_options for select
  using (true);

create policy "Service role manages community vote options"
  on public.community_vote_options for insert
  with check (false);

create table if not exists public.community_vote_casts (
  id        uuid primary key default gen_random_uuid(),
  vote_id   uuid not null references public.community_votes(id) on delete cascade,
  option_id uuid not null references public.community_vote_options(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  cast_at   timestamptz not null default now()
);

-- One vote per user per poll — the actual enforcement mechanism the spec
-- asked for.
create unique index if not exists community_vote_casts_vote_user_key
  on public.community_vote_casts (vote_id, user_id);

alter table public.community_vote_casts enable row level security;

create policy "Users cast their own vote"
  on public.community_vote_casts for insert
  with check (auth.uid() = user_id);

-- Same "any authenticated user can read all rows for aggregation" convention
-- as daily_challenge_attempts (see migration 049) — needed to compute/display
-- live percentage results.
create policy "Authenticated users can read all vote casts"
  on public.community_vote_casts for select
  using (auth.role() = 'authenticated');
