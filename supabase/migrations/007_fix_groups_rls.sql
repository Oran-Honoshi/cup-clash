-- ============================================================
-- Migration 007 — Fix infinite recursion on groups table RLS
-- ============================================================

-- Drop ALL policies on groups table and recreate cleanly
do $$ declare r record; begin
  for r in select policyname from pg_policies where tablename = 'groups' loop
    execute 'drop policy if exists "' || r.policyname || '" on public.groups';
  end loop;
end $$;

alter table public.groups enable row level security;

-- Anyone can read groups (needed for passkey lookup)
create policy "Anyone can view groups"
  on public.groups for select
  using (true);

-- Only authenticated users can create groups
create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = admin_id);

-- Only admin can update their group
create policy "Admins can update own group"
  on public.groups for update
  using (auth.uid() = admin_id);

-- Only admin can delete their group
create policy "Admins can delete own group"
  on public.groups for delete
  using (auth.uid() = admin_id);

-- Also fix scoring_rules insert policy (missing)
do $$ declare r record; begin
  for r in select policyname from pg_policies where tablename = 'scoring_rules' loop
    execute 'drop policy if exists "' || r.policyname || '" on public.scoring_rules';
  end loop;
end $$;

alter table public.scoring_rules enable row level security;

create policy "Anyone can view scoring rules"
  on public.scoring_rules for select
  using (true);

create policy "Admins can insert scoring rules"
  on public.scoring_rules for insert
  with check (
    exists (
      select 1 from public.groups
      where id = scoring_rules.group_id
        and admin_id = auth.uid()
    )
  );

create policy "Admins can update scoring rules"
  on public.scoring_rules for update
  using (
    exists (
      select 1 from public.groups
      where id = scoring_rules.group_id
        and admin_id = auth.uid()
    )
  );