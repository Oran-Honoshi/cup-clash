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
