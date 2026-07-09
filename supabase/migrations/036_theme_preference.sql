-- ============================================================
-- Migration 036 — theme_preference on profiles
-- ============================================================
-- Persists the selected app-wide visual theme (Stadium Night / Fan
-- Zone / Data Forward / Chalk Talk) so it survives reload/re-login,
-- synced from the theme picker in Profile/Settings.

alter table public.profiles
  add column if not exists theme_preference text not null default 'a';

comment on column public.profiles.theme_preference is
  'Selected app theme: a (Stadium Night), b (Fan Zone), c (Data Forward), d (Chalk Talk).';
