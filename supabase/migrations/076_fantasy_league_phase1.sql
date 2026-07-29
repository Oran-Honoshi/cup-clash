-- ============================================================
-- Migration 076 — Fantasy League Phase 1: foundational data model
-- ============================================================
-- Schema only — no application code in this migration. Confirmed
-- architecture (see conversation): Fantasy Leagues are a brand-new,
-- structurally separate feature, NOT rows in the existing `groups`
-- table. This deliberately avoids two known risks: (1) repeating the
-- group_mode/rules_mode naming-collision mistake by overloading
-- `groups` with a third, unrelated "mode" concept, and (2) adding a
-- 15th sub-sector to group-detail-client.tsx, already the app's
-- largest/most complex screen.
--
-- v1 ruleset is fixed app-wide, not per-league configurable (mirrors
-- Oracle Duel's fixed scoring in lib/services/oracle-duels.ts, which
-- deliberately ignores any group's scoring_rules) — so none of the
-- rule constants below (100-credit budget, 1 free transfer/week to
-- max 2, formation bounds) live as columns on fantasy_leagues itself.
--
-- Sections:
--   1. fantasy_leagues + membership + public discovery
--   2. gameweeks (own table — matches.round_label alone isn't a safe
--      deadline source, see comment at the matches.gameweek_id column)
--   3. fantasy_players (own table — NOT the existing `players` table,
--      which is a World Cup national-squad pool for Guess the
--      Footballer; extending it would pollute that game's answer
--      pool and the WC scorer-lookup paths in app/api/scores)
--   4. fantasy_squads + fantasy_squad_players (roster, with a
--      deferred constraint trigger enforcing the v1 formation bounds)
--   5. fantasy_gameweek_picks (per-gameweek captain + Oracle Captain
--      activation — redesigned per this conversation to be a
--      per-gameweek record, not a season-long used-once flag)
--   6. Group Chat extension — nullable fantasy_league_id on
--      chat_messages/message_reactions, additive alongside group_id
--   7. Follow-up note (not fixed here): groups.passkey generation bug
-- ============================================================


-- ============================================================
-- 1. FANTASY LEAGUES
-- ============================================================

create table public.fantasy_leagues (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  admin_id       uuid not null references public.profiles(id) on delete cascade,
  -- Scopes the whole league to ONE real competition (v1 UI will only
  -- offer Premier League, since it's the only one with the per-
  -- gameweek player-stat pipeline this feature needs — see fantasy_players
  -- below — but the column itself doesn't hardcode that, so a second
  -- competition is an additive UI change later, not a schema change).
  competition_id uuid not null references public.competitions(id),
  is_public      boolean not null default false,
  -- Generated APP-SIDE using the existing generate -> check -> retry
  -- loop already implemented for groups in
  -- app/api/admin/regenerate-code/route.ts (generate a candidate,
  -- SELECT for a collision, retry up to 5x, then insert). Deliberately
  -- NOT a DB trigger default — see section 7: groups.passkey is
  -- exactly that (an untracked live-only trigger with no unique
  -- constraint and no collision check), and this table exists in part
  -- to not repeat it. No default here is intentional: insert fails
  -- loudly if the app forgets to set it, rather than silently falling
  -- back to an unguarded generator.
  passkey        text not null,
  max_members    int not null default 100,
  created_at     timestamptz not null default now()
);

create unique index fantasy_leagues_passkey_key on public.fantasy_leagues (passkey);
create index fantasy_leagues_competition_id_idx on public.fantasy_leagues (competition_id);

comment on column public.fantasy_leagues.is_public is
  'Whether the league is discoverable via list_public_fantasy_leagues() before joining. Mirrors groups.is_public (migration 044) — does not grant non-members full-row SELECT.';

alter table public.fantasy_leagues enable row level security;


-- ============================================================
-- FANTASY LEAGUE MEMBERS
-- ============================================================
-- Created here, before the SECURITY DEFINER helper and RLS policies
-- below that reference it (Postgres doesn't strictly require this
-- ordering — function/policy bodies aren't validated against the
-- catalog until first executed — but keeping real dependency order
-- avoids relying on that).

create table public.fantasy_league_members (
  id                uuid primary key default gen_random_uuid(),
  fantasy_league_id uuid not null references public.fantasy_leagues(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  -- Mirrors group_members.role — admin_id on fantasy_leagues is the
  -- single owner of record, this allows for co-admins later without a
  -- schema change, same rationale as groups.
  role              text not null default 'member' check (role in ('admin', 'member')),
  joined_at         timestamptz not null default now(),
  unique (fantasy_league_id, user_id)
);

create index fantasy_league_members_fantasy_league_id_idx on public.fantasy_league_members (fantasy_league_id);
create index fantasy_league_members_user_id_idx on public.fantasy_league_members (user_id);

alter table public.fantasy_league_members enable row level security;

-- SECURITY DEFINER helper so the fantasy_leagues (and every other
-- fantasy-* table below) SELECT policy can check fantasy_league_members
-- without the same groups<->group_members RLS recursion migration 044
-- had to work around for groups.
create or replace function public.is_fantasy_league_member(p_fantasy_league_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.fantasy_league_members
    where fantasy_league_id = p_fantasy_league_id and user_id = p_user_id
  );
$$;

revoke all on function public.is_fantasy_league_member(uuid, uuid) from public;
revoke all on function public.is_fantasy_league_member(uuid, uuid) from anon;
grant execute on function public.is_fantasy_league_member(uuid, uuid) to authenticated;

create policy "Members and admins can view fantasy league"
  on public.fantasy_leagues for select
  using (
    admin_id = auth.uid()
    or public.is_fantasy_league_member(id, auth.uid())
  );

create policy "Authenticated users can create fantasy leagues"
  on public.fantasy_leagues for insert
  with check (auth.uid() = admin_id);

create policy "Admins can update own fantasy league"
  on public.fantasy_leagues for update
  using (admin_id = auth.uid());

create policy "Admins can delete own fantasy league"
  on public.fantasy_leagues for delete
  using (admin_id = auth.uid());

-- Mirrors list_public_groups() (migrations 044/045): safe column
-- subset only, no passkey, SECURITY DEFINER, authenticated-only.
create or replace function public.list_public_fantasy_leagues(
  p_search text default null
)
returns table (
  id             uuid,
  name           text,
  competition_id uuid,
  max_members    int,
  member_count   bigint,
  created_at     timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    fl.id,
    fl.name,
    fl.competition_id,
    fl.max_members,
    (select count(*) from public.fantasy_league_members flm where flm.fantasy_league_id = fl.id) as member_count,
    fl.created_at
  from public.fantasy_leagues fl
  where fl.is_public = true
    and (p_search is null or fl.name ilike '%' || p_search || '%')
  order by fl.created_at desc
  limit 50;
$$;

revoke all on function public.list_public_fantasy_leagues(text) from public;
revoke all on function public.list_public_fantasy_leagues(text) from anon;
grant execute on function public.list_public_fantasy_leagues(text) to authenticated;


-- ============================================================
-- FANTASY LEAGUE MEMBERS — RLS policies
-- (table itself created above, before the is_fantasy_league_member helper)
-- ============================================================

create policy "Members can view fantasy league members"
  on public.fantasy_league_members for select
  using (public.is_fantasy_league_member(fantasy_league_id, auth.uid()));

create policy "Users can join fantasy leagues"
  on public.fantasy_league_members for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage fantasy league members"
  on public.fantasy_league_members for update
  using (
    exists (
      select 1 from public.fantasy_leagues
      where id = fantasy_league_id and admin_id = auth.uid()
    )
  );


-- ============================================================
-- 2. GAMEWEEKS
-- ============================================================
-- A real table, not a live derivation off matches.round_label.
-- Investigation finding: round_label ("Matchday N") is populated for
-- Premier League matches but (a) is free text needing regex-parsing
-- to sort, and (b) a live "deadline = earliest kickoff sharing this
-- label" query would silently shift if any one fixture in that
-- gameweek gets postponed/rescheduled — a common real Premier League
-- occurrence. deadline_at here is a frozen snapshot, set once when the
-- gameweek row is created (from that gameweek's earliest known kickoff
-- at creation time), immune to later single-match reschedules.

create table public.gameweeks (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id),
  number         int not null,
  deadline_at    timestamptz not null,
  start_at       timestamptz not null,
  end_at         timestamptz,
  created_at     timestamptz not null default now(),
  unique (competition_id, number)
);

create index gameweeks_competition_id_idx on public.gameweeks (competition_id);

comment on column public.gameweeks.deadline_at is
  'Frozen at creation from the earliest known kickoff in this gameweek. Deliberately NOT recomputed from matches.kickoff_at later — a single postponed fixture must not retroactively move the transfer deadline for the rest of the gameweek.';

alter table public.gameweeks enable row level security;

-- Public reference data — same convention as teams/competitions
-- (migration 037): readable by everyone, writes via service role only.
create policy "Gameweeks are publicly readable"
  on public.gameweeks for select using (true);

-- Snapshotted at cron-ingest time, same reasoning as gameweeks.deadline_at
-- above — a match keeps a stable gameweek link regardless of what
-- happens to its own kickoff_at afterward.
alter table public.matches
  add column if not exists gameweek_id uuid references public.gameweeks(id);

create index if not exists matches_gameweek_id_idx on public.matches (gameweek_id) where gameweek_id is not null;


-- ============================================================
-- 3. FANTASY PLAYERS
-- ============================================================
-- Deliberately a new table, not an extension of the existing
-- `players` table (World Cup national-squad pool for Guess the
-- Footballer — country/club/position there mean something different,
-- and it's queried unscoped by lib/services/daily-challenge.ts and the
-- WC scorer-lookup paths in app/api/scores/route.ts; adding ~500 EPL
-- club players into it would pollute both).

create table public.fantasy_players (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id),
  -- API-Football's own player/team ids — the join key against
  -- /fixtures/players responses when the scoring cron is built.
  api_player_id  integer not null,
  api_team_id    integer not null,
  full_name      text not null,
  team_name      text not null,
  position       text not null check (position in ('GK', 'DEF', 'MID', 'FWD')),
  photo          text,
  -- v1 pricing is a static seed, NOT a dynamic market: tier by
  -- position + prior-season minutes/goals at ingest time, then held
  -- fixed for the season (confirmed decision — refinable later, not
  -- v1 scope). Populated by a future seeding script, not this
  -- migration — no rows are inserted here.
  credit_cost    numeric not null,
  created_at     timestamptz not null default now(),
  unique (competition_id, api_player_id)
);

create index fantasy_players_competition_id_idx on public.fantasy_players (competition_id);
create index fantasy_players_api_team_id_idx on public.fantasy_players (api_team_id);

alter table public.fantasy_players enable row level security;

create policy "Fantasy players are publicly readable"
  on public.fantasy_players for select using (true);


-- ============================================================
-- 4. FANTASY SQUADS + SQUAD PLAYERS
-- ============================================================

create table public.fantasy_squads (
  id                    uuid primary key default gen_random_uuid(),
  fantasy_league_id     uuid not null references public.fantasy_leagues(id) on delete cascade,
  user_id               uuid not null references public.profiles(id) on delete cascade,
  -- v1 budget is a fixed 100 credits (confirmed ruleset) — stored per
  -- squad rather than hardcoded so a spent/remaining balance can be
  -- tracked as transfers happen.
  budget_remaining      numeric not null default 100.0,
  -- Rolling weekly allowance: 1 free transfer/week, unused ones bank
  -- up to a max of 2 (confirmed ruleset). The rollover itself is a
  -- weekly cron concern (app code, not this migration) — this column
  -- just holds the current balance.
  free_transfers_banked int not null default 1,
  created_at            timestamptz not null default now(),
  unique (fantasy_league_id, user_id)
);

create index fantasy_squads_fantasy_league_id_idx on public.fantasy_squads (fantasy_league_id);

alter table public.fantasy_squads enable row level security;

-- Mirrors group_predictions (migration 004): any league member can
-- view every squad in their league (no "hide until deadline" at the
-- RLS layer — same convention group_predictions already uses), only
-- the owner can write their own.
create policy "League members can view fantasy squads"
  on public.fantasy_squads for select
  using (public.is_fantasy_league_member(fantasy_league_id, auth.uid()));

create policy "Users can create own fantasy squad"
  on public.fantasy_squads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own fantasy squad"
  on public.fantasy_squads for update
  using (auth.uid() = user_id);


create table public.fantasy_squad_players (
  id                uuid primary key default gen_random_uuid(),
  fantasy_squad_id  uuid not null references public.fantasy_squads(id) on delete cascade,
  fantasy_player_id uuid not null references public.fantasy_players(id),
  added_at          timestamptz not null default now(),
  -- null = currently on the squad. Set (not deleted) on transfer-out,
  -- so past-gameweek scoring stays correct after a later transfer —
  -- same "keep history, don't delete" reasoning as
  -- fantasy_gameweek_picks below and group_predictions' locked_at.
  removed_at        timestamptz
);

create index fantasy_squad_players_fantasy_squad_id_idx on public.fantasy_squad_players (fantasy_squad_id);
create unique index fantasy_squad_players_active_unique
  on public.fantasy_squad_players (fantasy_squad_id, fantasy_player_id)
  where removed_at is null;

alter table public.fantasy_squad_players enable row level security;

create policy "League members can view fantasy squad players"
  on public.fantasy_squad_players for select
  using (
    exists (
      select 1 from public.fantasy_squads fs
      where fs.id = fantasy_squad_id
        and public.is_fantasy_league_member(fs.fantasy_league_id, auth.uid())
    )
  );

create policy "Users can manage own fantasy squad players"
  on public.fantasy_squad_players for insert
  with check (
    exists (select 1 from public.fantasy_squads fs where fs.id = fantasy_squad_id and fs.user_id = auth.uid())
  );

create policy "Users can update own fantasy squad players"
  on public.fantasy_squad_players for update
  using (
    exists (select 1 from public.fantasy_squads fs where fs.id = fantasy_squad_id and fs.user_id = auth.uid())
  );

-- ── v1 formation bounds (stated default, confirmed as "reasonable
-- bands allowing common formations" rather than one exact number) ──
-- Exactly 1 GK. Outfield 10 split across DEF 3-5 / MID 2-5 / FWD 1-3,
-- summing to 10 — covers every standard real-football shape (3-4-3,
-- 3-5-2, 4-4-2, 4-3-3, 4-5-1, 5-3-2, 5-4-1, etc). No bench in v1
-- (confirmed ruleset), so this is also the full matchday-scoring set,
-- not just a squad pool to pick a starting XI from.
--
-- Enforced as a DEFERRED constraint trigger (checked at COMMIT, not
-- per-statement) rather than a plain CHECK, because CHECK constraints
-- can't aggregate across sibling rows, and a real transfer is two
-- statements (remove one player, add another) that must be allowed to
-- transiently violate the count mid-transaction.
create or replace function public.check_fantasy_squad_composition()
returns trigger
language plpgsql
as $$
declare
  v_squad_id uuid;
  v_gk int; v_def int; v_mid int; v_fwd int; v_total int;
begin
  v_squad_id := coalesce(new.fantasy_squad_id, old.fantasy_squad_id);

  select
    count(*) filter (where fp.position = 'GK'),
    count(*) filter (where fp.position = 'DEF'),
    count(*) filter (where fp.position = 'MID'),
    count(*) filter (where fp.position = 'FWD'),
    count(*)
  into v_gk, v_def, v_mid, v_fwd, v_total
  from public.fantasy_squad_players sp
  join public.fantasy_players fp on fp.id = sp.fantasy_player_id
  where sp.fantasy_squad_id = v_squad_id
    and sp.removed_at is null;

  -- Hard ceilings apply always, even mid-build (a squad may be under
  -- 11 players while the user is still assembling it, but must never
  -- exceed a position's max).
  if v_gk > 1 or v_def > 5 or v_mid > 5 or v_fwd > 3 or v_total > 11 then
    raise exception 'fantasy squad composition exceeds v1 formation limits (GK<=1, DEF<=5, MID<=5, FWD<=3, total<=11)';
  end if;

  -- Full validity only required once the squad is complete (11/11) —
  -- a partially-built squad under 11 is allowed to be an incomplete
  -- formation while the user is still picking.
  if v_total = 11 and (
    v_gk <> 1 or v_def < 3 or v_def > 5 or v_mid < 2 or v_mid > 5 or v_fwd < 1 or v_fwd > 3
  ) then
    raise exception 'a complete fantasy squad (11 players) must be 1 GK + 3-5 DEF + 2-5 MID + 1-3 FWD';
  end if;

  return null;
end;
$$;

create constraint trigger fantasy_squad_composition_check
  after insert or update or delete on public.fantasy_squad_players
  deferrable initially deferred
  for each row execute function public.check_fantasy_squad_composition();


-- ============================================================
-- 5. FANTASY GAMEWEEK PICKS — captain + Oracle Captain
-- ============================================================
-- Redesigned per this conversation: Oracle Captain is a PER-GAMEWEEK
-- optional activation, not a season-long single-use flag (the earlier
-- fantasy_squads.oracle_captain_used proposal is dropped entirely).
-- One row per (squad, gameweek): which of the squad's current 11 is
-- captain that week, and whether Oracle Captain was activated on them.
--
-- Oracle Captain rule (confirmed): if activated and the Oracle's own
-- predicted winner for the captain's real match that gameweek matches
-- the actual result, the captain's score triples instead of doubles;
-- if the Oracle was wrong, the normal double still applies. The
-- multiplier itself is NOT stored here — like oracle_duels
-- (resolveOracleDuels() in lib/services/oracle-duels.ts), this row
-- only records the pick; a future scoring pass resolves the actual
-- multiplier once the match (and the Oracle's accuracy on it) is
-- known, mirroring that same lazy-grade-after-finish pattern.
--
-- captain_fantasy_player_id intentionally references fantasy_players
-- directly (not a specific fantasy_squad_players row) — same
-- simplicity precedent as oracle_duels referencing match_id directly.
-- The invariant "captain must be currently on this squad" is an
-- app-layer check at pick time, not a DB constraint (consistent with
-- how this codebase generally leaves cross-table pick invariants to
-- application code rather than trigger-enforced FKs).

create table public.fantasy_gameweek_picks (
  id                         uuid primary key default gen_random_uuid(),
  fantasy_squad_id           uuid not null references public.fantasy_squads(id) on delete cascade,
  gameweek_id                uuid not null references public.gameweeks(id) on delete cascade,
  captain_fantasy_player_id  uuid not null references public.fantasy_players(id),
  oracle_captain_active      boolean not null default false,
  -- Same lock convention as group_predictions.locked_at (migration
  -- 004): null = still editable, set once the gameweek deadline
  -- passes so the pick becomes immutable for scoring.
  locked_at                  timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  unique (fantasy_squad_id, gameweek_id)
);

create index fantasy_gameweek_picks_gameweek_id_idx on public.fantasy_gameweek_picks (gameweek_id);

alter table public.fantasy_gameweek_picks enable row level security;

create policy "League members can view fantasy gameweek picks"
  on public.fantasy_gameweek_picks for select
  using (
    exists (
      select 1 from public.fantasy_squads fs
      where fs.id = fantasy_squad_id
        and public.is_fantasy_league_member(fs.fantasy_league_id, auth.uid())
    )
  );

create policy "Users can insert own fantasy gameweek picks"
  on public.fantasy_gameweek_picks for insert
  with check (
    exists (select 1 from public.fantasy_squads fs where fs.id = fantasy_squad_id and fs.user_id = auth.uid())
  );

create policy "Users can update own unlocked fantasy gameweek picks"
  on public.fantasy_gameweek_picks for update
  using (
    locked_at is null
    and exists (select 1 from public.fantasy_squads fs where fs.id = fantasy_squad_id and fs.user_id = auth.uid())
  );


-- ============================================================
-- 6. GROUP CHAT EXTENSION — nullable fantasy_league_id
-- ============================================================
-- Confirmed approach: additive nullable column alongside group_id,
-- not a polymorphic owner_type/owner_id pair. Reasoning (from
-- investigation): every touch point in components/chat/group-chat.tsx
-- — the initial `.eq("group_id", groupId)` query, the realtime
-- channel name `chat:${groupId}`, both postgres_changes filter
-- strings, and the existing RLS policies — is a literal group_id
-- column match, not an abstraction. This keeps every existing
-- groups-based path (query, realtime filter, RLS) completely
-- untouched; the app-code phase just adds a second optional prop and
-- one new query/filter branch. Mirrors how competition_id was bolted
-- onto groups in migration 060 (nullable, additive).
--
-- group_id must become nullable on both tables (it's currently NOT
-- NULL) since a fantasy-league chat row will have group_id = null.
-- Existing group-scoped RLS policies are unaffected: they all check
-- `... where group_id = chat_messages.group_id`, which safely
-- evaluates to no match (not an error) when group_id is null, so
-- fantasy rows simply never satisfy the old policies — no need to
-- touch them, only add new ones alongside.

alter table public.chat_messages
  alter column group_id drop not null,
  add column if not exists fantasy_league_id uuid references public.fantasy_leagues(id);

alter table public.chat_messages
  add constraint chat_messages_owner_xor
  check ((group_id is not null) <> (fantasy_league_id is not null));

create index if not exists chat_messages_fantasy_league_id_idx
  on public.chat_messages (fantasy_league_id) where fantasy_league_id is not null;

create policy "Fantasy league members can read messages"
  on public.chat_messages for select
  using (public.is_fantasy_league_member(fantasy_league_id, auth.uid()));

-- Groups' insert policy (migration 014) additionally requires
-- group_members.can_predict = true — a payment-gating concept that
-- has no fantasy_league_members equivalent in v1 (no payment model for
-- fantasy leagues yet), so membership alone gates insert here.
create policy "Fantasy league members can send messages"
  on public.chat_messages for insert
  with check (
    auth.uid() = user_id
    and public.is_fantasy_league_member(fantasy_league_id, auth.uid())
  );


alter table public.message_reactions
  alter column group_id drop not null,
  add column if not exists fantasy_league_id uuid references public.fantasy_leagues(id);

alter table public.message_reactions
  add constraint message_reactions_owner_xor
  check ((group_id is not null) <> (fantasy_league_id is not null));

create index if not exists message_reactions_fantasy_league_id_idx
  on public.message_reactions (fantasy_league_id) where fantasy_league_id is not null;

create policy "Fantasy league members can view reactions"
  on public.message_reactions for select
  using (public.is_fantasy_league_member(fantasy_league_id, auth.uid()));

create policy "Fantasy league members can add reactions"
  on public.message_reactions for insert
  with check (
    auth.uid() = user_id
    and public.is_fantasy_league_member(fantasy_league_id, auth.uid())
    and exists (
      select 1 from public.chat_messages
      where id = message_reactions.message_id
        and fantasy_league_id = message_reactions.fantasy_league_id
    )
  );

-- No new delete policy needed: the existing "Users remove their own
-- reaction" policy (migration 052) is `using (auth.uid() = user_id)`
-- with no group_id scoping at all, so it already covers fantasy-owned
-- reaction rows equally.


-- ============================================================
-- 7. FOLLOW-UP NOTE (not fixed here) — groups.passkey generation bug
-- ============================================================
-- Found during Fantasy League investigation, independent of this
-- feature, affecting the EXISTING prediction-groups feature:
-- groups.passkey is generated by a live-only DB trigger
-- (generate_passkey()) that was never checked into any tracked
-- migration, has NO unique constraint or index at the DB level, and
-- performs NO collision check — a 6-hex-char collision is
-- low-probability but genuinely unguarded. The only collision-retry
-- logic that exists anywhere (generate -> check -> retry x5) lives in
-- app/api/admin/regenerate-code/route.ts, which is only used for
-- regeneration, not initial group creation. fantasy_leagues.passkey
-- above deliberately uses that same generate -> check -> retry
-- pattern app-side from the start, backed by a real unique index, to
-- not repeat this. Fixing groups.passkey itself (tracking the trigger
-- in a migration, adding a real unique constraint, wiring app-side
-- retry into initial creation) is a separate follow-up, out of scope
-- for this migration.
-- ============================================================
