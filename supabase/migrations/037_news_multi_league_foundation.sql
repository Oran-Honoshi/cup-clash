-- ============================================================
-- Migration 037 — News / multi-league expansion: Phase 0 data model
-- Purely additive. No existing table is altered destructively, no
-- existing column is renamed/removed, no live code path is touched.
-- matches.home / matches.away remain the authoritative display text —
-- the new *_id columns below are nullable enrichments only.
-- ============================================================

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists public.teams (
  id         uuid default gen_random_uuid() primary key,
  name       text not null unique,
  short_name text,
  badge_url  text,
  country    text,
  created_at timestamptz default now()
);

-- Seed from the distinct real team names currently in matches.home/away.
-- ("TBD", "W(SF1)", "W(SF2)", "L(SF1)", "L(SF2)" are bracket placeholders,
-- not teams, and are intentionally excluded.)
insert into public.teams (name)
values
  ('Algeria'), ('Argentina'), ('Australia'), ('Austria'), ('Belgium'),
  ('Bosnia & Herzegovina'), ('Brazil'), ('Cabo Verde'), ('Canada'),
  ('Colombia'), ('Congo DR'), ('Côte d''Ivoire'), ('Croatia'), ('Curaçao'),
  ('Czechia'), ('Ecuador'), ('Egypt'), ('England'), ('France'), ('Germany'),
  ('Ghana'), ('Haiti'), ('IR Iran'), ('Iraq'), ('Japan'), ('Jordan'),
  ('Korea Republic'), ('Mexico'), ('Morocco'), ('Netherlands'),
  ('New Zealand'), ('Norway'), ('Panama'), ('Paraguay'), ('Portugal'),
  ('Qatar'), ('Saudi Arabia'), ('Scotland'), ('Senegal'), ('South Africa'),
  ('Spain'), ('Sweden'), ('Switzerland'), ('Tunisia'), ('Türkiye'),
  ('USA'), ('Uruguay'), ('Uzbekistan')
on conflict (name) do nothing;

-- Public reference data — readable by everyone, writes via service role only.
alter table public.teams enable row level security;

create policy "Teams are publicly readable"
  on public.teams for select using (true);

-- ============================================================
-- COMPETITIONS
-- ============================================================
create table if not exists public.competitions (
  id             uuid default gen_random_uuid() primary key,
  name           text not null,
  type           text not null check (type in ('league', 'cup', 'tournament')),
  confederation  text,            -- e.g. "UEFA", "CONMEBOL"
  logo_url       text,
  created_at     timestamptz default now()
);

insert into public.competitions (name, type)
select v.name, v.type
from (values
  ('World Cup 2026',          'tournament'),
  ('Premier League',          'league'),
  ('La Liga',                 'league'),
  ('Serie A',                 'league'),
  ('Bundesliga',              'league'),
  ('Ligue 1',                 'league'),
  ('UEFA Champions League',   'cup')
) as v(name, type)
where not exists (
  select 1 from public.competitions c where c.name = v.name
);

alter table public.competitions enable row level security;

create policy "Competitions are publicly readable"
  on public.competitions for select using (true);

-- ============================================================
-- SEASONS
-- ============================================================
create table if not exists public.seasons (
  id               uuid default gen_random_uuid() primary key,
  competition_id   uuid references public.competitions(id) on delete cascade not null,
  label            text not null,   -- e.g. "2025/26" or "2026"
  start_date       date,
  end_date         date,
  status           text not null default 'upcoming'
                     check (status in ('upcoming', 'active', 'completed')),
  format_metadata  jsonb,
  created_at       timestamptz default now()
);

insert into public.seasons (competition_id, label, status)
select c.id, '2026', 'active'
from public.competitions c
where c.name = 'World Cup 2026'
  and not exists (
    select 1 from public.seasons s
    where s.competition_id = c.id and s.label = '2026'
  );

alter table public.seasons enable row level security;

create policy "Seasons are publicly readable"
  on public.seasons for select using (true);

-- ============================================================
-- EXTEND MATCHES — additive, backward-compatible.
-- home/away text columns are untouched and remain authoritative.
-- ============================================================
alter table public.matches
  add column if not exists competition_id uuid references public.competitions(id),
  add column if not exists season_id      uuid references public.seasons(id),
  add column if not exists home_team_id   uuid references public.teams(id),
  add column if not exists away_team_id   uuid references public.teams(id);

-- Backfill World Cup 2026 matches: competition + season.
update public.matches m
set competition_id = c.id,
    season_id = s.id
from public.competitions c
join public.seasons s on s.competition_id = c.id and s.label = '2026'
where c.name = 'World Cup 2026'
  and m.competition_id is null;

-- Backfill home_team_id / away_team_id by exact name match against teams.
-- Rows still holding bracket placeholders ("TBD", "W(SF1)", etc.) simply
-- find no matching team and stay null — expected, not an error.
update public.matches m
set home_team_id = t.id
from public.teams t
where t.name = m.home
  and m.home_team_id is null;

update public.matches m
set away_team_id = t.id
from public.teams t
where t.name = m.away
  and m.away_team_id is null;

-- ============================================================
-- NEWS SOURCES
-- ============================================================
create table if not exists public.news_sources (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  rss_url    text not null,
  enabled    boolean default true,
  created_at timestamptz default now()
);

insert into public.news_sources (name, rss_url)
select v.name, v.rss_url
from (values
  ('BBC Sport Football',  'https://feeds.bbci.co.uk/sport/football/rss.xml'),
  ('Sky Sports Football', 'https://www.skysports.com/rss/11095')
) as v(name, rss_url)
where not exists (
  select 1 from public.news_sources n where n.name = v.name
);

alter table public.news_sources enable row level security;

create policy "News sources are publicly readable"
  on public.news_sources for select using (true);

-- ============================================================
-- NEWS ARTICLES (net new — no cron/fetch wired up yet, table only)
-- ============================================================
create table if not exists public.news_articles (
  id               uuid default gen_random_uuid() primary key,
  source_id        uuid references public.news_sources(id) on delete cascade not null,
  title            text not null,
  summary          text,   -- short excerpt only, never full article body
  link_url         text not null,
  image_url        text,
  published_at     timestamptz,
  team_ids         uuid[],
  competition_ids  uuid[],
  created_at       timestamptz default now()
);

alter table public.news_articles enable row level security;

create policy "News articles are publicly readable"
  on public.news_articles for select using (true);

-- ============================================================
-- USER FOLLOWS (supports anonymous pre-signup + authenticated follows)
-- ============================================================
create table if not exists public.user_follows (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references public.profiles(id) on delete cascade,
  device_id      text,
  followed_type  text not null check (followed_type in ('team', 'competition')),
  followed_id    uuid not null,
  created_at     timestamptz default now(),
  constraint user_follows_owner_xor check (
    (user_id is not null and device_id is null) or
    (user_id is null and device_id is not null)
  )
);

alter table public.user_follows enable row level security;

create policy "Follows are publicly readable"
  on public.user_follows for select using (true);
create policy "Users can insert their own follow rows"
  on public.user_follows for insert with check (
    (auth.uid() = user_id and device_id is null) or
    (user_id is null and device_id is not null)
  );
create policy "Authenticated users can delete their own follows"
  on public.user_follows for delete using (auth.uid() = user_id);
