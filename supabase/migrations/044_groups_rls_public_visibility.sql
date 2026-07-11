-- ============================================================
-- Migration 044 — Close direct-API exposure of the groups table
-- ============================================================
-- Previously "Anyone can view groups" (USING (true)) let any
-- authenticated client read every group's buy_in_amount,
-- payout_splits, corporate_prize, payment_link, passkey, etc. via
-- the Supabase REST API directly, regardless of membership.
--
-- This migration:
--   1. Adds groups.is_public (default false — no behavior change for
--      existing groups).
--   2. Replaces the blanket SELECT policy with one that only grants
--      full-row access to the group's admin or an existing member.
--      is_public does NOT grant full-row access — see (4).
--   3. Adds a SECURITY DEFINER helper (is_group_member) so the new
--      policy can check group_members without re-triggering
--      group_members' own "Admins can view group members" policy,
--      which itself queries groups — a groups<->group_members cycle
--      is exactly what migration 007 previously had to work around.
--   4. Adds list_public_groups(), a SECURITY DEFINER function
--      returning only a safe column subset (no money/prize/payment
--      fields, no passkey) for groups marked is_public. A table-
--      returning function is used instead of a SECURITY DEFINER view
--      — this project's `leaderboard` view already trips the Supabase
--      linter's security_definer_view ERROR lint, and a function
--      keeps the exposed surface explicit rather than inheriting
--      whatever columns a view happens to select.
-- ============================================================

alter table public.groups
  add column if not exists is_public boolean not null default false;

comment on column public.groups.is_public is
  'Whether the group is discoverable via list_public_groups() before joining. Does not grant non-members full-row SELECT on groups.';

create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_user_id
  );
$$;

revoke all on function public.is_group_member(uuid, uuid) from public;
revoke all on function public.is_group_member(uuid, uuid) from anon;
grant execute on function public.is_group_member(uuid, uuid) to authenticated;

drop policy if exists "Anyone can view groups" on public.groups;

create policy "Members and admins can view group"
  on public.groups for select
  using (
    admin_id = auth.uid()
    or public.is_group_member(id, auth.uid())
  );

create or replace function public.list_public_groups()
returns table (
  id           uuid,
  name         text,
  group_type   text,
  group_mode   text,
  max_members  int,
  member_count bigint,
  created_at   timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    g.id,
    g.name,
    g.group_type,
    g.group_mode,
    g.max_members,
    (select count(*) from public.group_members gm where gm.group_id = g.id) as member_count,
    g.created_at
  from public.groups g
  where g.is_public = true;
$$;

revoke all on function public.list_public_groups() from public;
revoke all on function public.list_public_groups() from anon;
grant execute on function public.list_public_groups() to authenticated;
