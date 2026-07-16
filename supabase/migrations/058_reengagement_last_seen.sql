-- Re-engagement bottom sheet: needs to measure "time since last app open"
-- (profiles.last_seen_at, nowhere in the schema before this) and "did a
-- match finish since then" (matches only had a status enum, no transition
-- timestamp). Both are nullable with no backfill — NULL last_seen_at means
-- "never recorded" (treated as not-eligible, can't measure a gap against
-- nothing) and NULL finished_at on historical rows means those finishes
-- simply won't retroactively trigger the sheet, only forward-looking ones
-- from the scores cron onward will.
alter table public.profiles add column last_seen_at timestamptz;
alter table public.matches  add column finished_at  timestamptz;
