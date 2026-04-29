-- ============================================================
-- Migration 003 — Trivia, Multi-group, Awards, Admin fee
-- Run in Supabase SQL Editor AFTER 002_scoring_rules.sql
-- ============================================================

-- ── TRIVIA SCORES ─────────────────────────────────────────
create table public.trivia_scores (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  group_id     uuid references public.groups(id)   on delete cascade not null,
  mode         text not null default 'points',  -- 'points' | 'free'
  score        int  not null default 0,
  correct_count int not null default 0,
  total_questions int not null default 20,
  total_time_ms bigint not null default 0,       -- for tie-breaking
  question_ids  text[] not null default '{}',    -- which questions were shown
  answers       jsonb  not null default '[]',    -- full answer log
  played_at    timestamptz default now(),
  unique(user_id, group_id, mode)
);

alter table public.trivia_scores enable row level security;

create policy "Group members can view trivia scores"
  on public.trivia_scores for select using (
    exists (select 1 from public.group_members where group_id = trivia_scores.group_id and user_id = auth.uid())
  );

create policy "Users can insert own trivia scores"
  on public.trivia_scores for insert with check (auth.uid() = user_id);

-- ── TRIVIA CHAMPION BADGE ─────────────────────────────────
-- Stored on group_members table — add a column
alter table public.group_members
  add column if not exists is_trivia_champion boolean default false,
  add column if not exists nickname text;  -- per-group nickname

-- ── TOURNAMENT PICKS — extended ───────────────────────────
-- Already in predictions table via pred_type field.
-- New pred_type values: 'second', 'third', 'best_third_X' (X=1-8),
--                       'golden_ball', 'golden_glove'

-- ── ADMIN FEE ─────────────────────────────────────────────
alter table public.groups
  add column if not exists admin_fee_percent numeric(5,2) default 0,
  add column if not exists group_type text default 'tournament',  -- 'tournament' | 'single_match'
  add column if not exists single_match_id text,  -- references matches.id if single_match type
  add column if not exists nickname_enabled boolean default true,
  add column if not exists rules_text text;  -- group rules (shown to members, sent in welcome email)

-- ── SCORING CONFIG — extended ─────────────────────────────
alter table public.scoring_rules
  add column if not exists exact_home_goals   int  default 2,
  add column if not exists correct_draw       int  default 1,
  add column if not exists second_place       int  default 4,
  add column if not exists third_place        int  default 2,
  add column if not exists best_third         int  default 1,
  add column if not exists golden_ball        int  default 2,
  add column if not exists golden_glove       int  default 2,
  add column if not exists trivia_per_q       int  default 1,
  add column if not exists enable_second      boolean default true,
  add column if not exists enable_third       boolean default true,
  add column if not exists enable_best_third  boolean default true,
  add column if not exists enable_golden_ball boolean default false,
  add column if not exists enable_golden_glove boolean default false,
  add column if not exists enable_trivia      boolean default false,
  add column if not exists trivia_open_at     text default 'pre_tournament',  -- 'pre_tournament' | 'post_group' | 'always'
  add column if not exists admin_fee_percent  numeric(5,2) default 0,
  -- Scoring system choice
  add column if not exists scoring_system text default '3-2-1';  -- '3-2-1' | 'legacy' | 'custom'

-- ── MULTI-GROUP SUPPORT ───────────────────────────────────
-- group_members already handles multi-group (user_id can appear in multiple groups)
-- Add a "primary group" preference per user
alter table public.profiles
  add column if not exists primary_group_id uuid references public.groups(id);

-- ── SINGLE MATCH GROUP EXTRA PICKS ───────────────────────
create table if not exists public.single_match_picks (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  group_id     uuid references public.groups(id)   on delete cascade not null,
  match_id     text references public.matches(id) on delete cascade not null,
  yellow_cards int,
  red_cards    int,
  corners      int,
  goes_extra_time boolean,
  goes_penalties  boolean,
  created_at   timestamptz default now(),
  unique(user_id, group_id, match_id)
);

alter table public.single_match_picks enable row level security;

create policy "Group members can view single match picks"
  on public.single_match_picks for select using (
    exists (select 1 from public.group_members where group_id = single_match_picks.group_id and user_id = auth.uid())
  );

create policy "Users can manage own single match picks"
  on public.single_match_picks for all using (auth.uid() = user_id);
