// Live scores cron — fetches from API-Football, caches to Supabase,
// updates matches table, and triggers point scoring for finished matches.

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { scoreMatchResult } from "@/lib/services/predictions";
import type { ScoringRules } from "@/lib/types";

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
  "ir iran":                       "iran",
  "korea republic":                "south korea",
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
};

function buildScoringRules(r: ScoringRulesRow | null): ScoringRules {
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
      if (g.detail === "Own Goal") continue; // own goals don't count for golden boot
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

  const statsRows = allIds.map(id => {
    const t = tally.get(id)!;
    return {
      api_player_id: id,
      player_name:   t.name,
      full_name:     apiIdToFullName.get(id) ?? null,
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

  // ── 4. Determine current leaders ─────────────────────────────────────────

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

  // ── 5. Score top_scorer / top_assister predictions ───────────────────────

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

function parseEvents(events: APIEvent[]): { goals: ParsedGoal[]; cards: ParsedCard[] } {
  const goals: ParsedGoal[] = [];
  const cards: ParsedCard[] = [];

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
    }
  }

  return { goals, cards };
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

    // Fetch events for live and finished matches
    const needsEvents = fixtures.filter(
      f => LIVE_STATUSES.has(f.fixture.status.short) || FINISHED_STATUSES.has(f.fixture.status.short)
    );
    console.log(`[scores/cron]   fetching events for ${needsEvents.length} live/finished fixture(s)`);

    const eventsMap = new Map<number, { goals: ParsedGoal[]; cards: ParsedCard[] }>();
    await Promise.all(
      needsEvents.map(async f => {
        const rawEvents = await fetchEvents(f.fixture.id);
        eventsMap.set(f.fixture.id, parseEvents(rawEvents));
      })
    );

    // ── STEP 2: Write to live_scores ─────────────────────────────────────────

    const rows = fixtures.map(f => {
      const { goals, cards } = eventsMap.get(f.fixture.id) ?? { goals: [], cards: [] };
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
    // Fetch DB matches for a 3-day window (covers extra-time stragglers) and
    // any row already linked by api_fixture_id.

    console.log("[scores/cron] STEP 3: Matching fixtures to matches table...");

    const { data: dbMatches, error: dbMatchErr } = await sb
      .from("matches")
      .select("id, home, away, kickoff_at, status, home_score, away_score, api_fixture_id, minute")
      .gte("kickoff_at", `${yesterday}T00:00:00Z`)
      .lte("kickoff_at", `${tomorrow}T23:59:59Z`);

    if (dbMatchErr) console.error("[scores/cron]   matches fetch error:", dbMatchErr);
    console.log(`[scores/cron]   DB matches in 3-day window: ${dbMatches?.length ?? 0}`);

    const newlyFinished: Array<{ matchId: string; homeScore: number; awayScore: number }> = [];

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

      const parsedEvts = eventsMap.get(f.fixture.id);
      const matchEvents = parsedEvts
        ? parsedEvts.goals.map(g => ({
            minute: g.minute,
            extra:  g.extra,
            player: g.player_name,
            assist: g.assist_name,
            team:   g.team_name,
            type:   g.detail === "Own Goal" ? "own_goal"
                  : g.detail === "Penalty"  ? "penalty"
                  :                           "goal",
          }))
        : null;

      const { error: updErr } = await sb
        .from("matches")
        .update({
          home_score:     f.goals.home ?? 0,
          away_score:     f.goals.away ?? 0,
          status:         newStatus,
          api_fixture_id: f.fixture.id,
          minute:         f.fixture.status.elapsed ?? null,
          match_events:   matchEvents,
        })
        .eq("id", dbMatch.id);

      if (updErr) {
        console.error(`[scores/cron]   FAILED to update match ${dbMatch.id}:`, JSON.stringify(updErr));
      } else {
        console.log(`[scores/cron]   Updated match ${dbMatch.id} (${dbMatch.home} vs ${dbMatch.away}): ${f.goals.home ?? 0}-${f.goals.away ?? 0} [${newStatus}]`);
      }

      if (!wasFinished && newStatus === "finished") {
        newlyFinished.push({
          matchId:   dbMatch.id,
          homeScore: f.goals.home ?? 0,
          awayScore: f.goals.away ?? 0,
        });
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
            const stuckMatchEvents = stuckParsed
              ? stuckParsed.goals.map(g => ({
                  minute: g.minute,
                  extra:  g.extra,
                  player: g.player_name,
                  assist: g.assist_name,
                  team:   g.team_name,
                  type:   g.detail === "Own Goal" ? "own_goal"
                        : g.detail === "Penalty"  ? "penalty"
                        :                           "goal",
                }))
              : null;

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
              })
              .eq("id", m.id);

            if (finErr) {
              console.error(`[scores/cron] STEP 3b:   Failed to force-finish ${m.id}:`, finErr);
            } else {
              const label = isHardFallback ? "Hard-forced" : "Force-finished";
              console.log(`[scores/cron] STEP 3b:   ${label} match ${m.id} → finished (${resolvedHome}-${resolvedAway})`);
              newlyFinished.push({ matchId: m.id, homeScore: resolvedHome, awayScore: resolvedAway });
            }
          }
        }
      }
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

      for (const { matchId, homeScore, awayScore } of newlyFinished) {
        console.log(`[scores/cron]   Scoring match ${matchId}: ${homeScore}-${awayScore} across ${allGroups?.length ?? 0} group(s)`);

        await Promise.allSettled(
          (allGroups ?? []).map(group =>
            scoreMatchResult({
              matchId,
              groupId:  group.id,
              homeScore,
              awayScore,
              rules:    buildScoringRules(rulesMap.get(group.id) ?? null),
              sbClient: sb,
            })
          )
        );

        console.log(`[scores/cron]   Scoring complete for match ${matchId}`);
      }
    }

    // ── STEP 5: Update tournament scorer / assister points ───────────────────
    // Runs every cron tick (not just when new matches finish) so the stats
    // table and pick points stay consistent with the full live_scores history.
    await updateTournamentScorerPoints(sb);

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
      timestamp: now.toISOString(),
    });

  } catch (err) {
    console.error("[scores/cron] UNCAUGHT ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}
