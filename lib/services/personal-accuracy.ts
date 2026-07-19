import type { SupabaseClient } from "@supabase/supabase-js";

// Personal, cross-group prediction accuracy over time — distinct from
// PointsRaceChart (components/groups/points-race-chart.tsx), which is
// points-only and scoped to a single group. "Correct" mirrors the
// definition already used for group stats (lib/services/groups.ts
// statsMap): is_exact, or points_earned > 0 for a non-exact correct pick.
// Every settled group_predictions row across every group the user is in
// counts as one attempt — scoring rules (and therefore what counts as
// "correct") can differ per group, so rows aren't deduped across groups.

export interface AccuracyPoint {
  date: string;          // match kickoff date (UTC, YYYY-MM-DD) — the bucket this point closes out
  accuracyPct: number;   // cumulative accuracy as of this date
  settledCount: number;  // cumulative settled predictions as of this date
}

export interface PersonalAccuracyHistory {
  points: AccuracyPoint[];
  hasHistory: boolean;
  overallAccuracyPct: number;
}

export async function getPersonalAccuracyHistory(sb: SupabaseClient, userId: string): Promise<PersonalAccuracyHistory> {
  // group_predictions.match_id has no FK to matches — PostgREST can't
  // resolve an embedded `matches(kickoff_at)` select (no relationship to
  // join on), so it must be fetched as two separate queries and joined in
  // JS, same as every other group_predictions call site in the codebase.
  const { data, error } = await sb
    .from("group_predictions")
    .select("match_id, is_exact, points_earned")
    .eq("user_id", userId)
    .eq("pred_type", "match")
    .not("points_earned", "is", null);

  if (error) throw error;

  type PredRow = { match_id: string; is_exact: boolean | null; points_earned: number | null };
  const predRows = (data ?? []) as PredRow[];
  if (predRows.length === 0) return { points: [], hasHistory: false, overallAccuracyPct: 0 };

  const matchIds = Array.from(new Set(predRows.map(r => r.match_id)));
  const { data: matchRows, error: matchError } = await sb
    .from("matches")
    .select("id, kickoff_at")
    .in("id", matchIds);

  if (matchError) throw matchError;

  const kickoffById = new Map(
    ((matchRows ?? []) as Array<{ id: string; kickoff_at: string }>).map(m => [m.id, m.kickoff_at])
  );

  const rows = predRows
    .map(r => {
      const kickoffAt = kickoffById.get(r.match_id);
      if (!kickoffAt) return null;
      const correct = !!r.is_exact || (r.points_earned ?? 0) > 0;
      return { date: kickoffAt.slice(0, 10), correct };
    })
    .filter((r): r is { date: string; correct: boolean } => !!r);

  if (rows.length === 0) return { points: [], hasHistory: false, overallAccuracyPct: 0 };

  const byDate = new Map<string, { correct: number; total: number }>();
  for (const r of rows) {
    const bucket = byDate.get(r.date) ?? { correct: 0, total: 0 };
    bucket.total++;
    if (r.correct) bucket.correct++;
    byDate.set(r.date, bucket);
  }

  const dates = Array.from(byDate.keys()).sort();
  let cumCorrect = 0;
  let cumTotal = 0;
  const points: AccuracyPoint[] = dates.map(date => {
    const b = byDate.get(date)!;
    cumCorrect += b.correct;
    cumTotal += b.total;
    return { date, accuracyPct: Math.round((cumCorrect / cumTotal) * 100), settledCount: cumTotal };
  });

  return {
    points,
    hasHistory: points.length >= 2,
    overallAccuracyPct: points[points.length - 1].accuracyPct,
  };
}
