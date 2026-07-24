// Match recap cron — generates short, factual recap paragraphs for finished
// matches via the Anthropic API and caches them to Supabase. Same fetch/
// structured-output convention as the Oracle (lib/services/oracle.ts,
// migration 057), but a distinct feature/table (migration 073) — a recap
// summarizes what already happened, grounded only in matches.match_events,
// it never predicts or speculates.
//
// Model deliberately NOT the Oracle's claude-opus-4-8: a recap is closed-book
// summarization of data already fully specified in the prompt (no predictive
// reasoning needed), so a cheaper/faster model is the right fit.

import { sbAdmin } from "@/lib/supabase/admin";
import type { MatchEventEntry } from "@/lib/services/match-events";

const RECAP_MODEL = "claude-haiku-4-5";

// Same goal-family grouping app/api/reminders/match-events-reconcile/route.ts
// uses — everything else considered a "card" for recap purposes. Subs are
// deliberately excluded from the recap: the feature is scoped to goals,
// cards, and the final score, not a full substitution log.
const GOAL_TYPES = new Set(["goal", "own_goal", "penalty", "missed_penalty"]);
const CARD_TYPES = new Set(["yellow_card", "red_card"]);

const RECAP_SYSTEM_PROMPT =
  `You are a factual football (soccer) match-recap writer for a fan app ` +
  `called Cup Clash. Given a finished match's final score and its recorded ` +
  `goal and card events, write a short, neutral recap paragraph. Ground ` +
  `every sentence in the data provided — never invent scorers, minutes, ` +
  `cards, injuries, tactics, or context not given to you. Do not speculate ` +
  `about causes, quality of play, or implications. If no goal or card ` +
  `events are provided, describe only the final score.`;

const RECAP_SCHEMA = {
  type: "object",
  properties: {
    recap_text: { type: "string" },
  },
  required: ["recap_text"],
  additionalProperties: false,
};

interface EligibleMatch {
  id: string;
  home: string;
  away: string;
  stage: string;
  round_label: string | null;
  home_score: number | null;
  away_score: number | null;
  home_score_et: number | null;
  away_score_et: number | null;
  penalty_winner: string | null;
  match_events: MatchEventEntry[];
}

function getSupabase() {
  return sbAdmin();
}

// ── Eligibility ─────────────────────────────────────────────────────────
// finished + match_events non-null + no recap generated yet. Matches with
// match_events === null are skipped outright — no thin "final score only"
// fallback is generated for them (deliberate scope decision, see PR notes).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findEligibleMatches(sb: any): Promise<EligibleMatch[]> {
  const { data: existing } = await sb.from("match_recaps").select("match_id");
  const alreadyGenerated = new Set((existing ?? []).map((r: { match_id: string }) => r.match_id));

  const { data: matches, error } = await sb
    .from("matches")
    .select("id, home, away, stage, round_label, home_score, away_score, home_score_et, away_score_et, penalty_winner, match_events")
    .eq("status", "finished")
    .not("match_events", "is", null);
  if (error) throw error;

  return ((matches ?? []) as EligibleMatch[]).filter(m => !alreadyGenerated.has(m.id));
}

// ── Prompt + model call ────────────────────────────────────────────────

function effectiveScore(match: EligibleMatch): { home: number; away: number } | null {
  const home = match.home_score_et ?? match.home_score;
  const away = match.away_score_et ?? match.away_score;
  if (home == null || away == null) return null;
  return { home, away };
}

function eventLine(e: MatchEventEntry): string {
  const minute = `${e.minute}${e.extra ? `+${e.extra}` : ""}'`;
  switch (e.type) {
    case "goal":            return `${minute} Goal — ${e.player ?? "Unknown"} (${e.team})${e.assist ? `, assist: ${e.assist}` : ""}`;
    case "own_goal":        return `${minute} Own goal — ${e.player ?? "Unknown"} (${e.team})`;
    case "penalty":         return `${minute} Penalty scored — ${e.player ?? "Unknown"} (${e.team})`;
    case "missed_penalty":  return `${minute} Penalty missed — ${e.player ?? "Unknown"} (${e.team})`;
    case "yellow_card":     return `${minute} Yellow card — ${e.player ?? "Unknown"} (${e.team})`;
    case "red_card":        return `${minute} Red card — ${e.player ?? "Unknown"} (${e.team})`;
    default:                return `${minute} ${e.type} — ${e.player ?? "Unknown"} (${e.team})`;
  }
}

function buildPrompt(match: EligibleMatch): string {
  const round = match.round_label ? ` (${match.round_label})` : "";
  const score = effectiveScore(match);
  const scoreLine = score
    ? `Final score: ${match.home} ${score.home}-${score.away} ${match.away}` +
      (match.penalty_winner ? ` (${match.penalty_winner} won on penalties)` : "")
    : `Final score: not available`;

  const relevant = match.match_events.filter(e => GOAL_TYPES.has(e.type) || CARD_TYPES.has(e.type));
  const eventsBlock = relevant.length > 0
    ? relevant.map(eventLine).join("\n")
    : "No goals or cards were recorded.";

  // Precomputed exact counts, handed to the model rather than left for it to
  // tally itself — verified live against a 9-yellow-card match where the
  // model undercounted to "eight" despite every card being individually
  // listed above. Counting list items is a known LLM weak spot distinct from
  // inventing facts, so the fix is to never make it count at all.
  const goalCount = match.match_events.filter(e => GOAL_TYPES.has(e.type)).length;
  const yellowCount = match.match_events.filter(e => e.type === "yellow_card").length;
  const redCount = match.match_events.filter(e => e.type === "red_card").length;
  const totalsLine = `Totals — goals/goal-type events: ${goalCount}, yellow cards: ${yellowCount}, red cards: ${redCount}.`;

  return (
    `Finished match: ${match.home} vs ${match.away}\n` +
    `Stage: ${match.stage}${round}\n` +
    `${scoreLine}\n\n` +
    `Recorded events (chronological):\n${eventsBlock}\n\n` +
    `${totalsLine} If you state any count of goals or cards in your ` +
    `summary, it must exactly match these totals — do not tally the list ` +
    `above yourself.\n\n` +
    `Write a factual recap paragraph (2-4 sentences, roughly 40-70 words) ` +
    `summarizing the goals and cards above in chronological order, ending ` +
    `with the final score. Do not add analysis, opinion, or speculation ` +
    `beyond what's listed above.`
  );
}

async function callRecapModel(prompt: string): Promise<unknown> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: RECAP_MODEL,
      max_tokens: 400,
      system: RECAP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: { type: "json_schema", schema: RECAP_SCHEMA },
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Anthropic API HTTP ${res.status}: ${await res.text()}`);

  const data = await res.json();
  if (data.stop_reason === "refusal") throw new Error("Recap model refused to generate a recap");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textBlock = (data.content ?? []).find((b: any) => b.type === "text");
  if (!textBlock) throw new Error("Recap model returned no text content");
  return JSON.parse(textBlock.text);
}

function validateRecap(raw: unknown): string {
  const r = raw as Record<string, unknown>;
  const text = typeof r.recap_text === "string" ? r.recap_text.trim() : "";
  if (!text) throw new Error("Recap model returned an empty recap_text");
  return text;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveRecap(sb: any, matchId: string, recapText: string) {
  const { error } = await sb.from("match_recaps").upsert(
    {
      match_id: matchId,
      recap_text: recapText,
      model: RECAP_MODEL,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "match_id" }
  );
  if (error) throw error;
}

// ── Entry point ─────────────────────────────────────────────────────────

export interface RecapCronResult {
  eligibleMatches: number;
  generated: number;
  errors: Array<{ matchId: string; error: string }>;
}

export async function runRecapCron(): Promise<RecapCronResult> {
  const sb = getSupabase();
  const eligible = await findEligibleMatches(sb);
  const result: RecapCronResult = { eligibleMatches: eligible.length, generated: 0, errors: [] };

  for (const match of eligible) {
    try {
      const prompt = buildPrompt(match);
      const recapText = validateRecap(await callRecapModel(prompt));
      await saveRecap(sb, match.id, recapText);
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

// ── Public read (Match Center Overview tab) ──────────────────────────────

export async function getMatchRecap(matchId: string): Promise<string | null> {
  const sb = sbAdmin();
  const { data } = await sb
    .from("match_recaps")
    .select("recap_text")
    .eq("match_id", matchId)
    .maybeSingle();
  return (data as { recap_text: string } | null)?.recap_text ?? null;
}
