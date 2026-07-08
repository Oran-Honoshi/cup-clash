-- ============================================================
-- Migration 034 — notification_preferences on profiles
-- ============================================================
-- The per-type notification toggles in components/notifications/notifications-client.tsx
-- previously persisted to localStorage only, so no server-side sender could
-- ever honor a user's choice. This column gives the toggles a server-readable
-- home; senders should check it before sending a given notification type.

alter table public.profiles
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

comment on column public.profiles.notification_preferences is
  'Per-type notification opt-in/out, keyed by type (goals, results, leaderboard, chat, newmember). Missing keys default to on.';
