-- ============================================================
-- Migration 004 — Extended Prediction Types + Group Predictions
-- Safe to run even if some tables already exist
-- ============================================================

-- Extended tournament pick columns
alter table public.predictions
  add column if not exists pred_team   text,
  add column if not exists pred_number int;

-- New scoring rule columns for new pick types
alter table public.scoring_rules
  add column if not exists best_young_player   int     default 50,
  add column if not exists best_defence        int     default 50,
  add column if not exists team_goals          int     default 30,
  add column if not exists enable_best_young   boolean default false,
  add column if not exists enable_best_defence boolean default false,
  add column if not exists enable_team_goals   boolean default false;

-- Group stage predictions table
create table if not exists public.group_predictions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id)  on delete cascade not null,
  group_id      uuid references public.groups(id)    on delete cascade not null,
  match_id      text references public.matches(id)   on delete cascade not null,
  home_score    int  not null,
  away_score    int  not null,
  locked_at     timestamptz,
  points_earned int  default 0,
  is_exact      boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id, group_id, match_id)
);

alter table public.group_predictions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'group_predictions'
    and policyname = 'Group members can view group predictions'
  ) then
    create policy "Group members can view group predictions"
      on public.group_predictions for select using (
        exists (
          select 1 from public.group_members
          where group_id = group_predictions.group_id and user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'group_predictions'
    and policyname = 'Users can insert own group predictions'
  ) then
    create policy "Users can insert own group predictions"
      on public.group_predictions for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'group_predictions'
    and policyname = 'Users can update own unlocked group predictions'
  ) then
    create policy "Users can update own unlocked group predictions"
      on public.group_predictions for update using (
        auth.uid() = user_id and locked_at is null
      );
  end if;
end $$;

-- Auto-lock helper function
create or replace function public.lock_due_predictions()
returns void as $$
begin
  update public.group_predictions
  set locked_at = now()
  where locked_at is null
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.kickoff_at <= now() + interval '5 minutes'
    );
end;
$$ language plpgsql security definer;
