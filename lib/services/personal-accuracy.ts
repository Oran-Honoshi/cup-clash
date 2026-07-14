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
  const { data } = await sb
    .from("group_predictions")
    .select("is_exact, points_earned, matches(kickoff_at)")
    .eq("user_id", userId)
    .eq("pred_type", "match")
    .not("points_earned", "is", null);

  type Row = { is_exact: boolean | null; points_earned: number | null; matches: { kickoff_at: string } | { kickoff_at: string }[] | null };
  const rows = ((data ?? []) as unknown as Row[])
    .map(r => {
      const m = Array.isArray(r.matches) ? r.matches[0] : r.matches;
      if (!m?.kickoff_at) return null;
      const correct = !!r.is_exact || (r.points_earned ?? 0) > 0;
      return { date: m.kickoff_at.slice(0, 10), correct };
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
