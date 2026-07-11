// Live scores cron — fetches from API-Football, caches to Supabase,
// updates matches table, and triggers point scoring for finished matches.

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { scoreMatchResult } from "@/lib/services/predictions";
import type { ScoringRules } from "@/lib/types";
import {
  queueTelegramLine,
  flushTelegramQueue,
  getTelegramFollowersForTeam,
  isTelegramPrefEnabled,
  telegramTranslations,
  type TelegramQueue,
} from "@/lib/services/telegram";
import { getMembers } from "@/lib/services/groups";
import { interpolate } from "@/lib/i18n";

const API_BASE      = "https://v3.football.api-sports.io";
const LEAGUE_ID     = 1;     // FIFA World Cup
const SEASON        = 2026;
const POLL_INTERVAL  = 4 * 60 * 1000; // 4 min — ensures a 5-min cron always passes the guard
const THIRTY_MIN_MS  = 30 * 60 * 1000;
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const FOUR_HOURS_MS  = 4 * 60 * 60 * 1000;

const LIVE_STATUSES     = new Set(["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

// API-Football name → our seed name (all lowercase for comparison)
const TEAM_ALIASES: Record<string, string> = {
  "turkey":                        "türkiye",
  "ivory coast":                   "côte d'ivoire",
  "bosnia":                        "bosnia & herzegovina",
  "south korea":                   "korea republic",
  "czech republic":                "czechia",
  "united states":                 "usa",
  "curacao":                       "curaçao",
  "iran":                          "ir iran",
  "bosnia and herzegovina":        "bosnia & herzegovina",
  "bosnia-herzegovina":            "bosnia & herzegovina",
  "cape verde":                    "cabo verde",
  "cape verde islands":            "cabo verde",
  "dr congo":                      "congo dr",
  "democratic republic of congo":  "congo dr",
};

function normTeam(name: string): string {
  const l = name.toLowerCase().trim().replace(/['']/g, "'");
  return TEAM_ALIASES[l] ?? l;
}

function apiHeaders(): Record<string, string> {
  return { "x-apisports-key": process.env.API_FOOTBALL_KEY! };
}

function getSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[scores] CRITICAL: SUPABASE_SERVICE_ROLE_KEY not set — upserts will likely fail RLS");
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

// ── Scoring rules helpers (mirrored from admin/override-score) ─────────────

const SCORING_RULES_SELECT = [
  "group_id",
  "exact_score", "correct_outcome",
  "gs_exact_score", "gs_correct_outcome",
  "r32_exact_score", "r32_correct_outcome",
  "r16_exact_score", "r16_correct_outcome",
  "qf_exact_score", "qf_correct_outcome",
  "sf_exact_score", "sf_correct_outcome",
  "third_exact_score", "third_correct_outcome",
  "final_exact_score", "final_correct_outcome",
  "use_progressive_scoring",
  "knockout_policy",
].join(", ");

type ScoringRulesRow = {
  group_id: string;
  exact_score: number; correct_outcome: number;
  gs_exact_score: number; gs_correct_outcome: number;
  r32_exact_score: number; r32_correct_outcome: number;
  r16_exact_score: number; r16_correct_outcome: number;
  qf_exact_score: number; qf_correct_outcome: number;
  sf_exact_score: number; sf_correct_outcome: number;
  third_exact_score: number; third_correct_outcome: number;
  final_exact_score: number; final_correct_outcome: number;
  use_progressive_scoring: boolean;
  knockout_policy: string | null;
};

function buildScoringRules(r: ScoringRulesRow | null): ScoringRules {
  const kp = r?.knockout_policy;
  return {
    exactScore:            r?.exact_score            ?? 25,
    correctOutcome:        r?.correct_outcome        ?? 10,
    gsExactScore:          r?.gs_exact_score         ?? 25,
    gsCorrectOutcome:      r?.gs_correct_outcome     ?? 10,
    r32ExactScore:         r?.r32_exact_score        ?? 25,
    r32CorrectOutcome:     r?.r32_correct_outcome    ?? 10,
    r16ExactScore:         r?.r16_exact_score        ?? 25,
    r16CorrectOutcome:     r?.r16_correct_outcome    ?? 10,
    qfExactScore:          r?.qf_exact_score         ?? 25,
    qfCorrectOutcome:      r?.qf_correct_outcome     ?? 10,
    sfExactScore:          r?.sf_exact_score         ?? 25,
    sfCorrectOutcome:      r?.sf_correct_outcome     ?? 10,
    thirdExactScore:       r?.third_exact_score      ?? 25,
    thirdCorrectOutcome:   r?.third_correct_outcome  ?? 10,
    finalExactScore:       r?.final_exact_score      ?? 25,
    finalCorrectOutcome:   r?.final_correct_outcome  ?? 10,
    useProgressiveScoring: Boolean(r?.use_progressive_scoring),
    knockoutPolicy:        (kp === 'inc_extra_time' || kp === 'to_qualify') ? kp : 'regular_90',
  };
}

// ── Tournament scorer / assister tracking ─────────────────────────────────────

// Normalise a player name for fuzzy matching:
// - strips accents (Mbappé → mbappe)
// - lowercases
// - collapses whitespace
function normName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns true when a user's pick string matches a canonical player name.
// Handles abbreviated first names: "L. Messi" ↔ "Lionel Messi".
function playerNamesMatch(pick: string, canonical: string): boolean {
  const p = normName(pick);
  const c = normName(canonical);
  if (p === c) return true;

  // "L. Messi" style: first token is a single letter followed by a dot
  const pp = p.split(" ");
  const cp = c.split(" ");
  if (pp.length >= 2 && /^[a-z]\.$/.test(pp[0]) && cp.length >= 2) {
    const initial  = pp[0].replace(".", "");
    const lastName = pp.slice(1).join(" ");
    if (initial === cp[0][0] && lastName === cp.slice(1).join(" ")) return true;
  }
  // Reverse: canonical is abbreviated, pick is full (less common but handle it)
  if (cp.length >= 2 && /^[a-z]\.$/.test(cp[0]) && pp.length >= 2) {
    const initial  = cp[0].replace(".", "");
    const lastName = cp.slice(1).join(" ");
    if (initial === pp[0][0] && lastName === pp.slice(1).join(" ")) return true;
  }
  return false;
}

interface GoalEntry {
  player_id:   number | null;
  player_name: string | null;
  assist_id:   number | null;
  assist_name: string | null;
  detail:      string; // "Normal Goal" | "Penalty" | "Own Goal" | "Missed Penalty"
  team_name:   string | null;
}

// Reads all finished live_scores, builds goal/assist tallies, upserts into
// player_tournament_stats, then awards / resets points for top_scorer and
// top_assister predictions across all groups.
async function updateTournamentScorerPoints(sb: SupabaseClient): Promise<void> {
  console.log("[scores/cron] STEP 5: Updating tournament scorer/assister points...");

  // ── 1. Aggregate from ALL finished live_scores ───────────────────────────

  const { data: finishedRows, error: fetchErr } = await sb
    .from("live_scores")
    .select("raw_data")
    .in("status", ["FT", "AET", "PEN", "AWD", "WO"]);

  if (fetchErr) {
    console.error("[scores/cron]   live_scores fetch error:", fetchErr);
    return;
  }

  // api_player_id → { name, team, goals, assists }
  type Tally = { name: string; team: string; goals: number; assists: number };
  const tally = new Map<number, Tally>();

  for (const row of finishedRows ?? []) {
    const goals = ((row.raw_data as Record<string, unknown>)?.goals ?? []) as GoalEntry[];
    for (const g of goals) {
      // Own goals don't count for golden boot; missed penalties never went in the net —
      // API-Football tags both under the "Goal" event type, so `detail` is the only signal.
      if (g.detail === "Own Goal" || g.detail === "Missed Penalty") continue;
      if (g.player_id && g.player_name) {
        const curr = tally.get(g.player_id) ?? { name: g.player_name, team: g.team_name ?? "", goals: 0, assists: 0 };
        tally.set(g.player_id, { ...curr, goals: curr.goals + 1 });
      }
      if (g.assist_id && g.assist_name) {
        const curr = tally.get(g.assist_id) ?? { name: g.assist_name, team: g.team_name ?? "", goals: 0, assists: 0 };
        tally.set(g.assist_id, { ...curr, assists: curr.assists + 1 });
      }
    }
  }

  console.log(`[scores/cron]   Players with goals/assists: ${tally.size}`);
  if (tally.size === 0) {
    console.log("[scores/cron]   No goal data yet — skipping tournament scoring");
    return;
  }

  // ── 2. Enrich with full names from players table ─────────────────────────

  const allIds = [...tally.keys()];
  const { data: playerRows } = await sb
    .from("players")
    .select("full_name, api_player_id")
    .in("api_player_id", allIds);

  const apiIdToFullName = new Map<number, string>(
    ((playerRows ?? []) as Array<{ full_name: string; api_player_id: number }>)
      .map(p => [p.api_player_id, p.full_name])
  );

  // ── 3. Upsert player_tournament_stats ────────────────────────────────────
  // player_name is normalized to the canonical players.full_name spelling when
  // known, rather than whichever raw API spelling happened to tally last
  // (API-Football is inconsistent about accents/abbreviation across events —
  // e.g. "K. Mbappe" vs "Kylian Mbappé" — even though api_player_id stays the
  // same, so this keeps the stored name durably consistent too).

  const statsRows = allIds.map(id => {
    const t = tally.get(id)!;
    const canonicalName = apiIdToFullName.get(id) ?? null;
    return {
      api_player_id: id,
      player_name:   canonicalName ?? t.name,
      full_name:     canonicalName,
      team_name:     t.team,
      goals:         t.goals,
      assists:       t.assists,
      updated_at:    new Date().toISOString(),
    };
  });

  const { error: statsErr } = await sb
    .from("player_tournament_stats")
    .upsert(statsRows, { onConflict: "api_player_id" });

  if (statsErr) {
    console.error("[scores/cron]   player_tournament_stats upsert error:", statsErr);
  } else {
    console.log(`[scores/cron]   player_tournament_stats: ${statsRows.length} player(s) upserted`);
  }

  // ── 4. Gate on Final being finished ──────────────────────────────────────
  // Points for top_scorer / top_assister are only awarded once the Final is
  // over — we never award mid-tournament leads.

  const { data: finalMatch } = await sb
    .from("matches")
    .select("id, status")
    .eq("stage", "Final")
    .maybeSingle();

  const finalFinished = finalMatch?.status === "finished";

  if (!finalFinished) {
    console.log("[scores/cron]   Final not yet finished — skipping top_scorer/top_assister point awards");
    return;
  }

  console.log("[scores/cron]   Final is finished — proceeding with top_scorer/top_assister scoring");

  // ── 5. Determine tournament winners ───────────────────────────────────────

  const maxGoals   = Math.max(...Array.from(tally.values()).map(v => v.goals),   0);
  const maxAssists = Math.max(...Array.from(tally.values()).map(v => v.assists), 0);

  // All players tied at the top share the award during the tournament
  const leadingScorerNames = maxGoals > 0
    ? [...tally].filter(([, v]) => v.goals   === maxGoals  ).map(([id]) => apiIdToFullName.get(id) ?? tally.get(id)!.name)
    : [];
  const leadingAssisterNames = maxAssists > 0
    ? [...tally].filter(([, v]) => v.assists === maxAssists).map(([id]) => apiIdToFullName.get(id) ?? tally.get(id)!.name)
    : [];

  console.log(`[scores/cron]   Top scorer(s): ${leadingScorerNames.join(", ")} (${maxGoals}g)`);
  console.log(`[scores/cron]   Top assister(s): ${leadingAssisterNames.join(", ")} (${maxAssists}a)`);

  // ── 6. Score top_scorer / top_assister predictions ───────────────────────

  const [{ data: preds }, { data: rulesRows }] = await Promise.all([
    sb.from("group_predictions")
      .select("id, group_id, pred_type, pred_value, points_earned")
      .in("pred_type", ["top_scorer", "top_assister"]),
    sb.from("scoring_rules")
      .select("group_id, top_scorer, top_assister, enable_scorer, enable_assister"),
  ]);

  type RulesRow = {
    group_id: string;
    top_scorer: number;
    top_assister: number;
    enable_scorer: boolean | null;
    enable_assister: boolean | null;
  };
  type PredRow = {
    id: string;
    group_id: string;
    pred_type: string;
    pred_value: string | null;
    points_earned: number;
  };

  const rulesMap = new Map<string, RulesRow>(
    ((rulesRows ?? []) as unknown as RulesRow[]).map(r => [r.group_id, r])
  );

  const toUpdate: Array<{ id: string; points_earned: number }> = [];

  for (const pred of ((preds ?? []) as unknown as PredRow[])) {
    const rules = rulesMap.get(pred.group_id);
    const val   = pred.pred_value ?? "";
    let pts = 0;

    if (pred.pred_type === "top_scorer" && rules?.enable_scorer !== false) {
      if (leadingScorerNames.some(n => playerNamesMatch(val, n))) {
        pts = rules?.top_scorer ?? 50;
      }
    } else if (pred.pred_type === "top_assister" && rules?.enable_assister !== false) {
      if (leadingAssisterNames.some(n => playerNamesMatch(val, n))) {
        pts = rules?.top_assister ?? 50;
      }
    }

    if (pts !== pred.points_earned) {
      toUpdate.push({ id: pred.id, points_earned: pts });
    }
  }

  console.log(`[scores/cron]   Tournament pick point changes: ${toUpdate.length}`);

  if (toUpdate.length > 0) {
    await Promise.allSettled(
      toUpdate.map(u =>
        sb.from("group_predictions")
          .update({ points_earned: u.points_earned })
          .eq("id", u.id)
      )
    );
    console.log(`[scores/cron]   Updated ${toUpdate.length} tournament pick(s)`);
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface APIFixture {
  fixture: {
    id:        number;
    date:      string;
    timezone:  string;
    status: {
      long:    string;
      short:   string;
      elapsed: number | null;
      extra:   number | null;
    };
    venue: { id: number | null; name: string | null; city: string | null };
  };
  league: {
    id:     number;
    name:   string;
    season: number;
    round:  string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime:  { home: number | null; away: number | null };
    fulltime:  { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty:   { home: number | null; away: number | null };
  };
}

interface APIEvent {
  time:   { elapsed: number; extra: number | null };
  team:   { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type:   "Goal" | "Card" | "subst" | "Var";
  detail: string;
  comments: string | null;
}

interface ParsedGoal {
  minute:      number;
  extra:       number | null;
  team_id:     number;
  team_name:   string;
  player_id:   number | null;
  player_name: string | null;
  assist_id:   number | null;
  assist_name: string | null;
  detail:      string;
}

interface ParsedCard {
  minute:      number;
  extra:       number | null;
  team_id:     number;
  team_name:   string;
  player_id:   number | null;
  player_name: string | null;
  detail:      string;
}

interface ParsedSub {
  minute:       number;
  extra:        number | null;
  team_id:      number;
  team_name:    string;
  player_in_id:   number | null;
  player_in_name: string | null;
  player_out_id:   number | null;
  player_out_name: string | null;
}

async function fetchEvents(fixtureId: number): Promise<APIEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/fixtures/events?fixture=${fixtureId}`, {
      headers: apiHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json() as { response: APIEvent[] };
    return data.response ?? [];
  } catch {
    return [];
  }
}

function parseEvents(events: APIEvent[]): { goals: ParsedGoal[]; cards: ParsedCard[]; subs: ParsedSub[] } {
  const goals: ParsedGoal[] = [];
  const cards: ParsedCard[] = [];
  const subs:  ParsedSub[]  = [];

  for (const e of events) {
    if (e.type === "Goal") {
      goals.push({
        minute:      e.time.elapsed,
        extra:       e.time.extra,
        team_id:     e.team.id,
        team_name:   e.team.name,
        player_id:   e.player.id,
        player_name: e.player.name,
        assist_id:   e.assist.id,
        assist_name: e.assist.name,
        detail:      e.detail,
      });
    } else if (e.type === "Card") {
      cards.push({
        minute:      e.time.elapsed,
        extra:       e.time.extra,
        team_id:     e.team.id,
        team_name:   e.team.name,
        player_id:   e.player.id,
        player_name: e.player.name,
        detail:      e.detail,
      });
    } else if (e.type === "subst") {
      // API-Football convention: `player` is the player coming ON, `assist` is who they replaced.
      subs.push({
        minute:          e.time.elapsed,
        extra:           e.time.extra,
        team_id:         e.team.id,
        team_name:       e.team.name,
        player_in_id:    e.player.id,
        player_in_name:  e.player.name,
        player_out_id:   e.assist.id,
        player_out_name: e.assist.name,
      });
    }
  }

  return { goals, cards, subs };
}

// ── Match statistics (possession/corners/cards/shots/fouls) ────────────────
// Fetched only for currently-live fixtures, and only when the match minute has
// advanced since the last cron tick (see shouldFetchStats below) — this is the
// expensive per-fixture call the 5-min cadence needs to budget carefully.

interface APIStatItem { type: string; value: string | number | null }
interface APITeamStats { team: { id: number; name: string }; statistics: APIStatItem[] }

async function fetchStatistics(fixtureId: number): Promise<APITeamStats[]> {
  try {
    const res = await fetch(`${API_BASE}/fixtures/statistics?fixture=${fixtureId}`, {
      headers: apiHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json() as { response: APITeamStats[] };
    return data.response ?? [];
  } catch {
    return [];
  }
}

interface TeamLiveStats {
  possession:     number | null;
  shots_on_goal:  number | null;
  shots_total:    number | null;
  corners:        number | null;
  fouls:          number | null;
  yellow_cards:   number | null;
  red_cards:      number | null;
  offsides:       number | null;
}

const STAT_TYPE_MAP: Record<string, keyof TeamLiveStats> = {
  "Ball Possession": "possession",
  "Shots on Goal":   "shots_on_goal",
  "Total Shots":     "shots_total",
  "Corner Kicks":    "corners",
  "Fouls":           "fouls",
  "Yellow Cards":    "yellow_cards",
  "Red Cards":       "red_cards",
  "Offsides":        "offsides",
};

function statValueToNumber(raw: string | number | null): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return raw;
  const n = parseInt(raw.replace("%", ""), 10);
  return Number.isNaN(n) ? null : n;
}

function parseTeamStats(team: APITeamStats | undefined): TeamLiveStats {
  const out: TeamLiveStats = {
    possession: null, shots_on_goal: null, shots_total: null, corners: null,
    fouls: null, yellow_cards: null, red_cards: null, offsides: null,
  };
  for (const stat of team?.statistics ?? []) {
    const key = STAT_TYPE_MAP[stat.type];
    if (key) out[key] = statValueToNumber(stat.value);
  }
  return out;
}

// Returns null (rather than a struct of nulls) when the API returned nothing
// usable, so the UI can show "stats not available" instead of a wall of dashes.
function buildLiveStats(
  stats: APITeamStats[], homeTeamId: number, awayTeamId: number
): { home: TeamLiveStats; away: TeamLiveStats } | null {
  if (stats.length === 0) return null;
  const homeTeam = stats.find(s => s.team.id === homeTeamId);
  const awayTeam = stats.find(s => s.team.id === awayTeamId);
  return { home: parseTeamStats(homeTeam), away: parseTeamStats(awayTeam) };
}

// ── Combine goals/cards/subs into the chronological matches.match_events feed ─

interface MatchEventEntry {
  minute: number;
  extra:  number | null;
  player: string | null;
  assist: string | null;
  team:   string | null;
  type:   string;
}

// API-Football spells the same player differently across events/endpoints
// (e.g. "K. Mbappe" vs "Kylian Mbappé") even though the numeric player_id is
// stable — look up the canonical players.full_name by id so everything we
// write to match_events uses one consistent spelling per person.
function canonicalPlayerName(id: number | null, raw: string | null, byId: Map<number, string>): string | null {
  if (id != null) {
    const canon = byId.get(id);
    if (canon) return canon;
  }
  return raw;
}

function buildMatchEvents(
  parsed: { goals: ParsedGoal[]; cards: ParsedCard[]; subs: ParsedSub[] } | undefined,
  playerNameById: Map<number, string>
): MatchEventEntry[] | null {
  if (!parsed) return null;
  const entries: MatchEventEntry[] = [
    ...parsed.goals.map(g => ({
      minute: g.minute, extra: g.extra,
      player: canonicalPlayerName(g.player_id, g.player_name, playerNameById),
      assist: canonicalPlayerName(g.assist_id, g.assist_name, playerNameById),
      team:   g.team_name,
      // "Missed Penalty" is API-Football's event type for a penalty that did NOT
      // go in — it must never render (or score) as a goal.
      type: g.detail === "Own Goal"      ? "own_goal"
          : g.detail === "Missed Penalty" ? "missed_penalty"
          : g.detail === "Penalty"        ? "penalty"
          : "goal",
    })),
    ...parsed.cards.map(c => ({
      minute: c.minute, extra: c.extra,
      player: canonicalPlayerName(c.player_id, c.player_name, playerNameById),
      assist: null, team: c.team_name,
      type: c.detail.toLowerCase().includes("red") ? "red_card" : "yellow_card",
    })),
    ...parsed.subs.map(s => ({
      minute: s.minute, extra: s.extra,
      player: canonicalPlayerName(s.player_in_id,  s.player_in_name,  playerNameById),
      assist: canonicalPlayerName(s.player_out_id, s.player_out_name, playerNameById),
      team:   s.team_name,
      type:   "sub",
    })),
  ];
  entries.sort((a, b) => (a.minute - b.minute) || ((a.extra ?? 0) - (b.extra ?? 0)));
  return entries;
}

// Golden Guess tiebreaker: minute of the first goal of the match (any goal type).
function firstGoalMinute(events: Array<{ minute: number; type: string }> | null): number | null {
  if (!events?.length) return null;
  const goalMinutes = events
    .filter(e => e.type === "goal" || e.type === "own_goal" || e.type === "penalty")
    .map(e => e.minute);
  return goalMinutes.length ? Math.min(...goalMinutes) : null;
}

// ── Bracket advancement — auto-create/confirm next-round matches ───────────────
//
// R32 → R16 pairing is officially confirmed per the WC2026 draw and is hardcoded
// here (it's fixed well ahead of the group stage finishing, unlike later rounds).
// Once both feeders of a slot are finished, we determine the winners and try to
// fetch the real confirmed fixture (kickoff/venue) from API-Football; if the API
// doesn't have it yet, the two teams are still set (status "upcoming") using the
// known bracket slot's fallback venue/date, and future cron runs keep retrying
// the API lookup (gated on api_fixture_id being null) until it's confirmed.
const R16_SLOTS: Array<{
  id: string; feeders: [string, string];
  stadium: string; city: string; hostCountry: string; fallbackKickoff: string;
}> = [
  { id: "k001", feeders: ["r001", "r007"], stadium: "NRG Stadium",             city: "Houston",         hostCountry: "USA",    fallbackKickoff: "2026-07-04T17:00:00+00:00" },
  { id: "k002", feeders: ["r004", "r005"], stadium: "Lincoln Financial Field", city: "Philadelphia",    hostCountry: "USA",    fallbackKickoff: "2026-07-04T21:00:00+00:00" },
  { id: "k003", feeders: ["r008", "r009"], stadium: "MetLife Stadium",         city: "East Rutherford", hostCountry: "USA",    fallbackKickoff: "2026-07-05T20:00:00+00:00" },
  { id: "k004", feeders: ["r003", "r014"], stadium: "Estadio Banorte",         city: "Mexico City",     hostCountry: "Mexico", fallbackKickoff: "2026-07-06T00:00:00+00:00" },
  { id: "k005", feeders: ["r006", "r011"], stadium: "Lumen Field",             city: "Seattle",         hostCountry: "USA",    fallbackKickoff: "2026-07-07T00:00:00+00:00" },
  { id: "k006", feeders: ["r012", "r010"], stadium: "AT&T Stadium",            city: "Arlington",       hostCountry: "USA",    fallbackKickoff: "2026-07-06T21:00:00+00:00" },
  { id: "k007", feeders: ["r016", "r015"], stadium: "Mercedes-Benz Stadium",   city: "Atlanta",         hostCountry: "USA",    fallbackKickoff: "2026-07-07T20:00:00+00:00" },
  { id: "k008", feeders: ["r013", "r002"], stadium: "BC Place",                city: "Vancouver",       hostCountry: "Canada", fallbackKickoff: "2026-07-08T00:00:00+00:00" },
];

// R16 → QF → SF → Final never guess pairing: they rely entirely on API-Football
// telling us who plays whom for the round, once every match of the prior stage
// is finished. This avoids hardcoding an unverified bracket structure.
const STAGE_PROGRESSION: Array<{ from: string; to: string; apiRound: string; idPrefix: string }> = [
  { from: "R16", to: "QF",    apiRound: "Quarter-finals", idPrefix: "qf" },
  { from: "QF",  to: "SF",    apiRound: "Semi-finals",    idPrefix: "sf" },
  { from: "SF",  to: "Final", apiRound: "Final",          idPrefix: "fn" },
];

type BracketMatchRow = {
  home: string; away: string;
  home_score: number | null; away_score: number | null;
  home_score_et: number | null; away_score_et: number | null;
  penalty_winner: string | null;
  status: string;
};

// Advancement (who plays the next round) is a separate concern from match-score
// grading — a shootout legitimately decides this, unlike prediction scoring.
function knockoutWinner(m: BracketMatchRow): string | null {
  const h = m.home_score_et ?? m.home_score;
  const a = m.away_score_et ?? m.away_score;
  if (h == null || a == null) return null;
  if (h !== a) return h > a ? m.home : m.away;
  return m.penalty_winner ?? null;
}

async function findApiFixture(round: string, teamA: string, teamB: string): Promise<APIFixture | null> {
  try {
    const url = `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&round=${encodeURIComponent(round)}`;
    const res = await fetch(url, { headers: apiHeaders() });
    if (!res.ok) return null;
    const data = await res.json() as { response: APIFixture[] };
    const a = normTeam(teamA), b = normTeam(teamB);
    return (data.response ?? []).find(f => {
      const h = normTeam(f.teams.home.name), aw = normTeam(f.teams.away.name);
      return (h === a && aw === b) || (h === b && aw === a);
    }) ?? null;
  } catch (e) {
    console.warn(`[scores/cron] Bracket: findApiFixture(${round}) error:`, e);
    return null;
  }
}

async function advanceR16Slots(sb: SupabaseClient): Promise<void> {
  const allFeederIds = R16_SLOTS.flatMap(s => s.feeders);
  const [{ data: feederRows }, { data: r16Rows }] = await Promise.all([
    sb.from("matches")
      .select("id, home, away, home_score, away_score, home_score_et, away_score_et, penalty_winner, status")
      .in("id", allFeederIds),
    sb.from("matches").select("id, api_fixture_id").in("id", R16_SLOTS.map(s => s.id)),
  ]);
  const feederMap = new Map(((feederRows ?? []) as Array<BracketMatchRow & { id: string }>).map(r => [r.id, r]));
  const r16Map = new Map(((r16Rows ?? []) as Array<{ id: string; api_fixture_id: number | null }>).map(r => [r.id, r]));

  for (const slot of R16_SLOTS) {
    if (r16Map.get(slot.id)?.api_fixture_id) continue; // already API-confirmed, nothing to do

    const [fa, fb] = slot.feeders.map(id => feederMap.get(id));
    if (!fa || !fb || fa.status !== "finished" || fb.status !== "finished") continue;

    const winnerA = knockoutWinner(fa);
    const winnerB = knockoutWinner(fb);
    if (!winnerA || !winnerB) continue;

    const { data: allTeamRows } = await sb.from("matches").select("home, away, home_flag, away_flag");
    const flagFor = (team: string) => {
      for (const r of (allTeamRows ?? []) as Array<{ home: string; away: string; home_flag: string | null; away_flag: string | null }>) {
        if (r.home === team) return r.home_flag;
        if (r.away === team) return r.away_flag;
      }
      return null;
    };

    const apiFixture = await findApiFixture("Round of 16", winnerA, winnerB);

    const update: Record<string, unknown> = {
      home: winnerA, away: winnerB,
      home_flag: flagFor(winnerA), away_flag: flagFor(winnerB),
      status: "upcoming",
    };
    if (apiFixture) {
      update.kickoff_at     = apiFixture.fixture.date;
      update.stadium        = apiFixture.fixture.venue.name ?? slot.stadium;
      update.city           = apiFixture.fixture.venue.city ?? slot.city;
      update.api_fixture_id = apiFixture.fixture.id;
      update.time_confirmed = true;
    } else {
      update.kickoff_at = slot.fallbackKickoff;
      update.stadium    = slot.stadium;
      update.city        = slot.city;
      update.host_country = slot.hostCountry;
      update.time_confirmed = false; // teams are known but the date is our own guess until API-Football publishes this fixture
    }

    const { error } = await sb.from("matches").update(update).eq("id", slot.id);
    if (error) {
      console.error(`[scores/cron] Bracket: failed to update ${slot.id}:`, error);
    } else {
      console.log(`[scores/cron] Bracket: ${slot.id} → ${winnerA} vs ${winnerB}${apiFixture ? " (API-confirmed)" : " (API pending, using known slot mapping)"}`);
    }
  }
}

async function advanceStage(sb: SupabaseClient, from: string, to: string, apiRound: string, idPrefix: string): Promise<void> {
  const { data: fromRows } = await sb.from("matches").select("id, status").eq("stage", from);
  // Don't wait for the whole round to finish — API-Football publishes each fixture
  // of `to` as soon as that fixture's own two feeders are decided, so partial
  // population (e.g. 3 of 4 QF pairings while the 4th R16 match is still live) is
  // both safe and expected. Only skip if literally nothing in `from` has finished yet.
  if (!fromRows?.length || !fromRows.some(r => r.status === "finished")) return;

  const { data: toRows } = await sb.from("matches")
    .select("id, home, away, api_fixture_id")
    .eq("stage", to)
    .order("id", { ascending: true });
  const existing = (toRows ?? []) as Array<{ id: string; home: string; away: string; api_fixture_id: number | null }>;

  const url = `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&round=${encodeURIComponent(apiRound)}`;
  let apiFixtures: APIFixture[] = [];
  try {
    const res = await fetch(url, { headers: apiHeaders() });
    if (res.ok) {
      const data = await res.json() as { response: APIFixture[] };
      apiFixtures = data.response ?? [];
    }
  } catch (e) {
    console.warn(`[scores/cron] Bracket: advanceStage(${to}) fetch error:`, e);
  }
  if (!apiFixtures.length) {
    console.log(`[scores/cron] Bracket: ${to} not yet published by API`);
    return;
  }

  const { data: allTeamRows } = await sb.from("matches").select("home, away, home_flag, away_flag");
  const rows = (allTeamRows ?? []) as Array<{ home: string; away: string; home_flag: string | null; away_flag: string | null }>;
  const canonicalName = (apiName: string): string => {
    const norm = normTeam(apiName);
    for (const r of rows) {
      if (normTeam(r.home) === norm) return r.home;
      if (normTeam(r.away) === norm) return r.away;
    }
    return apiName;
  };
  const flagFor = (team: string) => {
    for (const r of rows) {
      if (r.home === team) return r.home_flag;
      if (r.away === team) return r.away_flag;
    }
    return null;
  };

  // Fixed-ID placeholder rows (e.g. "qf-01") are filled in place so predictions
  // and UI referencing those IDs keep working; only overflow gets a freshly minted ID.
  const openPlaceholders = existing.filter(r => !r.api_fixture_id);
  let n = existing.length;

  for (const f of apiFixtures) {
    const homeName = canonicalName(f.teams.home.name);
    const awayName = canonicalName(f.teams.away.name);
    const already = existing.some(r =>
      r.api_fixture_id && ((r.home === homeName && r.away === awayName) || (r.home === awayName && r.away === homeName))
    );
    if (already) continue;

    const fields = {
      home: homeName, away: awayName,
      home_flag: flagFor(homeName), away_flag: flagFor(awayName),
      kickoff_at: f.fixture.date,
      stadium: f.fixture.venue.name ?? "TBD",
      city: f.fixture.venue.city ?? "TBD",
      status: "upcoming",
      api_fixture_id: f.fixture.id,
      time_confirmed: true,
    };

    const placeholder = openPlaceholders.shift();
    if (placeholder) {
      const { error } = await sb.from("matches").update(fields).eq("id", placeholder.id);
      if (error) {
        console.error(`[scores/cron] Bracket: failed to update ${to} match ${placeholder.id}:`, error);
      } else {
        console.log(`[scores/cron] Bracket: ${placeholder.id} → ${homeName} vs ${awayName} (API-confirmed)`);
      }
    } else {
      n++;
      const newId = `${idPrefix}-${String(n).padStart(2, "0")}`;
      const { error } = await sb.from("matches").insert({ id: newId, stage: to, host_country: "USA", ...fields });
      if (error) {
        console.error(`[scores/cron] Bracket: failed to create ${to} match ${newId}:`, error);
      } else {
        console.log(`[scores/cron] Bracket: created ${to} match ${newId}: ${homeName} vs ${awayName} (API-confirmed)`);
      }
    }
  }
}

// ── GET /api/scores — return cached scores from Supabase ───────────────────────

export async function GET() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("live_scores")
    .select("*")
    .order("last_fetched", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scores: data ?? [], fetchedAt: new Date().toISOString() });
}

// ── POST /api/scores — cron endpoint (every 5 min) ────────────────────────────

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.API_FOOTBALL_KEY) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY not configured" }, { status: 503 });
  }

  try {
    const sb  = getSupabase();
    const now = new Date();
    const today    = now.toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    console.log("[scores/cron] ═══════════════════════════════════");
    console.log("[scores/cron] START", now.toISOString());
    console.log("[scores/cron] SUPABASE_SERVICE_ROLE_KEY set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log("[scores/cron] API_FOOTBALL_KEY prefix:", process.env.API_FOOTBALL_KEY.slice(0, 6) + "…");

    // Rate-guard: skip if last fetch was < 4 min ago, unless there are live
    // matches OR matches with api_fixture_id that are still showing 'upcoming'.
    const [{ data: latest }, { data: liveInDB }, { data: staleDB }] = await Promise.all([
      sb.from("live_scores").select("last_fetched").order("last_fetched", { ascending: false }).limit(1).maybeSingle(),
      sb.from("matches").select("id").eq("status", "live").limit(1),
      sb.from("matches")
        .select("api_fixture_id")
        .not("api_fixture_id", "is", null)
        .eq("status", "upcoming")
        .gte("kickoff_at", `${yesterday}T00:00:00Z`)
        .lte("kickoff_at", `${tomorrow}T23:59:59Z`),
    ]);

    const hasLiveMatches  = (liveInDB?.length ?? 0) > 0;
    const staleFixtureIds = (staleDB ?? []).map(m => m.api_fixture_id as number);
    const hasStaleMatches = staleFixtureIds.length > 0;

    if (!hasLiveMatches && !hasStaleMatches && latest?.last_fetched) {
      const age = now.getTime() - new Date(latest.last_fetched).getTime();
      if (age < POLL_INTERVAL) {
        const nextIn = Math.round((POLL_INTERVAL - age) / 1000) + "s";
        console.log("[scores/cron] Rate-guard: skipping, next fetch in", nextIn);
        return NextResponse.json({ skipped: true, nextFetchIn: nextIn });
      }
    }
    if (hasLiveMatches)  console.log("[scores/cron] Rate-guard bypassed — live match in progress");
    if (hasStaleMatches) console.log(`[scores/cron] Rate-guard bypassed — ${staleFixtureIds.length} stale fixture(s) need re-fetch`);

    // ── STEP 1: Fetch from API-Football ──────────────────────────────────────

    const liveUrl  = `${API_BASE}/fixtures?live=all&league=${LEAGUE_ID}&season=${SEASON}`;
    const todayUrl = `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`;
    console.log("[scores/cron] STEP 1: Fetching from API-Football...");
    console.log("[scores/cron]   live URL:", liveUrl);
    console.log("[scores/cron]   today URL:", todayUrl);

    const [liveRes, todayRes] = await Promise.all([
      fetch(liveUrl,  { headers: apiHeaders() }),
      fetch(todayUrl, { headers: apiHeaders() }),
    ]);

    console.log("[scores/cron]   live HTTP status:", liveRes.status, liveRes.statusText);
    console.log("[scores/cron]   today HTTP status:", todayRes.status, todayRes.statusText);

    const [liveData, todayData] = await Promise.all([
      liveRes.json()  as Promise<{ response: APIFixture[]; errors?: unknown; results?: number }>,
      todayRes.json() as Promise<{ response: APIFixture[]; errors?: unknown; results?: number }>,
    ]);

    console.log("[scores/cron]   live errors:", JSON.stringify(liveData.errors));
    console.log("[scores/cron]   live results count:", liveData.results);
    console.log("[scores/cron]   today errors:", JSON.stringify(todayData.errors));
    console.log("[scores/cron]   today results count:", todayData.results);
    if ((liveData.response ?? []).length > 0) {
      console.log("[scores/cron]   live sample:", JSON.stringify(liveData.response[0].teams));
    }
    if ((todayData.response ?? []).length > 0) {
      console.log("[scores/cron]   today sample:", JSON.stringify(todayData.response[0].teams));
    }

    // Merge and deduplicate by fixture ID
    const seen     = new Set<number>();
    const fixtures = [
      ...(liveData.response  ?? []),
      ...(todayData.response ?? []),
    ].filter(f => {
      if (seen.has(f.fixture.id)) return false;
      seen.add(f.fixture.id);
      return true;
    });

    console.log(`[scores/cron]   total unique fixtures: ${fixtures.length}`);

    // ── STEP 1b: Re-fetch stale fixtures directly by ID ───────────────────────
    // Matches with api_fixture_id set but still 'upcoming' won't appear in the
    // today-only API query if they were played on a different date or if an
    // alias mismatch previously prevented the matches table from being updated.
    const missingStaleIds = staleFixtureIds.filter(id => !seen.has(id));
    if (missingStaleIds.length > 0) {
      console.log(`[scores/cron] STEP 1b: Re-fetching ${missingStaleIds.length} stale fixture(s) by ID:`, missingStaleIds);
      await Promise.all(
        missingStaleIds.map(async id => {
          const res = await fetch(`${API_BASE}/fixtures?id=${id}`, { headers: apiHeaders() });
          if (!res.ok) { console.warn(`[scores/cron]   fixture ${id} HTTP ${res.status}`); return; }
          const data = await res.json() as { response: APIFixture[] };
          for (const f of data.response ?? []) {
            if (!seen.has(f.fixture.id)) {
              seen.add(f.fixture.id);
              fixtures.push(f);
            }
          }
        })
      );
      console.log(`[scores/cron]   After stale re-fetch: ${fixtures.length} total fixture(s)`);
    }

    if (fixtures.length === 0) {
      console.log("[scores/cron] No WC2026 matches found — exiting early");
      return NextResponse.json({
        updated: 0,
        message: "No WC2026 matches today",
        _debug: {
          liveErrors:   liveData.errors,
          todayErrors:  todayData.errors,
          liveResults:  liveData.results,
          todayResults: todayData.results,
          liveStatus:   liveRes.status,
          todayStatus:  todayRes.status,
          today,
        },
      });
    }

    // ── STEP 1c: Fetch DB matches early — needed to decide what's worth re-fetching ──
    // Fetch DB matches for a 3-day window (covers extra-time stragglers) and
    // any row already linked by api_fixture_id. Pulled up here (rather than
    // where it's consumed in STEP 3) so the minute-advanced throttle below can
    // compare against each fixture's previously-stored minute/status.

    const { data: dbMatches, error: dbMatchErr } = await sb
      .from("matches")
      .select("id, home, away, home_team_id, away_team_id, kickoff_at, status, home_score, away_score, api_fixture_id, minute")
      .gte("kickoff_at", `${yesterday}T00:00:00Z`)
      .lte("kickoff_at", `${tomorrow}T23:59:59Z`);

    if (dbMatchErr) console.error("[scores/cron]   matches fetch error:", dbMatchErr);
    console.log(`[scores/cron]   DB matches in 3-day window: ${dbMatches?.length ?? 0}`);

    // Canonical player name lookup, used when writing match_events below so the
    // same person is always stored under one spelling regardless of which
    // spelling API-Football attached to a given event.
    const { data: playerNameRows } = await sb.from("players").select("api_player_id, full_name");
    const playerNameById = new Map<number, string>(
      ((playerNameRows ?? []) as Array<{ api_player_id: number; full_name: string }>)
        .map(p => [p.api_player_id, p.full_name])
    );

    const prevStateByFixtureId = new Map<number, { minute: number | null; status: string }>(
      (dbMatches ?? [])
        .filter(m => m.api_fixture_id != null)
        .map(m => [m.api_fixture_id as number, { minute: m.minute, status: m.status }])
    );

    // Fallback goals/cards/subs when we skip re-fetching events this tick —
    // without this, skipped fixtures would regress live_scores back to empty.
    const { data: existingLiveScores } = await sb
      .from("live_scores")
      .select("api_fixture_id, raw_data")
      .in("api_fixture_id", fixtures.map(f => f.fixture.id));

    const prevRawByFixtureId = new Map<number, { goals: ParsedGoal[]; cards: ParsedCard[]; subs: ParsedSub[] }>(
      (existingLiveScores ?? []).map(r => {
        const raw = (r.raw_data ?? {}) as { goals?: ParsedGoal[]; cards?: ParsedCard[]; subs?: ParsedSub[] };
        return [r.api_fixture_id as number, { goals: raw.goals ?? [], cards: raw.cards ?? [], subs: raw.subs ?? [] }];
      })
    );

    // ── STEP 1d: Throttled events + statistics fetch ─────────────────────────
    // Events (goals/cards/subs): re-fetch only when a fixture just went live,
    // its minute has advanced since the last tick, or it just finished (once,
    // for the final snapshot) — a fixture that's been "finished" since a
    // previous tick is never re-fetched again.
    // Statistics (possession/corners/etc): re-fetch only for currently-live
    // fixtures whose minute has advanced — this is the expensive call the
    // 5-min cadence needs to budget, so it's the strictest gate.

    const fetchDecisions = fixtures.map(f => {
      const status        = f.fixture.status.short;
      const isLiveNow      = LIVE_STATUSES.has(status);
      const isFinishedNow  = FINISHED_STATUSES.has(status);
      const prev           = prevStateByFixtureId.get(f.fixture.id);
      const minuteAdvanced = !prev || prev.minute !== f.fixture.status.elapsed;

      const shouldFetchEvents =
        (isLiveNow && (prev?.status !== "live" || minuteAdvanced)) ||
        (isFinishedNow && prev?.status !== "finished");
      const shouldFetchStats = isLiveNow && minuteAdvanced;

      return { f, shouldFetchEvents, shouldFetchStats };
    });

    console.log(`[scores/cron]   fetching events for ${fetchDecisions.filter(d => d.shouldFetchEvents).length}/${fixtures.length} fixture(s) (minute-advanced throttle)`);
    console.log(`[scores/cron]   fetching stats for ${fetchDecisions.filter(d => d.shouldFetchStats).length}/${fixtures.length} fixture(s) (minute-advanced throttle)`);

    const eventsMap = new Map<number, { goals: ParsedGoal[]; cards: ParsedCard[]; subs: ParsedSub[] }>();
    const statsMap  = new Map<number, { home: TeamLiveStats; away: TeamLiveStats } | null>();
    const statsFetchMinute = new Map<number, number | null>();

    await Promise.all(
      fetchDecisions.map(async ({ f, shouldFetchEvents, shouldFetchStats }) => {
        if (shouldFetchEvents) {
          const rawEvents = await fetchEvents(f.fixture.id);
          eventsMap.set(f.fixture.id, parseEvents(rawEvents));
        }
        if (shouldFetchStats) {
          const rawStats = await fetchStatistics(f.fixture.id);
          statsMap.set(f.fixture.id, buildLiveStats(rawStats, f.teams.home.id, f.teams.away.id));
          statsFetchMinute.set(f.fixture.id, f.fixture.status.elapsed);
        }
      })
    );

    // ── STEP 2: Write to live_scores ─────────────────────────────────────────

    const rows = fixtures.map(f => {
      const { goals, cards, subs } = eventsMap.get(f.fixture.id)
        ?? prevRawByFixtureId.get(f.fixture.id)
        ?? { goals: [], cards: [], subs: [] };
      const status = f.fixture.status.short;
      const isLive = LIVE_STATUSES.has(status);

      return {
        match_id:       `api_${f.fixture.id}`,
        api_fixture_id: f.fixture.id,
        home_score:     f.goals.home   ?? 0,
        away_score:     f.goals.away   ?? 0,
        status,
        minute:         f.fixture.status.elapsed ?? null,
        last_fetched:   now.toISOString(),
        raw_data: {
          fixture_id:   f.fixture.id,
          date:         f.fixture.date,
          status_long:  f.fixture.status.long,
          status_short: status,
          elapsed:      f.fixture.status.elapsed,
          extra:        f.fixture.status.extra,
          round:        f.league.round,
          venue:        f.fixture.venue.name,
          is_live:      isLive,
          home_team_id:   f.teams.home.id,
          home_team_name: f.teams.home.name,
          home_team_logo: f.teams.home.logo,
          away_team_id:   f.teams.away.id,
          away_team_name: f.teams.away.name,
          away_team_logo: f.teams.away.logo,
          home_score:   f.goals.home,
          away_score:   f.goals.away,
          ht_home:      f.score.halftime.home,
          ht_away:      f.score.halftime.away,
          ft_home:      f.score.fulltime.home,
          ft_away:      f.score.fulltime.away,
          et_home:      f.score.extratime.home,
          et_away:      f.score.extratime.away,
          pen_home:     f.score.penalty.home,
          pen_away:     f.score.penalty.away,
          goals,
          cards,
          subs,
        },
      };
    });

    console.log(`[scores/cron] STEP 2: Upserting ${rows.length} row(s) to live_scores...`);
    const { error: upsertErr } = await sb
      .from("live_scores")
      .upsert(rows, { onConflict: "match_id" });

    if (upsertErr) {
      console.error("[scores/cron]   live_scores upsert FAILED:", JSON.stringify(upsertErr));
      throw upsertErr;
    }
    console.log("[scores/cron]   live_scores upsert OK");

    // ── STEP 3: Update matches table ─────────────────────────────────────────
    // dbMatches was already fetched in STEP 1c (needed there for the throttle
    // decisions); reused here to match fixtures to DB rows.

    console.log("[scores/cron] STEP 3: Matching fixtures to matches table...");

    const newlyFinished: Array<{
      matchId:        string;
      homeScore:      number;       // 90-min score
      awayScore:      number;
      homeScoreET:    number | null; // score after extra time (null if no ET)
      awayScoreET:    number | null;
      penaltyWinner:  string | null;
    }> = [];

    // Batched per-user Telegram notifications for this cron tick — goal
    // alerts queued in the main loop below, result alerts queued once a
    // match is detected newly-finished, flushed once after STEP 3/3b.
    const telegramQueue: TelegramQueue = new Map();

    function goalSignature(g: { minute: number; extra: number | null; player_id: number | null; team_id: number; detail: string }): string {
      return `${g.minute}-${g.extra ?? ""}-${g.player_id ?? ""}-${g.team_id}-${g.detail}`;
    }

    async function queueGoalAlerts(
      dbMatch: { home: string; away: string; home_team_id: string | null; away_team_id: string | null },
      fixtureId: number,
      freshGoals: ParsedGoal[]
    ): Promise<void> {
      const prevGoals = prevRawByFixtureId.get(fixtureId)?.goals ?? [];
      const prevSignatures = new Set(prevGoals.map(g => goalSignature(g)));
      const newGoals = freshGoals.filter(g => g.detail !== "Missed Penalty" && !prevSignatures.has(goalSignature(g)));
      if (!newGoals.length) return;

      for (const g of newGoals) {
        const scoringHome = normTeam(g.team_name ?? "") === normTeam(dbMatch.home);
        const teamId = scoringHome ? dbMatch.home_team_id : dbMatch.away_team_id;
        if (!teamId) continue; // team not yet backfilled into public.teams — nothing to notify

        const followers = await getTelegramFollowersForTeam(sb, teamId, "goals");
        if (!followers.length) continue;

        const vars = { team: g.team_name ?? "", home: dbMatch.home, away: dbMatch.away, scorer: g.player_name ?? "" };
        for (const f of followers) {
          const template = g.player_name ? f.t.notif_bot_goal_scorer : f.t.notif_bot_goal;
          queueTelegramLine(telegramQueue, f.chat_id, interpolate(template, vars));
        }
      }
    }

    async function queueResultAlert(
      dbMatch: { home: string; away: string; home_team_id: string | null; away_team_id: string | null },
      homeScore: number,
      awayScore: number
    ): Promise<void> {
      const teamIds = [dbMatch.home_team_id, dbMatch.away_team_id].filter((id): id is string => !!id);
      if (!teamIds.length) return;

      const followerLists = await Promise.all(teamIds.map(id => getTelegramFollowersForTeam(sb, id, "results")));
      const seenChatIds = new Set<string>();
      const vars = { home: dbMatch.home, away: dbMatch.away, homeScore, awayScore };
      for (const list of followerLists) {
        for (const f of list) {
          if (seenChatIds.has(f.chat_id)) continue; // follows both teams — one line, not two
          seenChatIds.add(f.chat_id);
          queueTelegramLine(telegramQueue, f.chat_id, interpolate(f.t.notif_bot_result, vars));
        }
      }
    }

    for (const f of fixtures) {
      const apiHome = normTeam(f.teams.home.name);
      const apiAway = normTeam(f.teams.away.name);

      // Primary: match by api_fixture_id (set on previous runs)
      // Fallback: match by normalized team names
      const dbMatch = (dbMatches ?? []).find(m =>
        m.api_fixture_id === f.fixture.id
      ) ?? (dbMatches ?? []).find(m =>
        normTeam(m.home) === apiHome && normTeam(m.away) === apiAway
      );

      if (!dbMatch) {
        console.log(`[scores/cron]   NO DB match for fixture ${f.fixture.id}: "${f.teams.home.name}" vs "${f.teams.away.name}" (norm: "${apiHome}" vs "${apiAway}")`);
        continue;
      }

      const newStatus = FINISHED_STATUSES.has(f.fixture.status.short) ? "finished"
        : LIVE_STATUSES.has(f.fixture.status.short) ? "live"
        : "upcoming";

      const wasFinished = dbMatch.status === "finished";

      // undefined (not null) when events weren't re-fetched this tick — the
      // update below omits the key entirely so the existing DB value survives.
      const freshEvts    = eventsMap.get(f.fixture.id);
      const matchEvents  = freshEvts ? buildMatchEvents(freshEvts, playerNameById) : undefined;
      const statsFetched = statsMap.has(f.fixture.id);
      const freshStats   = statsMap.get(f.fixture.id) ?? null;
      const freshStatsMinute = statsFetchMinute.get(f.fixture.id) ?? null;

      if (freshEvts) {
        await queueGoalAlerts(dbMatch, f.fixture.id, freshEvts.goals);
      }

      // For AET/PEN matches: home_score = 90-min result, home_score_et = after-ET result.
      // For FT matches: home_score = final result, home_score_et = null.
      const isAET = f.fixture.status.short === "AET" || f.fixture.status.short === "PEN";
      const home90 = isAET && f.score.fulltime.home != null ? f.score.fulltime.home : (f.goals.home ?? 0);
      const away90 = isAET && f.score.fulltime.away != null ? f.score.fulltime.away : (f.goals.away ?? 0);
      const homeET = isAET ? (f.goals.home ?? 0) : null;
      const awayET = isAET ? (f.goals.away ?? 0) : null;

      // Penalty winner: set when the API shows a definitive winner after pens
      // f.teams.home.winner is true/false/null; use dbMatch team names (already normalised)
      const penWinner = isAET
        ? f.teams.home.winner === true  ? dbMatch.home
        : f.teams.away.winner === true  ? dbMatch.away
        : f.score.penalty.home != null && f.score.penalty.away != null
          ? f.score.penalty.home > f.score.penalty.away ? dbMatch.home
          : f.score.penalty.home < f.score.penalty.away ? dbMatch.away
          : null
        : null
        : null;

      const { error: updErr } = await sb
        .from("matches")
        .update({
          home_score:     home90,
          away_score:     away90,
          home_score_et:  homeET,
          away_score_et:  awayET,
          penalty_winner: penWinner,
          status:         newStatus,
          api_fixture_id: f.fixture.id,
          minute:         f.fixture.status.elapsed ?? null,
          ...(matchEvents !== undefined ? {
            match_events: matchEvents,
            ...(dbMatch.id === "final" ? { final_first_goal_minute: firstGoalMinute(matchEvents) } : {}),
          } : {}),
          ...(statsFetched ? { live_stats: freshStats, live_stats_minute: freshStatsMinute } : {}),
        })
        .eq("id", dbMatch.id);

      if (updErr) {
        console.error(`[scores/cron]   FAILED to update match ${dbMatch.id}:`, JSON.stringify(updErr));
      } else {
        const scoreLabel = homeET != null ? `${home90}-${away90} (AET: ${homeET}-${awayET})` : `${home90}-${away90}`;
        console.log(`[scores/cron]   Updated match ${dbMatch.id} (${dbMatch.home} vs ${dbMatch.away}): ${scoreLabel} [${newStatus}]`);
      }

      if (!wasFinished && newStatus === "finished") {
        newlyFinished.push({
          matchId:       dbMatch.id,
          homeScore:     home90,
          awayScore:     away90,
          homeScoreET:   homeET,
          awayScoreET:   awayET,
          penaltyWinner: penWinner,
        });
        await queueResultAlert(dbMatch, home90, away90);
        console.log(`[scores/cron]   Match ${dbMatch.id} just finished — queued for scoring`);
      }
    }

    // ── STEP 3b: Stuck live match detector ──────────────────────────────────────
    // Finds live matches that were missed by the main loop (not in live/today API
    // endpoints) and force-refreshes them. Hard-closes any match > 4 hours old.

    console.log("[scores/cron] STEP 3b: Checking for stuck live matches...");

    {
      const justFinishedIds = new Set(newlyFinished.map(m => m.matchId));
      const dbLiveMatches = (dbMatches ?? []).filter(m =>
        m.status === "live" &&
        m.api_fixture_id != null &&
        !justFinishedIds.has(m.id)
      );

      if (dbLiveMatches.length === 0) {
        console.log("[scores/cron] STEP 3b: No live matches in 3-day window to check");
      } else {
        console.log(`[scores/cron] STEP 3b: Checking ${dbLiveMatches.length} live match(es) for stuck state`);

        // Batch-fetch last_fetched from live_scores for all live fixtures
        const { data: lsRows } = await sb
          .from("live_scores")
          .select("api_fixture_id, last_fetched")
          .in("api_fixture_id", dbLiveMatches.map(m => m.api_fixture_id));

        const lastFetchedMap = new Map<number, number>(
          (lsRows ?? []).map(r => [
            r.api_fixture_id as number,
            new Date(r.last_fetched as string).getTime(),
          ])
        );

        for (const m of dbLiveMatches) {
          const ageMs        = now.getTime() - new Date(m.kickoff_at).getTime();
          const lastFetched  = lastFetchedMap.get(m.api_fixture_id as number) ?? 0;
          const staleFetchMs = now.getTime() - lastFetched;
          const isHardFallback = ageMs > FOUR_HOURS_MS;

          const isStuck =
            isHardFallback ||
            ageMs > THREE_HOURS_MS ||
            ((m.minute ?? 0) >= 90 && staleFetchMs > THIRTY_MIN_MS);

          if (!isStuck) continue;

          console.log(
            `[scores/cron] STEP 3b: Stuck match ${m.id} (${m.home} vs ${m.away}),` +
            ` age=${Math.round(ageMs / 60000)}min, minute=${m.minute ?? "?"},` +
            ` staleFetch=${Math.round(staleFetchMs / 60000)}min, hardFallback=${isHardFallback}`
          );

          const fixtureId = m.api_fixture_id as number;

          // Use scores from the main-loop fixture if already fetched (post-STEP3 values)
          const mainFixture = fixtures.find(f => f.fixture.id === fixtureId);
          let resolvedHome = (mainFixture?.goals.home ?? m.home_score ?? 0) as number;
          let resolvedAway = (mainFixture?.goals.away ?? m.away_score ?? 0) as number;
          let shouldFinish = isHardFallback;

          if (!seen.has(fixtureId)) {
            // Not fetched in main loop — re-fetch directly by fixture ID
            try {
              const r = await fetch(`${API_BASE}/fixtures?id=${fixtureId}`, { headers: apiHeaders() });
              const d = await r.json() as { response: APIFixture[] };
              const af = d.response?.[0];
              seen.add(fixtureId);

              if (af) {
                resolvedHome = af.goals.home ?? resolvedHome;
                resolvedAway = af.goals.away ?? resolvedAway;
                const apiStatus = af.fixture.status.short;
                console.log(`[scores/cron] STEP 3b:   API → ${apiStatus} (${resolvedHome}-${resolvedAway})`);

                if (FINISHED_STATUSES.has(apiStatus)) {
                  shouldFinish = true;
                } else if (LIVE_STATUSES.has(apiStatus) && !isHardFallback) {
                  // Still live and not a hard fallback — refresh score/minute only
                  await sb.from("matches").update({
                    home_score: resolvedHome,
                    away_score: resolvedAway,
                    minute:     af.fixture.status.elapsed ?? m.minute,
                  }).eq("id", m.id);
                  console.log(`[scores/cron] STEP 3b:   Match ${m.id} still live (${apiStatus}) — refreshed`);
                  continue;
                }
                // Hard fallback with live API status → shouldFinish stays true (force close)
              } else {
                console.warn(`[scores/cron] STEP 3b:   No API data for fixture ${fixtureId}`);
              }
            } catch (e) {
              console.warn(`[scores/cron] STEP 3b:   API error for fixture ${fixtureId}:`, e);
            }
          } else if (!isHardFallback) {
            // Already handled in main loop and not a hard fallback — skip
            continue;
          }
          // Hard fallback + already in main loop: STEP 3 set status=live based on API;
          // we still force-close it because no match runs longer than 4 hours.

          if (shouldFinish) {
            // Ensure events are fetched for this fixture
            if (!eventsMap.has(fixtureId)) {
              const rawEvts = await fetchEvents(fixtureId);
              eventsMap.set(fixtureId, parseEvents(rawEvts));
              console.log(`[scores/cron] STEP 3b:   Fetched events for fixture ${fixtureId}: ${rawEvts.length} event(s)`);
            }

            const stuckParsed = eventsMap.get(fixtureId);
            const stuckMatchEvents = buildMatchEvents(stuckParsed, playerNameById);

            // Sync live_scores → "FT" + fresh events so STEP 5 aggregates player stats correctly
            const { data: lsRow } = await sb
              .from("live_scores")
              .select("raw_data")
              .eq("api_fixture_id", fixtureId)
              .maybeSingle();

            if (lsRow) {
              const existingRaw = lsRow.raw_data as Record<string, unknown>;
              await sb.from("live_scores").update({
                status:     "FT",
                home_score: resolvedHome,
                away_score: resolvedAway,
                raw_data: {
                  ...existingRaw,
                  status_short: "FT",
                  status_long:  "Match Finished",
                  home_score:   resolvedHome,
                  away_score:   resolvedAway,
                  goals: stuckParsed?.goals ?? existingRaw.goals ?? [],
                  cards: stuckParsed?.cards ?? existingRaw.cards ?? [],
                  subs:  stuckParsed?.subs  ?? existingRaw.subs  ?? [],
                },
              }).eq("api_fixture_id", fixtureId);
              console.log(`[scores/cron] STEP 3b:   Synced live_scores fixture ${fixtureId} → FT`);
            }

            const { error: finErr } = await sb
              .from("matches")
              .update({
                status:       "finished",
                home_score:   resolvedHome,
                away_score:   resolvedAway,
                match_events: stuckMatchEvents,
                ...(m.id === "final" ? { final_first_goal_minute: firstGoalMinute(stuckMatchEvents) } : {}),
              })
              .eq("id", m.id);

            if (finErr) {
              console.error(`[scores/cron] STEP 3b:   Failed to force-finish ${m.id}:`, finErr);
            } else {
              const label = isHardFallback ? "Hard-forced" : "Force-finished";
              console.log(`[scores/cron] STEP 3b:   ${label} match ${m.id} → finished (${resolvedHome}-${resolvedAway})`);
              // ET score not available in stuck-match recovery; admin can use score override if needed.
              newlyFinished.push({ matchId: m.id, homeScore: resolvedHome, awayScore: resolvedAway, homeScoreET: null, awayScoreET: null, penaltyWinner: null });
              await queueResultAlert(m, resolvedHome, resolvedAway);
            }
          }
        }
      }
    }

    // ── STEP 3c: Bracket advancement — auto-create/confirm next-round matches ──

    console.log("[scores/cron] STEP 3c: Checking bracket advancement...");
    try {
      await advanceR16Slots(sb);
      for (const s of STAGE_PROGRESSION) {
        await advanceStage(sb, s.from, s.to, s.apiRound, s.idPrefix);
      }
    } catch (e) {
      console.error("[scores/cron] STEP 3c: bracket advancement error:", e);
    }

    // ── STEP 4: Trigger scoring for newly finished matches ───────────────────

    if (newlyFinished.length === 0) {
      console.log("[scores/cron] STEP 4: No newly finished matches — scoring skipped");
    } else {
      console.log(`[scores/cron] STEP 4: Scoring ${newlyFinished.length} newly finished match(es)...`);

      // Fetch all scoring rules in one query
      const { data: allRulesRows } = await sb
        .from("scoring_rules")
        .select(SCORING_RULES_SELECT);

      const rulesMap = new Map<string, ScoringRulesRow>(
        ((allRulesRows ?? []) as unknown as ScoringRulesRow[]).map(r => [r.group_id, r])
      );

      const { data: allGroups } = await sb.from("groups").select("id");
      console.log(`[scores/cron]   Groups to score: ${allGroups?.length ?? 0}`);

      for (const { matchId, homeScore, awayScore, homeScoreET, awayScoreET, penaltyWinner } of newlyFinished) {
        const etLabel = homeScoreET != null ? ` (AET: ${homeScoreET}-${awayScoreET})` : "";
        const penLabel = penaltyWinner ? ` pens: ${penaltyWinner}` : "";
        console.log(`[scores/cron]   Scoring match ${matchId}: ${homeScore}-${awayScore}${etLabel}${penLabel} across ${allGroups?.length ?? 0} group(s)`);

        await Promise.allSettled(
          (allGroups ?? []).map(group =>
            scoreMatchResult({
              matchId,
              groupId:       group.id,
              homeScore,
              awayScore,
              homeScoreET,
              awayScoreET,
              rules:         buildScoringRules(rulesMap.get(group.id) ?? null),
              sbClient:      sb,
            })
          )
        );

        console.log(`[scores/cron]   Scoring complete for match ${matchId}`);
      }
    }

    // ── STEP 4b: Leaderboard movement notifications ──────────────────────────
    // Ranks are computed live elsewhere (lib/services/groups.ts getMembers) —
    // nothing persists a "previous rank" outside telegram_leaderboard_rank
    // (migration 047), which exists solely to diff against here. Only worth
    // running for groups with at least one Telegram-linked member, so this
    // stays cheap while adoption is low.

    if (newlyFinished.length > 0) {
      console.log("[scores/cron] STEP 4b: Checking leaderboard movement for Telegram-linked groups...");

      const { data: tgGroupRows } = await sb
        .from("group_members")
        .select("group_id, profiles!inner ( telegram_chat_id )")
        .not("profiles.telegram_chat_id", "is", null);

      const groupsWithTelegram = [...new Set(
        ((tgGroupRows ?? []) as Array<{ group_id: string }>).map(r => r.group_id)
      )];

      if (groupsWithTelegram.length > 0) {
        const { data: candidateGroups } = await sb.from("groups").select("id, name").in("id", groupsWithTelegram);

        for (const group of (candidateGroups ?? []) as Array<{ id: string; name: string }>) {
          const members = await getMembers(group.id);
          if (!members.length) continue;

          const memberIds = members.map(m => m.id);
          const [{ data: prevRanks }, { data: profileRows }] = await Promise.all([
            sb.from("telegram_leaderboard_rank").select("user_id, last_rank").eq("group_id", group.id),
            sb.from("profiles")
              .select("id, telegram_chat_id, notification_preferences, telegram_language_code")
              .in("id", memberIds)
              .not("telegram_chat_id", "is", null),
          ]);

          const prevRankMap = new Map(
            ((prevRanks ?? []) as Array<{ user_id: string; last_rank: number }>).map(r => [r.user_id, r.last_rank])
          );
          const profileMap = new Map(
            ((profileRows ?? []) as Array<{
              id: string; telegram_chat_id: string; notification_preferences: unknown; telegram_language_code: string | null;
            }>).map(p => [p.id, p])
          );

          const upserts: Array<{ user_id: string; group_id: string; last_rank: number; last_notified_at?: string }> = [];

          members.forEach((member, index) => {
            const newRank = index + 1;
            const oldRank = prevRankMap.get(member.id);
            const profile = profileMap.get(member.id);

            const droppedRank = profile && oldRank !== undefined && newRank > oldRank;
            const wantsAlert  = droppedRank && isTelegramPrefEnabled(
              profile!.notification_preferences as Parameters<typeof isTelegramPrefEnabled>[0], "leaderboard"
            );

            if (wantsAlert) {
              const t = telegramTranslations(profile!.telegram_language_code);
              const line = interpolate(t.notif_bot_leaderboard_drop, { group: group.name, rank: newRank, oldRank: oldRank! });
              queueTelegramLine(telegramQueue, profile!.telegram_chat_id, line);
              upserts.push({ user_id: member.id, group_id: group.id, last_rank: newRank, last_notified_at: now.toISOString() });
            } else {
              upserts.push({ user_id: member.id, group_id: group.id, last_rank: newRank });
            }
          });

          if (upserts.length) {
            const { error: rankUpsertErr } = await sb
              .from("telegram_leaderboard_rank")
              .upsert(upserts, { onConflict: "user_id,group_id" });
            if (rankUpsertErr) console.error(`[scores/cron] STEP 4b:   rank upsert failed for group ${group.id}:`, rankUpsertErr);
          }
        }
      }
    }

    // ── STEP 5: Update tournament scorer / assister points ───────────────────
    // Runs every cron tick (not just when new matches finish) so the stats
    // table and pick points stay consistent with the full live_scores history.
    await updateTournamentScorerPoints(sb);

    // ── STEP 6: Flush batched Telegram notifications ─────────────────────────
    // One message per user per tick even if multiple goals/results queued a
    // line each — see queueTelegramLine/flushTelegramQueue.

    const tgResult = await flushTelegramQueue(telegramQueue, sb);
    console.log(`[scores/cron] STEP 6: Telegram — queued for ${telegramQueue.size} user(s), sent ${tgResult.sent}, failed ${tgResult.failed}, blocked ${tgResult.blocked}`);

    // ── Summary ──────────────────────────────────────────────────────────────

    const liveCount     = rows.filter(r => LIVE_STATUSES.has(r.status)).length;
    const finishedCount = rows.filter(r => FINISHED_STATUSES.has(r.status)).length;

    console.log(`[scores/cron] DONE — updated: ${rows.length}, live: ${liveCount}, finished: ${finishedCount}, scored: ${newlyFinished.length}`);
    console.log("[scores/cron] ═══════════════════════════════════");

    return NextResponse.json({
      updated:  rows.length,
      live:     liveCount,
      finished: finishedCount,
      upcoming: rows.length - liveCount - finishedCount,
      scored:   newlyFinished.map(m => m.matchId),
      telegram: tgResult,
      timestamp: now.toISOString(),
    });

  } catch (err) {
    console.error("[scores/cron] UNCAUGHT ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
