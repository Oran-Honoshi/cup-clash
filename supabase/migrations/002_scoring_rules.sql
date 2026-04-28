-- ============================================================
-- Migration 002 — Scoring Rules table
-- Run in Supabase SQL Editor AFTER 001_schema.sql
-- ============================================================

create table public.scoring_rules (
  id               uuid default gen_random_uuid() primary key,
  group_id         uuid references public.groups(id) on delete cascade not null unique,
  correct_outcome  int  default 10,
  exact_score      int  default 25,
  ko_advancement   int  default 20,
  tournament_winner int default 100,
  top_scorer       int  default 50,
  top_assister     int  default 50,
  -- Feature toggles
  enable_outcome        boolean default true,
  enable_exact          boolean default true,
  enable_ko_advancement boolean default true,
  enable_winner         boolean default true,
  enable_scorer         boolean default true,
  enable_assister       boolean default true,
  -- Lock state
  locked_at        timestamptz, -- set when first match kicks off
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- RLS
alter table public.scoring_rules enable row level security;

-- Group members can read rules
create policy "Group members can view scoring rules"
  on public.scoring_rules for select using (
    exists (
      select 1 from public.group_members
      where group_id = scoring_rules.group_id and user_id = auth.uid()
    )
  );

-- Only group admin can update rules
create policy "Admin can manage scoring rules"
  on public.scoring_rules for all using (
    exists (
      select 1 from public.groups
      where id = scoring_rules.group_id and admin_id = auth.uid()
    )
  );

-- Auto-create default rules when a group is created
create or replace function public.create_default_scoring_rules()
returns trigger as $$
begin
  insert into public.scoring_rules (group_id)
  values (new.id)
  on conflict (group_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_group_created
  after insert on public.groups
  for each row execute procedure public.create_default_scoring_rules();
