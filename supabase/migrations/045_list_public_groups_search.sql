-- ============================================================
-- Migration 045 — Add search/filter params to list_public_groups()
-- ============================================================
-- Migration 044 introduced list_public_groups() with no parameters,
-- returning every public group. This migration adds server-side
-- search-by-name and group_type filtering so the new Search Groups
-- UI doesn't need to ship the full public-group list to the client.
--
-- A different parameter list is a distinct function overload in
-- Postgres, so the old zero-arg signature is dropped explicitly —
-- there are no existing callers of it to preserve.
-- ============================================================

drop function if exists public.list_public_groups();

create or replace function public.list_public_groups(
  p_search     text default null,
  p_group_type text default null
)
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
  where g.is_public = true
    and (p_search is null or g.name ilike '%' || p_search || '%')
    and (p_group_type is null or g.group_type = p_group_type)
  order by g.created_at desc
  limit 50;
$$;

revoke all on function public.list_public_groups(text, text) from public;
revoke all on function public.list_public_groups(text, text) from anon;
grant execute on function public.list_public_groups(text, text) to authenticated;
