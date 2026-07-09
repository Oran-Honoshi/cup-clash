-- ============================================================
-- Migration 039 — user_follows dedupe index
-- Prevents duplicate follow rows for the same authenticated user
-- (e.g. re-triggering the post-auth auto-follow, or double-clicking
-- Follow) so callers can safely upsert with onConflict + ignoreDuplicates.
-- Scoped to the authenticated-owner rows only — the anonymous device_id
-- path (unused by the current UI, kept for future use) is untouched.
-- ============================================================

create unique index if not exists user_follows_owner_target_key
  on public.user_follows (user_id, followed_type, followed_id)
  where user_id is not null;
