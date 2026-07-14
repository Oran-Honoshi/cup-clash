import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateTodayChallenge, todayISO } from "@/lib/services/daily-challenge";

// 1v1 Daily Duel — a same-day, single-puzzle head-to-head on that day's
// Daily Challenge (guess_footballer/guess_club). Distinct from Rival
// Tracker's persistent season-long tracking (migration 053). No result
// columns are stored on daily_duels — everything is computed on read by
// joining both participants' daily_challenge_attempts rows for today.

export type DuelStatus = "pending" | "accepted" | "declined";

export interface DuelParticipantResult {
  attempted: boolean;
  solved: boolean;
  guessCount: number;
  completedAt: string | null;
}

export interface DuelSummary {
  id: string;
  challengeDate: string;
  status: DuelStatus;
  direction: "sent" | "received";
  opponent: { id: string; name: string; avatarUrl: string | null };
  me: DuelParticipantResult;
  opponentResult: DuelParticipantResult;
  // "me" | "opponent" | "tie" once both have finished today's puzzle, null while pending.
  winner: "me" | "opponent" | "tie" | null;
}

async function getAttemptSummary(sb: SupabaseClient, userId: string, challengeId: string): Promise<DuelParticipantResult> {
  const { data } = await sb
    .from("daily_challenge_attempts")
    .select("solved, guess_count, completed_at")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .maybeSingle();
  if (!data) return { attempted: false, solved: false, guessCount: 0, completedAt: null };
  return { attempted: true, solved: data.solved, guessCount: data.guess_count, completedAt: data.completed_at };
}

// Fewer guesses wins; a solve always beats a non-solve; equal guess counts
// are broken by whoever finished first. "Time" is completion order, not
// elapsed solve duration — no puzzle-start timestamp exists in this schema.
function decideWinner(me: DuelParticipantResult, opponent: DuelParticipantResult): DuelSummary["winner"] {
  if (!me.completedAt || !opponent.completedAt) return null;
  if (me.solved && !opponent.solved) return "me";
  if (!me.solved && opponent.solved) return "opponent";
  if (!me.solved && !opponent.solved) return "tie";
  if (me.guessCount !== opponent.guessCount) return me.guessCount < opponent.guessCount ? "me" : "opponent";
  if (me.completedAt !== opponent.completedAt) return me.completedAt < opponent.completedAt ? "me" : "opponent";
  return "tie";
}

export async function listMyDuelsToday(sb: SupabaseClient, userId: string): Promise<DuelSummary[]> {
  const today = todayISO();
  const { data: rows } = await sb
    .from("daily_duels")
    .select("id, challenger_id, opponent_id, challenge_date, status")
    .eq("challenge_date", today)
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (!rows || rows.length === 0) return [];

  const otherIds = rows.map(r => (r.challenger_id === userId ? r.opponent_id : r.challenger_id) as string);
  const { data: profiles } = await sb.from("profiles").select("id, name, avatar_url").in("id", otherIds);
  const profileMap = new Map(((profiles ?? []) as Array<{ id: string; name: string; avatar_url: string | null }>).map(p => [p.id, p]));

  const challenge = await getOrCreateTodayChallenge(sb);
  const EMPTY: DuelParticipantResult = { attempted: false, solved: false, guessCount: 0, completedAt: null };

  const summaries: DuelSummary[] = [];
  for (const row of rows as Array<{ id: string; challenger_id: string; opponent_id: string; challenge_date: string; status: DuelStatus }>) {
    const isChallenger = row.challenger_id === userId;
    const otherId = isChallenger ? row.opponent_id : row.challenger_id;
    const profile = profileMap.get(otherId);
    const [me, opponentResult] = row.status === "accepted"
      ? await Promise.all([getAttemptSummary(sb, userId, challenge.id), getAttemptSummary(sb, otherId, challenge.id)])
      : [EMPTY, EMPTY];
    summaries.push({
      id: row.id,
      challengeDate: row.challenge_date,
      status: row.status,
      direction: isChallenger ? "sent" : "received",
      opponent: { id: otherId, name: profile?.name ?? "Player", avatarUrl: profile?.avatar_url ?? null },
      me,
      opponentResult,
      winner: row.status === "accepted" ? decideWinner(me, opponentResult) : null,
    });
  }
  return summaries;
}

export type CreateDuelResult =
  | { ok: true; duelId: string; status: DuelStatus }
  | { ok: false; error: "self" | "not_found" };

export async function createDuel(sb: SupabaseClient, challengerId: string, opponentId: string): Promise<CreateDuelResult> {
  if (challengerId === opponentId) return { ok: false, error: "self" };

  const { data: opponentProfile } = await sb.from("profiles").select("id").eq("id", opponentId).maybeSingle();
  if (!opponentProfile) return { ok: false, error: "not_found" };

  const today = todayISO();
  const { data: created, error } = await sb
    .from("daily_duels")
    .insert({ challenger_id: challengerId, opponent_id: opponentId, challenge_date: today })
    .select("id, status")
    .single();
  if (!error && created) return { ok: true, duelId: created.id, status: created.status };

  // Unique violation on the unordered-pair index — a duel already exists
  // for this pair today (either direction); return that one instead.
  const { data: existing } = await sb
    .from("daily_duels")
    .select("id, status")
    .eq("challenge_date", today)
    .or(`and(challenger_id.eq.${challengerId},opponent_id.eq.${opponentId}),and(challenger_id.eq.${opponentId},opponent_id.eq.${challengerId})`)
    .maybeSingle();
  if (existing) return { ok: true, duelId: existing.id, status: existing.status };
  return { ok: false, error: "not_found" };
}

export async function respondToDuel(
  sb: SupabaseClient,
  userId: string,
  duelId: string,
  action: "accept" | "decline"
): Promise<{ ok: boolean; error?: "not_found" | "forbidden" | "not_pending" }> {
  const { data: duel } = await sb.from("daily_duels").select("id, opponent_id, status").eq("id", duelId).maybeSingle();
  if (!duel) return { ok: false, error: "not_found" };
  if (duel.opponent_id !== userId) return { ok: false, error: "forbidden" };
  if (duel.status !== "pending") return { ok: false, error: "not_pending" };

  const { error } = await sb
    .from("daily_duels")
    .update({ status: action === "accept" ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", duelId);
  return { ok: !error };
}

export interface OpponentOption { id: string; name: string; avatarUrl: string | null }

// "Any user" (name search) or "from a shared group" (quick-pick), per the
// duel design — group-mates are always listed; search only kicks in once
// the caller has typed enough to matter.
export async function searchOpponents(sb: SupabaseClient, userId: string, q: string | null): Promise<{ groupMates: OpponentOption[]; searchResults: OpponentOption[] }> {
  const { data: memberships } = await sb.from("group_members").select("group_id").eq("user_id", userId);
  const groupIds = ((memberships ?? []) as Array<{ group_id: string }>).map(m => m.group_id);

  let groupMates: OpponentOption[] = [];
  if (groupIds.length > 0) {
    const { data: mates } = await sb
      .from("group_members")
      .select("user_id, profiles(id, name, avatar_url)")
      .in("group_id", groupIds)
      .neq("user_id", userId);
    type MateRow = { user_id: string; profiles: { id: string; name: string; avatar_url: string | null } | { id: string; name: string; avatar_url: string | null }[] };
    const seen = new Set<string>();
    for (const m of ((mates ?? []) as unknown as MateRow[])) {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        groupMates.push({ id: p.id, name: p.name, avatarUrl: p.avatar_url });
      }
    }
  }

  let searchResults: OpponentOption[] = [];
  const trimmed = q?.trim() ?? "";
  if (trimmed.length >= 2) {
    const { data } = await sb
      .from("profiles")
      .select("id, name, avatar_url")
      .ilike("name", `%${trimmed}%`)
      .neq("id", userId)
      .limit(15);
    searchResults = ((data ?? []) as Array<{ id: string; name: string; avatar_url: string | null }>).map(p => ({ id: p.id, name: p.name, avatarUrl: p.avatar_url }));
  }

  return { groupMates, searchResults };
}
