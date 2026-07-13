-- ============================================================
-- Migration 053 — Rival Tracker
-- ============================================================
-- One user declares another member of a shared group as their "rival".
-- A row's owner (user_id) is the declarer; rival_id is the target. Unique
-- on (group_id, user_id) — declaring a new rival replaces the old one,
-- there's only ever one active declared rival per user per group. The
-- head-to-head comparison itself is computed live from group_predictions
-- (see lib/services/rivalries.ts) — this table only stores the pairing.

create table if not exists public.rivalries (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rival_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_id <> rival_id),
  unique (group_id, user_id)
);

create index if not exists rivalries_group_rival_idx on public.rivalries (group_id, rival_id);

alter table public.rivalries enable row level security;

create policy "Group members can read rivalries"
  on public.rivalries for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = rivalries.group_id and user_id = auth.uid()
    )
  );

create policy "Users declare their own rival"
  on public.rivalries for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.group_members where group_id = rivalries.group_id and user_id = rivalries.user_id)
    and exists (select 1 from public.group_members where group_id = rivalries.group_id and user_id = rivalries.rival_id)
  );

create policy "Users update their own declared rival"
  on public.rivalries for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.group_members where group_id = rivalries.group_id and user_id = rivalries.rival_id)
  );

create policy "Users remove their own declared rival"
  on public.rivalries for delete
  using (auth.uid() = user_id);
