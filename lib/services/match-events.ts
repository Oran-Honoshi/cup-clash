// Shared API-Football match-events fetch/parse/build helpers — used by both
// the live scores cron (frequent, throttled, app/api/scores/route.ts) and
// the once-daily match-events reconciliation cron
// (app/api/reminders/match-events-reconcile/route.ts) so the two can never
// drift on how a raw API-Football event becomes a matches.match_events
// entry. Route files may only export recognized HTTP-method handlers, so
// these live here rather than being exported from the scores route.

const API_BASE = "https://v3.football.api-sports.io";

function apiHeaders(): Record<string, string> {
  return { "x-apisports-key": process.env.API_FOOTBALL_KEY! };
}

function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, cache: "no-store" });
}

export interface APIEvent {
  time:   { elapsed: number; extra: number | null };
  team:   { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type:   "Goal" | "Card" | "subst" | "Var";
  detail: string;
  comments: string | null;
}

export interface ParsedGoal {
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

export interface ParsedCard {
  minute:      number;
  extra:       number | null;
  team_id:     number;
  team_name:   string;
  player_id:   number | null;
  player_name: string | null;
  detail:      string;
}

export interface ParsedSub {
  minute:       number;
  extra:        number | null;
  team_id:      number;
  team_name:    string;
  player_in_id:   number | null;
  player_in_name: string | null;
  player_out_id:   number | null;
  player_out_name: string | null;
}

export interface MatchEventEntry {
  minute: number;
  extra:  number | null;
  player: string | null;
  assist: string | null;
  team:   string | null;
  type:   string;
}

export async function fetchEvents(fixtureId: number): Promise<APIEvent[]> {
  try {
    const res = await apiFetch(`${API_BASE}/fixtures/events?fixture=${fixtureId}`, {
      headers: apiHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json() as { response: APIEvent[] };
    return data.response ?? [];
  } catch {
    return [];
  }
}

export function parseEvents(events: APIEvent[]): { goals: ParsedGoal[]; cards: ParsedCard[]; subs: ParsedSub[] } {
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

export function buildMatchEvents(
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
