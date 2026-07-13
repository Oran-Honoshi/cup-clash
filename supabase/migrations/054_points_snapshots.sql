-- ============================================================
-- Migration 054 — Points-Race Chart (historical snapshots)
-- ============================================================
-- No historical "matchday" or points-by-date data existed anywhere in this
-- schema before this (see lib/services/rivalries.ts's "today" workaround
-- for the same gap). This table is a lightweight daily snapshot of each
-- group member's live total points (from get_group_member_points, the
-- same source the Leaderboard already uses) — populated by the existing
-- scores cron (app/api/scores/route.ts), not a new cron. Charting always
-- overlays the current LIVE total for "today" on top of these snapshots
-- (see lib/services/points-history.ts), so there's no gap between the
-- last cron tick and "right now".

create table if not exists public.points_snapshots (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.groups(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  points        int  not null default 0,
  snapshot_date date not null,
  created_at    timestamptz not null default now(),
  unique (group_id, user_id, snapshot_date)
);

create index if not exists points_snapshots_group_date_idx on public.points_snapshots (group_id, snapshot_date);

alter table public.points_snapshots enable row level security;

create policy "Group members can read points snapshots"
  on public.points_snapshots for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = points_snapshots.group_id and user_id = auth.uid()
    )
  );

-- Written only by the scores cron (service role) — same convention as
-- telegram_leaderboard_rank (migration 047).
create policy "Service role manages points snapshots"
  on public.points_snapshots for insert
  with check (false);

create policy "Service role updates points snapshots"
  on public.points_snapshots for update
  using (false);
