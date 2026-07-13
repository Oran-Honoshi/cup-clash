-- ============================================================
-- Migration 049 — Daily Challenges framework ("Guess the Footballer")
-- ============================================================
-- Additive only, per the established schema-catch-up convention: no
-- changes to the meaning of any existing table. The game itself is
-- fully public/anonymous-playable (see daily_challenge_attempts below);
-- Group Streaks/Titles/chat nudges are an optional layer computed live
-- on top of this data, never a gate on play.

-- One row per calendar day, shared globally — the same puzzle for everyone.
create table if not exists public.daily_challenges (
  id               uuid primary key default gen_random_uuid(),
  challenge_date   date not null,
  game_type        text not null default 'guess_footballer',
  answer_player_id uuid not null references public.players(id) on delete restrict,
  clue_order       jsonb not null default '["nationality","club","position","age","silhouette"]'::jsonb,
  created_at       timestamptz not null default now()
);

create unique index if not exists daily_challenges_date_key
  on public.daily_challenges (challenge_date);

comment on column public.daily_challenges.clue_order is
  'Ordered array of clue field names revealed one-per-wrong-guess, e.g. ["nationality","club","position","age","silhouette"]. Lets the reveal order change per game_type without a code deploy.';

alter table public.daily_challenges enable row level security;

create policy "Anyone can read daily challenges"
  on public.daily_challenges for select
  using (true);

create policy "Service role manages daily challenges"
  on public.daily_challenges for insert
  with check (false);

-- Authenticated attempts only — anonymous play never writes here (it's
-- held entirely in client-side session/localStorage until the player
-- signs in; see lib/auth-wall.ts + ConsumeDailyChallengeParam for the
-- post-signup save-in-progress-attempt flow).
create table if not exists public.daily_challenge_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  uuid not null references public.daily_challenges(id) on delete cascade,
  guesses       jsonb not null default '[]'::jsonb,
  guess_count   integer not null default 0,
  solved        boolean not null default false,
  completed_at  timestamptz,
  share_text    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists daily_challenge_attempts_user_challenge_key
  on public.daily_challenge_attempts (user_id, challenge_id);

comment on column public.daily_challenge_attempts.guesses is
  'Ordered jsonb array of {player_id, correct} guess records — the full guess history for this attempt, used to render the shared emoji grid.';

alter table public.daily_challenge_attempts enable row level security;

create policy "Users manage their own daily challenge attempts"
  on public.daily_challenge_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Group and global leaderboards need to read every attempt to rank
-- players against each other, not just their own row.
create policy "Authenticated users can read all attempts for leaderboards"
  on public.daily_challenge_attempts for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Wikidata/Wikimedia enrichment cache — decoupled from `players` since
-- that table is overwritten wholesale by the API-Football sync job;
-- keeping fetched enrichment data here means a re-sync can never clobber
-- it, and it's fine for rows to exist only for players who've ever been
-- a daily-challenge answer.
-- ============================================================
create table if not exists public.player_wikidata_cache (
  player_id         uuid primary key references public.players(id) on delete cascade,
  wikidata_qid      text,
  date_of_birth     date,
  photo_url         text,
  photo_attribution jsonb,
  facts             jsonb not null default '[]'::jsonb,
  fetched_at        timestamptz not null default now()
);

comment on column public.player_wikidata_cache.photo_attribution is
  'Per-image Commons license metadata: {licenseShortName, licenseUrl, artist, attributionRequired}. Rendered verbatim next to the reveal photo — never assume a blanket license across images.';

comment on column public.player_wikidata_cache.facts is
  'Array of short factual strings derived from Wikidata statements (our own phrasing, never copied Wikipedia prose), shown on the post-solve reveal screen.';

alter table public.player_wikidata_cache enable row level security;

create policy "Anyone can read cached player enrichment"
  on public.player_wikidata_cache for select
  using (true);

create policy "Service role manages player enrichment cache"
  on public.player_wikidata_cache for insert
  with check (false);

-- ============================================================
-- Group Chat: allow an automated system message (e.g. "Dave solved
-- today's puzzle in 2 guesses. Can you beat them?") alongside real user
-- messages. Service-role inserts already bypass RLS entirely, so no new
-- INSERT policy is needed here — the only schema change is making
-- user_id nullable so a system message has no author.
-- ============================================================
alter table public.chat_messages
  alter column user_id drop not null;

comment on column public.chat_messages.type is
  'One of "text" | "gif" | "system". A "system" message has user_id = null and is rendered without an avatar/author, e.g. daily-challenge completion nudges.';
