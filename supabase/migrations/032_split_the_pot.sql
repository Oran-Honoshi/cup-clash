-- ============================================================
-- Migration 032 — Admin "Split the Pot" for genuine leaderboard ties
-- ============================================================

alter table public.groups
  add column if not exists payout_splits jsonb;

comment on column public.groups.payout_splits is
  'Admin-confirmed prize splits for genuine ties at a payout position after all tiebreakers, e.g. {"first": ["uid1","uid2"], "second": null, "third": null}.';
