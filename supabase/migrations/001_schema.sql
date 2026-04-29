-- ============================================================
-- Cup Clash — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  country     text,           -- CountryCode e.g. "ARG"
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'country'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- GROUPS
-- ============================================================
create table public.groups (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  admin_id      uuid references public.profiles(id) on delete cascade not null,
  buy_in_amount numeric(10,2) default 0,
  payout_first  numeric(5,2) default 60,   -- percentage
  payout_second numeric(5,2) default 30,
  payout_third  numeric(5,2) default 10,
  max_members   int default 10,
  invite_code   text unique default encode(gen_random_bytes(6), 'hex'),
  created_at    timestamptz default now()
);

-- ============================================================
-- GROUP MEMBERS
-- ============================================================
create table public.group_members (
  id         uuid default gen_random_uuid() primary key,
  group_id   uuid references public.groups(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  paid       boolean default false,
  joined_at  timestamptz default now(),
  unique(group_id, user_id)
);

-- ============================================================
-- MATCHES (populated via schedule import or API sync)
-- ============================================================
create table public.matches (
  id            text primary key,   -- e.g. "g001", "qf-01"
  home          text not null,
  away          text not null,
  home_flag     text,               -- flagcdn code e.g. "ar"
  away_flag     text,
  kickoff_at    timestamptz not null,
  stage         text not null,      -- "Group" | "R32" | "R16" | "QF" | "SF" | "Final"
  group_letter  text,               -- "A" through "L"
  stadium       text,
  city          text,
  host_country  text,               -- "USA" | "CAN" | "MEX"
  home_score    int,                -- null until played
  away_score    int,
  status        text default 'upcoming'  -- "upcoming" | "live" | "finished"
);

-- ============================================================
-- PREDICTIONS
-- ============================================================
create table public.predictions (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  group_id        uuid references public.groups(id) on delete cascade not null,
  match_id        text references public.matches(id) on delete cascade,
  -- Score prediction
  home_score      int,
  away_score      int,
  -- Tournament-level predictions (match_id null for these)
  pred_type       text,   -- "match" | "winner" | "top_scorer" | "top_assister"
  pred_value      text,   -- country code or player name
  -- Scoring
  points_earned   int default 0,
  is_exact        boolean default false,
  locked_at       timestamptz,
  created_at      timestamptz default now(),
  unique(user_id, group_id, match_id, pred_type)
);

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================
create or replace view public.leaderboard as
  select
    gm.group_id,
    gm.user_id,
    p.name,
    p.country,
    gm.paid,
    coalesce(sum(pr.points_earned), 0) as total_points,
    count(pr.is_exact) filter (where pr.is_exact = true) as exact_scores,
    rank() over (
      partition by gm.group_id
      order by coalesce(sum(pr.points_earned), 0) desc
    ) as rank
  from public.group_members gm
  join public.profiles p on p.id = gm.user_id
  left join public.predictions pr
    on pr.user_id = gm.user_id
    and pr.group_id = gm.group_id
  group by gm.group_id, gm.user_id, p.name, p.country, gm.paid;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.matches       enable row level security;
alter table public.predictions   enable row level security;

-- Profiles: users can read all, update own
create policy "Public profiles are viewable"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Groups: members can read their groups, admins can update
create policy "Group members can view group"
  on public.groups for select using (
    exists (
      select 1 from public.group_members
      where group_id = id and user_id = auth.uid()
    )
    or admin_id = auth.uid()
  );
create policy "Admins can update group"
  on public.groups for update using (admin_id = auth.uid());
create policy "Authenticated users can create groups"
  on public.groups for insert with check (auth.uid() = admin_id);

-- Group members: members can view, admins can insert/delete
create policy "Members can view group members"
  on public.group_members for select using (
    exists (
      select 1 from public.group_members gm2
      where gm2.group_id = group_id and gm2.user_id = auth.uid()
    )
  );
create policy "Users can join groups"
  on public.group_members for insert with check (auth.uid() = user_id);
create policy "Admins can manage members"
  on public.group_members for update using (
    exists (
      select 1 from public.groups
      where id = group_id and admin_id = auth.uid()
    )
  );

-- Matches: public read
create policy "Matches are publicly readable"
  on public.matches for select using (true);

-- Predictions: users can see all in their groups, edit own before lock
create policy "Group members can view predictions after kickoff"
  on public.predictions for select using (
    exists (
      select 1 from public.group_members
      where group_id = predictions.group_id and user_id = auth.uid()
    )
  );
create policy "Users can insert own predictions"
  on public.predictions for insert with check (auth.uid() = user_id);
create policy "Users can update own unlocked predictions"
  on public.predictions for update using (
    auth.uid() = user_id and locked_at is null
  );

-- ============================================================
-- SEED: Import schedule matches
-- ============================================================
-- Run the seed separately after schema is applied.
-- See: supabase/seed.sql
