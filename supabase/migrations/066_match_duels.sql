-- ============================================================
-- Migration 066 — Match Duel (share-sheet invites)
-- ============================================================
-- Extends the "1v1 Duel" concept (daily_duels, migration 055) to a specific
-- upcoming match's score prediction, reachable two ways:
--   1. In-app member-picker (opponent_id known at creation — mirrors
--      daily_duels' createDuel/respondToDuel flow exactly, just scoped to a
--      match_id instead of "today").
--   2. A shareable invite link/token (opponent_id null until claimed) — for
--      reaching people outside the app via the native share sheet. Public
--      landing page reads a pending row by invite_token via service role
--      before anyone is identified, same convention as /join/[code].
--
-- Deliberately NOT reusing daily_duels itself: two duelling friends may not
-- share a group, so there's no single group_predictions row to compare
-- between them the way daily_duels joins daily_challenge_attempts. Scores
-- are self-contained on the row instead (oracle_duels' convention), graded
-- with calcLivePoints' fixed default rules (25 exact / 10 outcome) against
-- the 90-minute score, locking 5 minutes before kickoff (lib/isMatchLocked).
create table if not exists public.match_duels (
  id                     uuid primary key default gen_random_uuid(),
  challenger_id          uuid not null references public.profiles(id) on delete cascade,
  opponent_id            uuid references public.profiles(id) on delete cascade,
  match_id               text not null references public.matches(id) on delete cascade,
  status                 text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  invite_token           text unique,
  challenger_home_score  int check (challenger_home_score >= 0),
  challenger_away_score  int check (challenger_away_score >= 0),
  opponent_home_score    int check (opponent_home_score >= 0),
  opponent_away_score    int check (opponent_away_score >= 0),
  points_challenger      int,
  points_opponent        int,
  locked_at              timestamptz,
  created_at             timestamptz not null default now(),
  responded_at           timestamptz,
  resolved_at            timestamptz,
  constraint match_duels_distinct_users check (opponent_id is null or challenger_id <> opponent_id)
);

comment on column public.match_duels.invite_token is
  'Set only for share-link invites (opponent_id null at creation). Claimed once by whoever accepts, then left in place as a historical record.';
comment on column public.match_duels.locked_at is
  'Prediction-lock deadline for this match (kickoff minus 5 minutes), stamped when a side first submits a score — null until then, same convention as oracle_duels.';

-- One duel per unordered pair per match — only enforced once both sides are
-- known (member-picker path); share-link invites (opponent_id null) are
-- exempt since a challenger may hand the same link to several people.
create unique index if not exists match_duels_pair_match_key
  on public.match_duels (match_id, least(challenger_id, opponent_id), greatest(challenger_id, opponent_id))
  where opponent_id is not null;

create index if not exists match_duels_match_idx on public.match_duels (match_id);
create index if not exists match_duels_invite_token_idx on public.match_duels (invite_token) where invite_token is not null;

alter table public.match_duels enable row level security;

create policy "Users can read their own match duels"
  on public.match_duels for select
  using (auth.uid() = challenger_id or auth.uid() = opponent_id);

-- All writes (including claiming an invite by token, which happens before
-- the reader is a participant) go through the API routes via service role —
-- same convention as daily_duels/oracle_duels, since the invite-claim step
-- in particular can't be expressed as a client-safe RLS check.
create policy "Service role manages match duels"
  on public.match_duels for insert
  with check (false);

create policy "Service role updates match duels"
  on public.match_duels for update
  using (false) with check (false);
