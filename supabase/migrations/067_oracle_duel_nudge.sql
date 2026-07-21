-- Oracle Duel nudge push — dedup for the once-daily "haven't opened the app"
-- push cron (app/api/reminders/oracle-duel-nudge). Unlike match_reminder_sent
-- (keyed per user+match+tier, since those repeat per fixture), this nudge is
-- one push per user per calendar day regardless of which match ends up
-- featured, so a single nullable timestamp on profiles is enough — no
-- separate table needed.
alter table public.profiles add column last_oracle_nudge_sent_at timestamptz;
