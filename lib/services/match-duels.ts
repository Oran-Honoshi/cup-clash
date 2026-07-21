import { randomUUID } from "crypto";
import { sbAdmin } from "@/lib/supabase/admin";
import { calcLivePoints } from "@/lib/services/predictions";
import { isMatchLocked } from "@/lib/isMatchLocked";

// Match Duel — extends the "1v1 Duel" concept (daily_duels, migration 055)
// to a specific match's score prediction, rather than "today's puzzle".
// Two creation paths (see migration 066's comment for why): the in-app
// member-picker (opponent known immediately, mirrors daily_duels' flow) and
// a shareable invite link/token (opponent unknown until claimed). Scores are
// self-contained per row (not joined from group_predictions — the two
// participants may not share a group), graded with calcLivePoints' fixed
// default rules against the 90-minute score, same as Oracle Duel.

export type MatchDuelStatus = "pending" | "accepted" | "declined";

export interface MatchDuelMatchInfo {
  id: string;
  home: string;
  away: string;
  homeFlagCode: string | null;
  awayFlagCode: string | null;
  kickoffAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

const MATCH_COLS = "id, home, away, home_flag, away_flag, kickoff_at, status, home_score, away_score";

interface MatchRow {
  id: string; home: string; away: string;
  home_flag: string | null; away_flag: string | null;
  kickoff_at: string; status: string;
  home_score: number | null; away_score: number | null;
}

export function formatMatchDuelDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function toMatchInfo(m: MatchRow): MatchDuelMatchInfo {
  return {
    id: m.id, home: m.home, away: m.away,
    homeFlagCode: m.home_flag, awayFlagCode: m.away_flag,
    kickoffAt: m.kickoff_at, status: m.status,
    homeScore: m.home_score, awayScore: m.away_score,
  };
}

async function getMatch(matchId: string): Promise<MatchDuelMatchInfo | null> {
  const { data } = await sbAdmin().from("matches").select(MATCH_COLS).eq("id", matchId).maybeSingle();
  return data ? toMatchInfo(data as MatchRow) : null;
}

// ── Match picker (step 1 of creating a duel) ──────────────────────────────
// Cross-competition on purpose — two friends duelling may not follow the
// same competition/group, unlike getUpcomingMatches() which is scoped to a
// single group's competition_id. Capped and kickoff-ordered rather than
// paginated like getAllMatches(), since this only ever backs a search box.

export async function searchUpcomingMatchesForDuel(q: string | null, limit = 20): Promise<MatchDuelMatchInfo[]> {
  const sb = sbAdmin();
  let query = sb
    .from("matches")
    .select(MATCH_COLS)
    .gt("kickoff_at", new Date(Date.now() + 5 * 60 * 1000).toISOString())
    .neq("home", "TBD")
    .neq("away", "TBD")
    .order("kickoff_at", { ascending: true })
    .limit(limit);

  const trimmed = q?.trim() ?? "";
  if (trimmed.length >= 2) {
    query = query.or(`home.ilike.%${trimmed}%,away.ilike.%${trimmed}%`);
  }

  const { data } = await query;
  return ((data ?? []) as MatchRow[]).map(toMatchInfo);
}

// ── Creation: in-app member-picker (opponent known immediately) ──────────

export type CreateMatchDuelResult =
  | { ok: true; duelId: string; status: MatchDuelStatus }
  | { ok: false; error: "self" | "not_found" | "locked" };

export async function createMatchDuel(
  challengerId: string,
  opponentId: string,
  matchId: string
): Promise<CreateMatchDuelResult> {
  if (challengerId === opponentId) return { ok: false, error: "self" };

  const sb = sbAdmin();
  const [{ data: opponentProfile }, match] = await Promise.all([
    sb.from("profiles").select("id").eq("id", opponentId).maybeSingle(),
    getMatch(matchId),
  ]);
  if (!opponentProfile || !match) return { ok: false, error: "not_found" };
  if (isMatchLocked(match.kickoffAt)) return { ok: false, error: "locked" };

  const { data: created, error } = await sb
    .from("match_duels")
    .insert({ challenger_id: challengerId, opponent_id: opponentId, match_id: matchId })
    .select("id, status")
    .single();
  if (!error && created) return { ok: true, duelId: created.id, status: created.status };

  // Unique violation on the pair+match index — a duel already exists for
  // this pair on this match; return it instead of erroring (idempotent).
  const { data: existing } = await sb
    .from("match_duels")
    .select("id, status")
    .eq("match_id", matchId)
    .or(`and(challenger_id.eq.${challengerId},opponent_id.eq.${opponentId}),and(challenger_id.eq.${opponentId},opponent_id.eq.${challengerId})`)
    .maybeSingle();
  if (existing) return { ok: true, duelId: existing.id, status: existing.status };
  return { ok: false, error: "not_found" };
}

export async function respondToMatchDuel(
  userId: string,
  duelId: string,
  action: "accept" | "decline"
): Promise<{ ok: boolean; error?: "not_found" | "forbidden" | "not_pending" }> {
  const sb = sbAdmin();
  const { data: duel } = await sb.from("match_duels").select("id, opponent_id, status").eq("id", duelId).maybeSingle();
  if (!duel) return { ok: false, error: "not_found" };
  if (duel.opponent_id !== userId) return { ok: false, error: "forbidden" };
  if (duel.status !== "pending") return { ok: false, error: "not_pending" };

  const { error } = await sb
    .from("match_duels")
    .update({ status: action === "accept" ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", duelId);
  return { ok: !error };
}

// ── Creation: shareable invite link ───────────────────────────────────────

export type CreateInviteResult =
  | { ok: true; token: string; duelId: string }
  | { ok: false; error: "not_found" | "locked" };

export async function createMatchDuelInvite(challengerId: string, matchId: string): Promise<CreateInviteResult> {
  const match = await getMatch(matchId);
  if (!match) return { ok: false, error: "not_found" };
  if (isMatchLocked(match.kickoffAt)) return { ok: false, error: "locked" };

  const token = randomUUID().replace(/-/g, "");
  const { data, error } = await sbAdmin()
    .from("match_duels")
    .insert({ challenger_id: challengerId, match_id: matchId, invite_token: token })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "not_found" };
  return { ok: true, token, duelId: data.id };
}

export interface MatchDuelInvite {
  duelId: string;
  match: MatchDuelMatchInfo;
  challenger: { id: string; name: string; avatarUrl: string | null };
  claimable: boolean; // false once accepted/declined or the challenger tries to accept their own link
}

// Public read — no auth required, mirrors /join/[code]'s findGroup(): a
// service-role lookup by an opaque token, safe to expose before the visitor
// is identified.
export async function getInviteByToken(token: string): Promise<MatchDuelInvite | null> {
  const sb = sbAdmin();
  const { data: duel } = await sb
    .from("match_duels")
    .select("id, challenger_id, match_id, status, opponent_id")
    .eq("invite_token", token)
    .maybeSingle();
  if (!duel) return null;

  const [match, { data: challengerProfile }] = await Promise.all([
    getMatch(duel.match_id),
    sb.from("profiles").select("id, name, avatar_url").eq("id", duel.challenger_id).maybeSingle(),
  ]);
  if (!match || !challengerProfile) return null;

  return {
    duelId: duel.id,
    match,
    challenger: { id: challengerProfile.id, name: challengerProfile.name, avatarUrl: challengerProfile.avatar_url },
    claimable: duel.status === "pending" && duel.opponent_id === null,
  };
}

export type AcceptInviteResult =
  | { ok: true; duelId: string }
  | { ok: false; error: "not_found" | "self" | "already_claimed" | "locked" };

export async function acceptMatchDuelInvite(userId: string, token: string): Promise<AcceptInviteResult> {
  const sb = sbAdmin();
  const { data: duel } = await sb
    .from("match_duels")
    .select("id, challenger_id, match_id, status, opponent_id")
    .eq("invite_token", token)
    .maybeSingle();
  if (!duel) return { ok: false, error: "not_found" };
  if (duel.challenger_id === userId) return { ok: false, error: "self" };
  if (duel.status !== "pending" || duel.opponent_id !== null) return { ok: false, error: "already_claimed" };

  const match = await getMatch(duel.match_id);
  if (!match) return { ok: false, error: "not_found" };
  if (isMatchLocked(match.kickoffAt)) return { ok: false, error: "locked" };

  const { error } = await sb
    .from("match_duels")
    .update({ opponent_id: userId, status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", duel.id)
    .eq("status", "pending")
    .is("opponent_id", null);
  if (error) return { ok: false, error: "already_claimed" };
  return { ok: true, duelId: duel.id };
}

// ── Score submission ───────────────────────────────────────────────────

export type SubmitScoreResult =
  | { ok: true }
  | { ok: false; error: "invalid_score" | "not_found" | "forbidden" | "locked" };

export async function submitMatchDuelScore(
  userId: string,
  duelId: string,
  homeScore: number,
  awayScore: number
): Promise<SubmitScoreResult> {
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    return { ok: false, error: "invalid_score" };
  }

  const sb = sbAdmin();
  const { data: duel } = await sb
    .from("match_duels")
    .select("id, challenger_id, opponent_id, match_id, status")
    .eq("id", duelId)
    .maybeSingle();
  if (!duel || duel.status !== "accepted") return { ok: false, error: "not_found" };
  if (duel.challenger_id !== userId && duel.opponent_id !== userId) return { ok: false, error: "forbidden" };

  const match = await getMatch(duel.match_id);
  if (!match) return { ok: false, error: "not_found" };
  if (isMatchLocked(match.kickoffAt)) return { ok: false, error: "locked" };

  const lockDeadline = new Date(new Date(match.kickoffAt).getTime() - 5 * 60 * 1000).toISOString();
  const isChallenger = duel.challenger_id === userId;
  const update = isChallenger
    ? { challenger_home_score: homeScore, challenger_away_score: awayScore, locked_at: lockDeadline }
    : { opponent_home_score: homeScore, opponent_away_score: awayScore, locked_at: lockDeadline };

  const { error } = await sb.from("match_duels").update(update).eq("id", duelId);
  if (error) return { ok: false, error: "not_found" };
  return { ok: true };
}

// ── Resolution ──────────────────────────────────────────────────────────

export interface ResolvedMatchDuel {
  duelId: string;
  challengerId: string;
  opponentId: string;
  home: string;
  away: string;
  actualHome: number;
  actualAway: number;
  pointsChallenger: number;
  pointsOpponent: number;
}

// Called from the scores cron right after matches are marked finished, same
// hook point as resolveOracleDuels() — returns per-duel data (both sides,
// not just one userId) since a Match Duel push notification has to reach
// two people, not one. A side that never locked in a prediction before
// kickoff is graded 0 for that match — matches this codebase's existing
// precedent of scoring "make a pick or don't count".
export async function resolveMatchDuels(): Promise<ResolvedMatchDuel[]> {
  const sb = sbAdmin();
  const { data: unresolved } = await sb
    .from("match_duels")
    .select("id, challenger_id, opponent_id, match_id, challenger_home_score, challenger_away_score, opponent_home_score, opponent_away_score")
    .eq("status", "accepted")
    .is("resolved_at", null);
  if (!unresolved?.length) return [];

  const matchIds = [...new Set(unresolved.map(d => d.match_id))];
  const { data: matches } = await sb
    .from("matches")
    .select("id, status, home, away, home_score, away_score")
    .in("id", matchIds)
    .eq("status", "finished");

  const finishedById = new Map(
    (matches ?? [])
      .filter((m): m is { id: string; status: string; home: string; away: string; home_score: number; away_score: number } =>
        m.home_score != null && m.away_score != null)
      .map(m => [m.id, m])
  );
  if (!finishedById.size) return [];

  const resolved: ResolvedMatchDuel[] = [];
  const toResolve = unresolved.filter((d): d is typeof d & { opponent_id: string } => !!d.opponent_id && finishedById.has(d.match_id));
  await Promise.all(toResolve.map(d => {
    const m = finishedById.get(d.match_id)!;
    const pointsChallenger = d.challenger_home_score != null && d.challenger_away_score != null
      ? calcLivePoints({ homeScore: d.challenger_home_score, awayScore: d.challenger_away_score }, m.home_score, m.away_score).pts
      : 0;
    const pointsOpponent = d.opponent_home_score != null && d.opponent_away_score != null
      ? calcLivePoints({ homeScore: d.opponent_home_score, awayScore: d.opponent_away_score }, m.home_score, m.away_score).pts
      : 0;
    resolved.push({
      duelId: d.id, challengerId: d.challenger_id, opponentId: d.opponent_id,
      home: m.home, away: m.away, actualHome: m.home_score, actualAway: m.away_score,
      pointsChallenger, pointsOpponent,
    });
    return sb.from("match_duels")
      .update({ points_challenger: pointsChallenger, points_opponent: pointsOpponent, resolved_at: new Date().toISOString() })
      .eq("id", d.id);
  }));

  return resolved;
}

// ── Reads ──────────────────────────────────────────────────────────────

export interface MatchDuelSummary {
  id: string;
  status: MatchDuelStatus;
  direction: "sent" | "received" | "invite";
  match: MatchDuelMatchInfo;
  opponent: { id: string; name: string; avatarUrl: string | null } | null; // null while an invite is still unclaimed
  inviteToken: string | null; // set only while unclaimed, so the challenger can re-share the link
  myScore: { home: number; away: number } | null;
  theirScore: { home: number; away: number } | null;
  pointsMe: number | null;
  pointsThem: number | null;
  winner: "me" | "them" | "tie" | null;
}

function decideWinner(pointsMe: number | null, pointsThem: number | null): "me" | "them" | "tie" | null {
  if (pointsMe == null || pointsThem == null) return null;
  if (pointsMe > pointsThem) return "me";
  if (pointsMe < pointsThem) return "them";
  return "tie";
}

export async function listMyMatchDuels(userId: string, limit = 10): Promise<MatchDuelSummary[]> {
  const sb = sbAdmin();
  const { data: rows } = await sb
    .from("match_duels")
    .select("id, challenger_id, opponent_id, match_id, status, invite_token, challenger_home_score, challenger_away_score, opponent_home_score, opponent_away_score, points_challenger, points_opponent")
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!rows?.length) return [];

  const matchIds = [...new Set(rows.map(r => r.match_id))];
  const otherIds = [...new Set(
    rows.map(r => (r.challenger_id === userId ? r.opponent_id : r.challenger_id)).filter((id): id is string => !!id)
  )];

  const [{ data: matchRows }, { data: profileRows }] = await Promise.all([
    sb.from("matches").select(MATCH_COLS).in("id", matchIds),
    otherIds.length ? sb.from("profiles").select("id, name, avatar_url").in("id", otherIds) : Promise.resolve({ data: [] as never[] }),
  ]);
  const matchById = new Map(((matchRows ?? []) as MatchRow[]).map(m => [m.id, toMatchInfo(m)]));
  const profileById = new Map(((profileRows ?? []) as Array<{ id: string; name: string; avatar_url: string | null }>).map(p => [p.id, p]));

  return rows
    .map(r => {
      const match = matchById.get(r.match_id);
      if (!match) return null;
      const isChallenger = r.challenger_id === userId;
      const otherId = isChallenger ? r.opponent_id : r.challenger_id;
      const otherProfile = otherId ? profileById.get(otherId) ?? null : null;

      const myScore = isChallenger
        ? (r.challenger_home_score != null ? { home: r.challenger_home_score, away: r.challenger_away_score! } : null)
        : (r.opponent_home_score != null ? { home: r.opponent_home_score, away: r.opponent_away_score! } : null);
      const theirScore = isChallenger
        ? (r.opponent_home_score != null ? { home: r.opponent_home_score, away: r.opponent_away_score! } : null)
        : (r.challenger_home_score != null ? { home: r.challenger_home_score, away: r.challenger_away_score! } : null);
      const pointsMe = isChallenger ? r.points_challenger : r.points_opponent;
      const pointsThem = isChallenger ? r.points_opponent : r.points_challenger;

      return {
        id: r.id,
        status: r.status as MatchDuelStatus,
        direction: !otherId ? "invite" : isChallenger ? "sent" : "received",
        match,
        opponent: otherProfile ? { id: otherProfile.id, name: otherProfile.name, avatarUrl: otherProfile.avatar_url } : null,
        inviteToken: !otherId ? r.invite_token : null,
        myScore,
        theirScore,
        pointsMe,
        pointsThem,
        winner: decideWinner(pointsMe, pointsThem),
      } satisfies MatchDuelSummary;
    })
    .filter((s): s is MatchDuelSummary => s !== null);
}

export async function getMyMatchDuel(userId: string, duelId: string): Promise<MatchDuelSummary | null> {
  const all = await listMyMatchDuels(userId, 500);
  return all.find(d => d.id === duelId) ?? null;
}

