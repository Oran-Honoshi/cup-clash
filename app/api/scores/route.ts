// Live scores cron — fetches from API-Football, caches to Supabase,
// updates matches table, and triggers point scoring for finished matches.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreMatchResult } from "@/lib/services/predictions";
import type { ScoringRules } from "@/lib/types";

const API_BASE      = "https://v3.football.api-sports.io";
const LEAGUE_ID     = 1;     // FIFA World Cup
const SEASON        = 2026;
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

const LIVE_STATUSES     = new Set(["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

// API-Football name → our seed name (all lowercase for comparison)
const TEAM_ALIASES: Record<string, string> = {
  "turkey":                        "türkiye",
  "ivory coast":                   "côte d'ivoire",
  "bosnia":                        "bosnia & herzegovina",
  "south korea":                   "korea republic",
  "united states":                 "usa",
  "curacao":                       "curaçao",
  "iran":                          "ir iran",
  "cape verde":                    "cabo verde",
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

    // Rate-guard: skip if last fetch was < 5 min ago
    const { data: latest } = await sb
      .from("live_scores")
      .select("last_fetched")
      .order("last_fetched", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest?.last_fetched) {
      const age = now.getTime() - new Date(latest.last_fetched).getTime();
      if (age < POLL_INTERVAL) {
        const nextIn = Math.round((POLL_INTERVAL - age) / 1000) + "s";
        console.log("[scores/cron] Rate-guard: skipping, next fetch in", nextIn);
        return NextResponse.json({ skipped: true, nextFetchIn: nextIn });
      }
    }

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
      .select("id, home, away, kickoff_at, status, home_score, away_score, api_fixture_id")
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

      const { error: updErr } = await sb
        .from("matches")
        .update({
          home_score:     f.goals.home ?? 0,
          away_score:     f.goals.away ?? 0,
          status:         newStatus,
          api_fixture_id: f.fixture.id,
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
