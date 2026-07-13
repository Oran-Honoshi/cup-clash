-- ============================================================
-- Migration 050 — Daily Challenges: add "Guess the Club" game type
-- ============================================================
-- Additive only. Generalizes daily_challenges.answer_player_id (previously
-- the only possible answer) into "exactly one of a player or a team
-- answer", so a 'guess_club' row can point at public.teams instead.
--
-- guess_club puzzles alternate by calendar day with guess_footballer (see
-- lib/services/daily-challenge.ts) rather than both existing on the same
-- date, so the existing unique index on challenge_date alone is left as-is.

alter table public.daily_challenges
  alter column answer_player_id drop not null;

alter table public.daily_challenges
  add column if not exists answer_team_id uuid references public.teams(id) on delete restrict;

alter table public.daily_challenges
  add constraint daily_challenges_exactly_one_answer
  check ((answer_player_id is not null) <> (answer_team_id is not null));

comment on column public.daily_challenges.answer_team_id is
  'Set only when game_type = ''guess_club'' — the answer_player_id/answer_team_id pair is a poor-man''s polymorphic FK, kept as two nullable columns (rather than a generic entity_id) so each still enforces real referential integrity against its own table.';
