-- ============================================================
-- Migration 042 — Team-level following: post-signup onboarding gate
-- Purely additive. Existing profiles are backfilled to `true` so the
-- one-time "Pick your teams" onboarding step never appears for accounts
-- that already existed before this migration — only genuinely new
-- accounts (inserted via the existing handle_new_user() trigger, which
-- this migration does not touch) get the default `false` and see it.
-- ============================================================

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

update public.profiles
set onboarding_completed = true
where onboarding_completed = false;
