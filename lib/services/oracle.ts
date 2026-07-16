// Oracle predictions cron — generates AI pre-match predictions for World Cup
// knockout fixtures via the Anthropic API and caches them to Supabase.
//
// Plain fetch() to /v1/messages, no SDK dependency — same convention as
// league-football.ts's API-Football calls. Deliberately a separate service
// (and cron: app/api/oracle/route.ts) from the score/fixture pipelines —
// generation is a distinct concern with its own external dependency.
//
// Trigger guard: WC bracket rows for R32/R16/QF get home_team_id/away_team_id
// resolved once group standings settle, but SF/3rd/Final never do — those
// rows only ever get real team *names* (see migration history; verified live
// against the production matches table). Gating on home_team_id/away_team_id
// non-null would therefore permanently exclude semi-finals and the final, so
// eligibility instead checks the home/away text isn't a TBD bracket
// placeholder ("W(SF1)", "L(QF2)", etc.) — team context for the prompt is
// resolved by name, not by the FK.

import { sbAdmin } from "@/lib/supabase/admin";
import { sbAnon as sbPublic } from "@/lib/supabase/anon";
import { calcLivePoints } from "@/lib/services/predictions";

const ORACLE_MODEL = "claude-opus-4-8";

const KNOCKOUT_STAGES = ["R32", "R16", "QF", "SF", "3rd", "Final"];
const PLACEHOLDER_PATTERN = /[()]/; // matches "W(SF1)", "L(QF2)", etc.

const ORACLE_SYSTEM_PROMPT =
  `You are "The Oracle," a bold, confident football (soccer) prediction ` +
  `mascot for a World Cup 2026 fan app called Cup Clash. Given two teams' ` +
  `actual tournament results, predict the outcome of their upcoming ` +
  `knockout match. Ground every claim in the match history provided — ` +
  `never invent results, injuries, or stats not given to you. Keep the ` +
  `reasoning blurb punchy and fan-facing, not analytical jargon.`;

const PREDICTION_SCHEMA = {
  type: "object",
  properties: {
    predicted_home_score: { type: "integer" },
    predicted_away_score: { type: "integer" },
    predicted_winner: { type: "string", enum: ["home", "away", "draw"] },
    confidence_pct: { type: "integer" },
    reasoning_blurb: { type: "string" },
  },
  required: [
    "predicted_home_score",
    "predicted_away_score",
    "predicted_winner",
    "confidence_pct",
    "reasoning_blurb",
  ],
  additionalProperties: false,
};

interface EligibleMatch {
  id: string;
  home: string;
  away: string;
  stage: string;
  round_label: string | null;
  kickoff_at: string;
  stadium: string | null;
  city: string | null;
}

interface OraclePredictionOutput {
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: "home" | "away" | "draw";
  confidence_pct: number;
  reasoning_blurb: string;
}

function getSupabase() {
  return sbAdmin();
}

// ── Eligibility ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findEligibleMatches(sb: any): Promise<EligibleMatch[]> {
  const { data: existing } = await sb.from("oracle_predictions").select("match_id");
  const alreadyGenerated = new Set((existing ?? []).map((r: { match_id: string }) => r.match_id));

  const { data: matches, error } = await sb
    .from("matches")
    .select("id, home, away, stage, round_label, kickoff_at, stadium, city")
    .in("stage", KNOCKOUT_STAGES)
    .eq("status", "upcoming");
  if (error) throw error;

  return (matches ?? []).filter(
    (m: EligibleMatch) =>
      !alreadyGenerated.has(m.id) &&
      !PLACEHOLDER_PATTERN.test(m.home) &&
      !PLACEHOLDER_PATTERN.test(m.away)
  );
}

// ── Team context (resolved by name — see trigger-guard note above) ────────

interface FinishedMatchRow {
  home: string;
  away: string;
  stage: string;
  home_score: number | null;
  away_score: number | null;
  penalty_winner: string | null;
  kickoff_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function gatherTeamRecord(sb: any, teamName: string): Promise<string> {
  const cols = "home, away, stage, home_score, away_score, penalty_winner, kickoff_at";
  const [homeRes, awayRes] = await Promise.all([
    sb.from("matches").select(cols).eq("status", "finished").eq("home", teamName),
    sb.from("matches").select(cols).eq("status", "finished").eq("away", teamName),
  ]);

  const rows: FinishedMatchRow[] = [...(homeRes.data ?? []), ...(awayRes.data ?? [])].sort(
    (a, b) => a.kickoff_at.localeCompare(b.kickoff_at)
  );

  if (rows.length === 0) return `${teamName}: no completed matches on record this tournament.`;

  let wins = 0;
  const lines = rows.map((m) => {
    const isHome = m.home === teamName;
    const opponent = isHome ? m.away : m.home;
    const gf = isHome ? m.home_score : m.away_score;
    const ga = isHome ? m.away_score : m.home_score;
    let outcome = gf! > ga! ? "W" : gf! < ga! ? "L" : "D";
    if (m.penalty_winner) {
      const wonOnPens = m.penalty_winner === teamName;
      outcome += wonOnPens ? " (won on penalties)" : " (lost on penalties)";
      if (wonOnPens) wins++;
    } else if (gf! > ga!) {
      wins++;
    }
    return `${m.stage}: ${outcome} ${gf}-${ga} vs ${opponent}`;
  });

  return `${teamName} record this tournament (${wins}/${rows.length} wins): ${lines.join("; ")}`;
}

// ── Prompt + model call ────────────────────────────────────────────────

function buildPrompt(match: EligibleMatch, homeRecord: string, awayRecord: string): string {
  const venue = match.stadium ? `\nVenue: ${match.stadium}${match.city ? `, ${match.city}` : ""}` : "";
  const round = match.round_label ? ` (${match.round_label})` : "";
  return (
    `Upcoming World Cup 2026 knockout match:\n` +
    `${match.home} vs ${match.away}\n` +
    `Stage: ${match.stage}${round}\n` +
    `Kickoff: ${match.kickoff_at}${venue}\n\n` +
    `${homeRecord}\n\n` +
    `${awayRecord}\n\n` +
    `Predict the final score (regulation result — ignore extra time/penalties ` +
    `for the scoreline), the winner, and your confidence. Write a short ` +
    `(2-3 sentence) reasoning blurb grounded in each team's actual ` +
    `tournament form shown above, suitable for display to fans in a ` +
    `prediction app. Do not hedge excessively — give a real, specific pick.`
  );
}

async function callOracleModel(prompt: string): Promise<unknown> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ORACLE_MODEL,
      max_tokens: 1024,
      system: ORACLE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: { type: "json_schema", schema: PREDICTION_SCHEMA },
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Anthropic API HTTP ${res.status}: ${await res.text()}`);

  const data = await res.json();
  if (data.stop_reason === "refusal") throw new Error("Oracle model refused to generate a prediction");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textBlock = (data.content ?? []).find((b: any) => b.type === "text");
  if (!textBlock) throw new Error("Oracle model returned no text content");
  return JSON.parse(textBlock.text);
}

function validatePrediction(raw: unknown): OraclePredictionOutput {
  const r = raw as Record<string, unknown>;
  const home = Math.max(0, Math.round(Number(r.predicted_home_score)));
  const away = Math.max(0, Math.round(Number(r.predicted_away_score)));
  const confidence = Math.min(100, Math.max(0, Math.round(Number(r.confidence_pct))));
  const blurb = typeof r.reasoning_blurb === "string" ? r.reasoning_blurb.trim() : "";

  if (!Number.isFinite(home) || !Number.isFinite(away) || !Number.isFinite(confidence)) {
    throw new Error("Oracle returned non-numeric prediction fields");
  }
  if (!blurb) throw new Error("Oracle returned an empty reasoning blurb");

  const winner =
    r.predicted_winner === "home" || r.predicted_winner === "away" || r.predicted_winner === "draw"
      ? r.predicted_winner
      : home === away
        ? "draw"
        : home > away
          ? "home"
          : "away";

  return {
    predicted_home_score: home,
    predicted_away_score: away,
    predicted_winner: winner,
    confidence_pct: confidence,
    reasoning_blurb: blurb,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveOraclePrediction(sb: any, matchId: string, prediction: OraclePredictionOutput) {
  const { error } = await sb.from("oracle_predictions").upsert(
    {
      match_id: matchId,
      predicted_home_score: prediction.predicted_home_score,
      predicted_away_score: prediction.predicted_away_score,
      predicted_winner: prediction.predicted_winner,
      confidence_pct: prediction.confidence_pct,
      reasoning_blurb: prediction.reasoning_blurb,
      model: ORACLE_MODEL,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "match_id" }
  );
  if (error) throw error;
}

// ── Entry point ─────────────────────────────────────────────────────────

export interface OracleCronResult {
  eligibleMatches: number;
  generated: number;
  errors: Array<{ matchId: string; error: string }>;
}

export async function runOracleCron(): Promise<OracleCronResult> {
  const sb = getSupabase();
  const eligible = await findEligibleMatches(sb);
  const result: OracleCronResult = { eligibleMatches: eligible.length, generated: 0, errors: [] };

  for (const match of eligible) {
    try {
      const [homeRecord, awayRecord] = await Promise.all([
        gatherTeamRecord(sb, match.home),
        gatherTeamRecord(sb, match.away),
      ]);
      const prompt = buildPrompt(match, homeRecord, awayRecord);
      const prediction = validatePrediction(await callOracleModel(prompt));
      await saveOraclePrediction(sb, match.id, prediction);
      result.generated++;
    } catch (err) {
      result.errors.push({
        matchId: match.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

// ── Public reads (Home teaser + Game Room) ───────────────────────────────

export interface OraclePredictionRow {
  id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: "home" | "away" | "draw";
  confidence_pct: number;
  reasoning_blurb: string;
  model: string;
  generated_at: string;
}

export interface OracleMatchInfo {
  id: string;
  home: string;
  away: string;
  homeFlagCode: string | null;
  awayFlagCode: string | null;
  kickoffAt: string;
  stage: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeScoreET: number | null;
  awayScoreET: number | null;
}

export interface OracleMatchPrediction {
  match: OracleMatchInfo;
  prediction: OraclePredictionRow;
}

const ORACLE_MATCH_COLS =
  "id, home, away, home_flag, away_flag, kickoff_at, stage, status, home_score, away_score, home_score_et, away_score_et";

interface OracleMatchRow {
  id: string; home: string; away: string;
  home_flag: string | null; away_flag: string | null;
  kickoff_at: string; stage: string; status: string;
  home_score: number | null; away_score: number | null;
  home_score_et: number | null; away_score_et: number | null;
}

function toMatchInfo(m: OracleMatchRow): OracleMatchInfo {
  return {
    id: m.id, home: m.home, away: m.away,
    homeFlagCode: m.home_flag, awayFlagCode: m.away_flag,
    kickoffAt: m.kickoff_at, stage: m.stage, status: m.status,
    homeScore: m.home_score, awayScore: m.away_score,
    homeScoreET: m.home_score_et, awayScoreET: m.away_score_et,
  };
}

// Next upcoming match the Oracle has actually predicted — deliberately NOT
// simply getNextMatch() from matches.ts, since that resolves to the soonest
// kickoff overall and can land on a still-unresolved bracket placeholder
// (e.g. the 3rd-place match while its teams are still "L(SF1)"/"L(SF2)")
// that the Oracle's own eligibility gate deliberately excludes. Small table
// (knockout matches only), so two simple queries + an in-memory join beats
// a cross-table order-by.
export async function getNextOracleMatch(): Promise<OracleMatchPrediction | null> {
  const sb = sbPublic();
  const { data: predictions } = await sb
    .from("oracle_predictions")
    .select("id, match_id, predicted_home_score, predicted_away_score, predicted_winner, confidence_pct, reasoning_blurb, model, generated_at");
  if (!predictions?.length) return null;

  const { data: matches } = await sb
    .from("matches")
    .select(ORACLE_MATCH_COLS)
    .in("id", predictions.map((p: { match_id: string }) => p.match_id))
    .eq("status", "upcoming")
    .order("kickoff_at", { ascending: true })
    .limit(1);
  if (!matches?.length) return null;

  const match = matches[0] as OracleMatchRow;
  const prediction = (predictions as OraclePredictionRow[]).find(p => p.match_id === match.id);
  if (!prediction) return null;

  return { match: toMatchInfo(match), prediction };
}

// Every match the Oracle has predicted (any status), soonest kickoff first —
// backs the Game Room section, which reveals predictions for upcoming
// matches and "who was closer" once a match finishes.
export async function getAllOracleMatches(): Promise<OracleMatchPrediction[]> {
  const sb = sbPublic();
  const { data: predictions } = await sb
    .from("oracle_predictions")
    .select("id, match_id, predicted_home_score, predicted_away_score, predicted_winner, confidence_pct, reasoning_blurb, model, generated_at");
  if (!predictions?.length) return [];

  const { data: matches } = await sb
    .from("matches")
    .select(ORACLE_MATCH_COLS)
    .in("id", predictions.map((p: { match_id: string }) => p.match_id))
    .order("kickoff_at", { ascending: true });
  if (!matches?.length) return [];

  const predictionByMatchId = new Map((predictions as OraclePredictionRow[]).map(p => [p.match_id, p]));
  return (matches as OracleMatchRow[])
    .map(m => {
      const prediction = predictionByMatchId.get(m.id);
      return prediction ? { match: toMatchInfo(m), prediction } : null;
    })
    .filter((row): row is OracleMatchPrediction => row !== null);
}

// ── Crowd agreement (global stats per match) ─────────────────────────────

export interface OracleAgreementStats {
  agree: number;
  disagree: number;
  total: number;
}

function outcomeOf(home: number, away: number): "home" | "away" | "draw" {
  return home > away ? "home" : home < away ? "away" : "draw";
}

// Counts, per match, how many submitted group_predictions rows share the
// Oracle's predicted winner direction (not exact score) vs. don't. Global —
// every group's predictions count, not just the viewer's own group, per the
// Step 3 spec ("simple query against the existing group_predictions table").
export async function getOracleAgreementStats(
  matchIds: string[],
  predictionByMatchId: Map<string, OraclePredictionRow>
): Promise<Map<string, OracleAgreementStats>> {
  const stats = new Map<string, OracleAgreementStats>();
  if (!matchIds.length) return stats;

  const { data } = await sbAdmin()
    .from("group_predictions")
    .select("match_id, home_score, away_score")
    .in("match_id", matchIds);

  for (const row of (data ?? []) as Array<{ match_id: string; home_score: number; away_score: number }>) {
    const prediction = predictionByMatchId.get(row.match_id);
    if (!prediction) continue;
    const entry = stats.get(row.match_id) ?? { agree: 0, disagree: 0, total: 0 };
    entry.total++;
    if (outcomeOf(row.home_score, row.away_score) === prediction.predicted_winner) entry.agree++;
    else entry.disagree++;
    stats.set(row.match_id, entry);
  }
  return stats;
}

// ── "Who was closer" — user vs Oracle, once a match is finished ─────────
// Reuses calcLivePoints's exact/outcome/none tiering (same categorical
// closeness definition scoring already uses) rather than inventing a new
// numeric distance metric this codebase doesn't otherwise use.

const CLOSENESS_TIER: Record<"exact" | "outcome" | "none", number> = { exact: 2, outcome: 1, none: 0 };

export type CloserResult = "user" | "oracle" | "tie";

export function compareCloseness(
  userPrediction: { homeScore: number; awayScore: number },
  oraclePrediction: { homeScore: number; awayScore: number },
  actualHome: number,
  actualAway: number
): CloserResult {
  const userTier = CLOSENESS_TIER[calcLivePoints(userPrediction, actualHome, actualAway).type];
  const oracleTier = CLOSENESS_TIER[calcLivePoints(oraclePrediction, actualHome, actualAway).type];
  if (userTier > oracleTier) return "user";
  if (oracleTier > userTier) return "oracle";
  return "tie";
}

// A finished match's effective actual score — ET score if the match went to
// extra time, else the 90-minute score. Mirrors getAllMatches()'s convention
// in matches.ts (a penalty shootout never changes the scoreline used for
// grading, only bracket advancement).
export function effectiveScore(match: OracleMatchInfo): { home: number; away: number } | null {
  const home = match.homeScoreET ?? match.homeScore;
  const away = match.awayScoreET ?? match.awayScore;
  if (home == null || away == null) return null;
  return { home, away };
}

// Current user's own group_predictions rows for a set of matches, scoped to
// one group (their primary group — same "first group" convention the Home
// page already uses for rank/streak). Uses sbAdmin() because RLS on
// group_predictions requires an authenticated session's auth.uid(), which
// server-side reads via sbAnon()/sbAdmin() don't carry — callers must have
// already verified `userId` via an authenticated session before calling.
export async function getUserOraclePicks(
  userId: string,
  groupId: string,
  matchIds: string[]
): Promise<Map<string, { homeScore: number; awayScore: number }>> {
  const picks = new Map<string, { homeScore: number; awayScore: number }>();
  if (!matchIds.length) return picks;

  const { data } = await sbAdmin()
    .from("group_predictions")
    .select("match_id, home_score, away_score")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .in("match_id", matchIds);

  for (const row of (data ?? []) as Array<{ match_id: string; home_score: number; away_score: number }>) {
    picks.set(row.match_id, { homeScore: row.home_score, awayScore: row.away_score });
  }
  return picks;
}

// ── Game Room section data ────────────────────────────────────────────────

export interface OracleGameCard {
  match: OracleMatchInfo;
  prediction: OraclePredictionRow;
  stats: OracleAgreementStats;
  userPick: { homeScore: number; awayScore: number } | null;
  // null: match hasn't finished yet, nothing to compare. "no_pick": finished
  // but the user never predicted it. Otherwise who was closer.
  closer: CloserResult | "no_pick" | null;
}

export interface OracleGameRoomData {
  cards: OracleGameCard[];
  // null when the user is anonymous or has no finished, self-predicted
  // matches yet to tally — distinct from a real 0-0 record.
  record: { you: number; oracle: number } | null;
}

export async function getOracleGameRoomData(
  userId: string | null,
  groupId: string | null
): Promise<OracleGameRoomData> {
  const matches = await getAllOracleMatches();
  if (!matches.length) return { cards: [], record: null };

  const matchIds = matches.map(m => m.match.id);
  const predictionByMatchId = new Map(matches.map(m => [m.match.id, m.prediction]));

  const [statsByMatchId, userPicks] = await Promise.all([
    getOracleAgreementStats(matchIds, predictionByMatchId),
    userId && groupId
      ? getUserOraclePicks(userId, groupId, matchIds)
      : Promise.resolve(new Map<string, { homeScore: number; awayScore: number }>()),
  ]);

  let recordYou = 0;
  let recordOracle = 0;
  let hasComparableMatch = false;

  const cards: OracleGameCard[] = matches.map(({ match, prediction }) => {
    const stats = statsByMatchId.get(match.id) ?? { agree: 0, disagree: 0, total: 0 };
    const userPick = userPicks.get(match.id) ?? null;

    let closer: OracleGameCard["closer"] = null;
    if (match.status === "finished") {
      const actual = effectiveScore(match);
      if (actual) {
        if (userPick) {
          closer = compareCloseness(
            userPick,
            { homeScore: prediction.predicted_home_score, awayScore: prediction.predicted_away_score },
            actual.home, actual.away
          );
          hasComparableMatch = true;
          if (closer === "user") recordYou++;
          if (closer === "oracle") recordOracle++;
        } else {
          closer = "no_pick";
        }
      }
    }

    return { match, prediction, stats, userPick, closer };
  });

  return { cards, record: userId && hasComparableMatch ? { you: recordYou, oracle: recordOracle } : null };
}
