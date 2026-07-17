// Oracle Duel — a separate, independent head-to-head prediction against the
// Oracle. Distinct from the "Beat the Oracle" Game Room section in
// lib/services/oracle.ts (which compares the Oracle to a user's own
// group_predictions, computed on read): this feature has its own
// prediction input (oracle_duels, migration 059) and never reads or writes
// group_predictions. A user can duel the Oracle whether or not they're in
// any group, and their group picks never leak into this scoring.

import { sbAdmin } from "@/lib/supabase/admin";
import { calcLivePoints } from "@/lib/services/predictions";
import { isMatchLocked } from "@/lib/isMatchLocked";
import { getNextOracleMatch, type OracleMatchInfo, type OraclePredictionRow } from "@/lib/services/oracle";

export interface OracleDuelRow {
  id: string;
  user_id: string;
  match_id: string;
  user_home_score: number;
  user_away_score: number;
  oracle_home_score: number;
  oracle_away_score: number;
  points_user: number | null;
  points_oracle: number | null;
  locked_at: string;
  created_at: string;
  resolved_at: string | null;
}

// ── Submit / update a duel prediction ──────────────────────────────────────
// Server-side only (called from the API route after verifying the session)
// — the client never supplies the Oracle's score itself, only its own pick,
// so there's no way to fake the opponent's prediction.

export type SubmitDuelResult =
  | { ok: true; duel: OracleDuelRow }
  | { ok: false; error: "invalid_score" | "not_found" | "locked" };

export async function submitOracleDuel(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<SubmitDuelResult> {
  if (
    !Number.isInteger(homeScore) || !Number.isInteger(awayScore) ||
    homeScore < 0 || awayScore < 0
  ) {
    return { ok: false, error: "invalid_score" };
  }

  const sb = sbAdmin();

  const { data: match } = await sb
    .from("matches")
    .select("id, kickoff_at, status")
    .eq("id", matchId)
    .maybeSingle();
  if (!match || match.status !== "upcoming") return { ok: false, error: "not_found" };
  if (isMatchLocked(match.kickoff_at)) return { ok: false, error: "locked" };

  const { data: prediction } = await sb
    .from("oracle_predictions")
    .select("predicted_home_score, predicted_away_score")
    .eq("match_id", matchId)
    .maybeSingle();
  if (!prediction) return { ok: false, error: "not_found" };

  const lockDeadline = new Date(new Date(match.kickoff_at).getTime() - 5 * 60 * 1000).toISOString();

  const { data, error } = await sb
    .from("oracle_duels")
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        user_home_score: homeScore,
        user_away_score: awayScore,
        oracle_home_score: prediction.predicted_home_score,
        oracle_away_score: prediction.predicted_away_score,
        locked_at: lockDeadline,
      },
      { onConflict: "user_id,match_id" }
    )
    .select()
    .single();

  if (error || !data) return { ok: false, error: "not_found" };
  return { ok: true, duel: data as OracleDuelRow };
}

// ── Resolution ──────────────────────────────────────────────────────────
// Lazily grades any unresolved duel whose match has finished, rather than a
// dedicated cron — the Oracle Duel table is small (knockout matches only)
// and this runs on every dashboard read. Fixed scoring rules (25 exact / 10
// outcome, calcLivePoints's defaults) apply regardless of any group's
// scoring_rules, and grading always uses the 90-minute score
// (home_score/away_score) — deliberately NOT effectiveScore()'s
// ET-if-available convention from oracle.ts, since Oracle Duel's rule set
// is fixed and simple by design, not tied to any knockout_policy.
export async function resolveOracleDuels(): Promise<void> {
  const sb = sbAdmin();

  const { data: unresolved } = await sb
    .from("oracle_duels")
    .select("id, match_id, user_home_score, user_away_score, oracle_home_score, oracle_away_score")
    .is("resolved_at", null);
  if (!unresolved?.length) return;

  const matchIds = [...new Set(unresolved.map(d => d.match_id))];
  const { data: matches } = await sb
    .from("matches")
    .select("id, status, home_score, away_score")
    .in("id", matchIds)
    .eq("status", "finished");

  const finishedById = new Map(
    (matches ?? [])
      .filter((m): m is { id: string; status: string; home_score: number; away_score: number } =>
        m.home_score != null && m.away_score != null)
      .map(m => [m.id, m])
  );
  if (!finishedById.size) return;

  const updates = unresolved
    .filter(d => finishedById.has(d.match_id))
    .map(d => {
      const m = finishedById.get(d.match_id)!;
      const pointsUser = calcLivePoints(
        { homeScore: d.user_home_score, awayScore: d.user_away_score }, m.home_score, m.away_score
      ).pts;
      const pointsOracle = calcLivePoints(
        { homeScore: d.oracle_home_score, awayScore: d.oracle_away_score }, m.home_score, m.away_score
      ).pts;
      return { id: d.id as string, points_user: pointsUser, points_oracle: pointsOracle, resolved_at: new Date().toISOString() };
    });

  await Promise.all(updates.map(u =>
    sb.from("oracle_duels")
      .update({ points_user: u.points_user, points_oracle: u.points_oracle, resolved_at: u.resolved_at })
      .eq("id", u.id)
  ));
}

// ── Reads ──────────────────────────────────────────────────────────────

// Used by the Game Room invite card to show "already challenged" state for
// the next Oracle match. sbAdmin() because this is a server-side read with
// an already-verified userId, not an authenticated client (same convention
// as getUserOraclePicks in oracle.ts).
export async function getMyDuelForMatch(
  userId: string,
  matchId: string
): Promise<{ homeScore: number; awayScore: number } | null> {
  const { data } = await sbAdmin()
    .from("oracle_duels")
    .select("user_home_score, user_away_score")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .maybeSingle();
  return data ? { homeScore: data.user_home_score, awayScore: data.user_away_score } : null;
}

export interface OracleDuelHistoryItem {
  matchId: string;
  home: string;
  away: string;
  homeFlagCode: string | null;
  awayFlagCode: string | null;
  kickoffAt: string;
  userScore: { home: number; away: number };
  oracleScore: { home: number; away: number };
  actualScore: { home: number; away: number } | null;
  pointsUser: number | null;
  pointsOracle: number | null;
  resolved: boolean;
}

export interface OracleDuelNextChallenge {
  match: OracleMatchInfo;
  prediction: OraclePredictionRow;
  existing: { home: number; away: number; locked: boolean } | null;
}

export interface OracleDuelDashboard {
  // Null when nothing has resolved yet — distinct from a real 0-0 record.
  totals: { you: number; oracle: number } | null;
  nextChallenge: OracleDuelNextChallenge | null;
  history: OracleDuelHistoryItem[];
}

export async function getOracleDuelDashboard(userId: string): Promise<OracleDuelDashboard> {
  await resolveOracleDuels();
  const sb = sbAdmin();

  const nextMatch = await getNextOracleMatch();
  let nextChallenge: OracleDuelNextChallenge | null = null;
  if (nextMatch) {
    const existing = await getMyDuelForMatch(userId, nextMatch.match.id);
    nextChallenge = {
      match: nextMatch.match,
      prediction: nextMatch.prediction,
      existing: existing
        ? { home: existing.homeScore, away: existing.awayScore, locked: isMatchLocked(nextMatch.match.kickoffAt) }
        : null,
    };
  }

  const { data: rows } = await sb
    .from("oracle_duels")
    .select("match_id, user_home_score, user_away_score, oracle_home_score, oracle_away_score, points_user, points_oracle, resolved_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const allRows = (rows ?? []) as Array<{
    match_id: string; user_home_score: number; user_away_score: number;
    oracle_home_score: number; oracle_away_score: number;
    points_user: number | null; points_oracle: number | null;
    resolved_at: string | null; created_at: string;
  }>;

  const matchIds = allRows.map(r => r.match_id);
  const { data: matchRows } = matchIds.length
    ? await sb.from("matches").select("id, home, away, home_flag, away_flag, kickoff_at, home_score, away_score").in("id", matchIds)
    : { data: [] as never[] };
  const matchById = new Map(
    ((matchRows ?? []) as Array<{
      id: string; home: string; away: string; home_flag: string | null; away_flag: string | null;
      kickoff_at: string; home_score: number | null; away_score: number | null;
    }>).map(m => [m.id, m])
  );

  const history: OracleDuelHistoryItem[] = allRows.slice(0, 10).map(r => {
    const m = matchById.get(r.match_id);
    return {
      matchId: r.match_id,
      home: m?.home ?? "?",
      away: m?.away ?? "?",
      homeFlagCode: m?.home_flag ?? null,
      awayFlagCode: m?.away_flag ?? null,
      kickoffAt: m?.kickoff_at ?? "",
      userScore: { home: r.user_home_score, away: r.user_away_score },
      oracleScore: { home: r.oracle_home_score, away: r.oracle_away_score },
      actualScore: m?.home_score != null && m?.away_score != null ? { home: m.home_score, away: m.away_score } : null,
      pointsUser: r.points_user,
      pointsOracle: r.points_oracle,
      resolved: r.resolved_at != null,
    };
  });

  // Totals count every duel-predicted, resolved match (not just the last
  // 10 shown in history, and never anything from group_predictions).
  const resolvedRows = allRows.filter(r => r.points_user != null && r.points_oracle != null);
  const totals = resolvedRows.length
    ? {
        you: resolvedRows.reduce((s, r) => s + (r.points_user ?? 0), 0),
        oracle: resolvedRows.reduce((s, r) => s + (r.points_oracle ?? 0), 0),
      }
    : null;

  return { totals, nextChallenge, history };
}
