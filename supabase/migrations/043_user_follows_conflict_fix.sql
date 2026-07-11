-- ============================================================
-- Migration 043 — fix user_follows ON CONFLICT arbiter
-- Migration 039 added a PARTIAL unique index (WHERE user_id IS NOT
-- NULL) to scope dedup to authenticated users. Postgres can only use
-- a partial index as an ON CONFLICT arbiter if the ON CONFLICT clause
-- repeats the same predicate — but PostgREST/supabase-js's upsert()
-- only accepts a plain column list for `onConflict`, with no way to
-- pass that predicate. Every follow upsert has therefore been failing
-- with 42P10 ("no unique or exclusion constraint matching the ON
-- CONFLICT specification") since 039 was applied, and user_follows
-- has had zero rows written since. A standard (non-partial) unique
-- index matches the plain onConflict target used by the app, and
-- still doesn't constrain device_id-based rows against each other
-- since SQL unique indexes treat NULL user_id values as distinct.
-- ============================================================

drop index if exists public.user_follows_owner_target_key;

create unique index if not exists user_follows_owner_target_key
  on public.user_follows (user_id, followed_type, followed_id);
