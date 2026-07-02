-- ============================================================
-- Migration 031 — Golden Guess tiebreaker in the public.leaderboard view
-- ============================================================
--
-- NOTE: as of this migration, no application code queries public.leaderboard
-- (the app computes rankings in lib/services/groups.ts against the
-- group_predictions table). This view is also still built against the
-- legacy public.predictions table, not group_predictions, so its
-- total_points/exact_scores here can already diverge from what the app
-- displays. Tiers 3 (Final goal-minute distance) and 4 (correct Tournament
-- Winner pick) are NOT added here because those picks live in
-- group_predictions.pred_type/pred_value, not in this view's data source —
-- wiring them in would mean rebuilding the view against the live tables.
-- Tier 2 (exact scores) is added below since the data is already present.
-- If this view is ever adopted as a real ranking source, rebuild it against
-- group_predictions/matches.final_first_goal_minute first so all 4 tiers
-- can be expressed consistently with lib/leaderboard-sort.ts.

CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT
    gm.group_id,
    gm.user_id,
    p.name,
    p.country,
    gm.paid,
    COALESCE(SUM(pr.points_earned), 0) + COALESCE(ba_sum.bonus_points, 0) AS total_points,
    COUNT(pr.is_exact) FILTER (WHERE pr.is_exact = true) AS exact_scores,
    RANK() OVER (
      PARTITION BY gm.group_id
      ORDER BY
        COALESCE(SUM(pr.points_earned), 0) + COALESCE(ba_sum.bonus_points, 0) DESC,
        COUNT(pr.is_exact) FILTER (WHERE pr.is_exact = true) DESC
    ) AS rank
  FROM public.group_members gm
  JOIN public.profiles p ON p.id = gm.user_id
  LEFT JOIN public.predictions pr
    ON pr.user_id = gm.user_id
    AND pr.group_id = gm.group_id
  LEFT JOIN (
    SELECT user_id, group_id, SUM(points_earned) AS bonus_points
    FROM public.bonus_answers
    GROUP BY user_id, group_id
  ) ba_sum
    ON ba_sum.user_id = gm.user_id
    AND ba_sum.group_id = gm.group_id
  GROUP BY gm.group_id, gm.user_id, p.name, p.country, gm.paid, ba_sum.bonus_points;
