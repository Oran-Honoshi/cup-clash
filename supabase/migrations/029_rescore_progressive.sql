-- Migration 029 — Re-score finished match predictions for progressive scoring groups
-- FIX: exactScore was being added to correctOutcome (additive) in progressive mode.
-- Correct behaviour: exactScore IS the total (same as flat mode); correctOutcome
-- is awarded for a correct-outcome-only prediction.

UPDATE public.group_predictions gp
SET
  points_earned = CASE
    WHEN gp.home_score = m.home_score AND gp.away_score = m.away_score THEN
      -- exact score: use stage-specific exact value as the TOTAL
      CASE m.stage
        WHEN 'Group' THEN sr.gs_exact_score
        WHEN 'R32'   THEN sr.r32_exact_score
        WHEN 'R16'   THEN sr.r16_exact_score
        WHEN 'QF'    THEN sr.qf_exact_score
        WHEN 'SF'    THEN sr.sf_exact_score
        WHEN '3rd'   THEN sr.third_exact_score
        WHEN 'Final' THEN sr.final_exact_score
        ELSE sr.gs_exact_score
      END
    WHEN SIGN((gp.home_score)::numeric - (gp.away_score)::numeric)
       = SIGN((m.home_score)::numeric  - (m.away_score)::numeric) THEN
      -- correct outcome only
      CASE m.stage
        WHEN 'Group' THEN sr.gs_correct_outcome
        WHEN 'R32'   THEN sr.r32_correct_outcome
        WHEN 'R16'   THEN sr.r16_correct_outcome
        WHEN 'QF'    THEN sr.qf_correct_outcome
        WHEN 'SF'    THEN sr.sf_correct_outcome
        WHEN '3rd'   THEN sr.third_correct_outcome
        WHEN 'Final' THEN sr.final_correct_outcome
        ELSE sr.gs_correct_outcome
      END
    ELSE 0
  END,
  is_exact = (gp.home_score = m.home_score AND gp.away_score = m.away_score)
FROM public.matches m, public.scoring_rules sr
WHERE gp.match_id = m.id
  AND sr.group_id = gp.group_id
  AND gp.pred_type = 'match'
  AND m.status = 'finished'
  AND sr.use_progressive_scoring = true;
