-- ============================================================
-- Update leaderboard view to include bonus question points
-- ============================================================

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
      ORDER BY COALESCE(SUM(pr.points_earned), 0) + COALESCE(ba_sum.bonus_points, 0) DESC
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
