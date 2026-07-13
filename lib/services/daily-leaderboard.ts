import type { SupabaseClient } from "@supabase/supabase-js";

// Daily Challenge leaderboards — global and per-group share this exact
// ranking logic (they differ only in which user_ids are included), so
// there's one comparator instead of two copies that could drift apart.

export type DailyLeaderboardRow = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  solved: boolean;
  guessCount: number;
  timeMs: number | null;
};

function compareDaily(a: DailyLeaderboardRow, b: DailyLeaderboardRow): number {
  if (a.solved !== b.solved) return a.solved ? -1 : 1;
  if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
  const at = a.timeMs ?? Infinity;
  const bt = b.timeMs ?? Infinity;
  return at - bt;
}

type AttemptWithProfile = {
  user_id: string;
  guess_count: number;
  solved: boolean;
  created_at: string;
  completed_at: string | null;
  profiles: { name: string; avatar_url: string | null } | { name: string; avatar_url: string | null }[];
};

function toRow(a: AttemptWithProfile): DailyLeaderboardRow {
  const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
  const timeMs = a.completed_at ? new Date(a.completed_at).getTime() - new Date(a.created_at).getTime() : null;
  return {
    userId: a.user_id,
    name: profile?.name ?? "Player",
    avatarUrl: profile?.avatar_url ?? null,
    solved: a.solved,
    guessCount: a.guess_count,
    timeMs,
  };
}

// scope: pass memberIds to restrict to a group's members; omit for global.
export async function getDailyLeaderboard(
  sb: SupabaseClient,
  challengeId: string,
  memberIds?: string[]
): Promise<DailyLeaderboardRow[]> {
  let query = sb
    .from("daily_challenge_attempts")
    .select("user_id, guess_count, solved, created_at, completed_at, profiles!inner ( name, avatar_url )")
    .eq("challenge_id", challengeId);
  if (memberIds) query = query.in("user_id", memberIds);

  const { data } = await query;
  return ((data ?? []) as unknown as AttemptWithProfile[]).map(toRow).sort(compareDaily);
}

export type AllTimeLeaderboardRow = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  solvedCount: number;
  avgGuesses: number | null;
  avgTimeMs: number | null;
};

function compareAllTime(a: AllTimeLeaderboardRow, b: AllTimeLeaderboardRow): number {
  if (a.solvedCount !== b.solvedCount) return b.solvedCount - a.solvedCount;
  const ag = a.avgGuesses ?? Infinity;
  const bg = b.avgGuesses ?? Infinity;
  if (ag !== bg) return ag - bg;
  const at = a.avgTimeMs ?? Infinity;
  const bt = b.avgTimeMs ?? Infinity;
  return at - bt;
}

export async function getAllTimeLeaderboard(
  sb: SupabaseClient,
  memberIds?: string[]
): Promise<AllTimeLeaderboardRow[]> {
  let query = sb
    .from("daily_challenge_attempts")
    .select("user_id, guess_count, solved, created_at, completed_at, profiles!inner ( name, avatar_url )");
  if (memberIds) query = query.in("user_id", memberIds);

  const { data } = await query;
  const rows = (data ?? []) as unknown as AttemptWithProfile[];

  const byUser = new Map<string, { name: string; avatarUrl: string | null; solved: number; guesses: number[]; times: number[] }>();
  for (const a of rows) {
    const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
    const entry = byUser.get(a.user_id) ?? { name: profile?.name ?? "Player", avatarUrl: profile?.avatar_url ?? null, solved: 0, guesses: [], times: [] };
    if (a.solved) {
      entry.solved += 1;
      entry.guesses.push(a.guess_count);
      if (a.completed_at) entry.times.push(new Date(a.completed_at).getTime() - new Date(a.created_at).getTime());
    }
    byUser.set(a.user_id, entry);
  }

  const avg = (nums: number[]) => (nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : null);

  return [...byUser.entries()]
    .map(([userId, e]) => ({
      userId,
      name: e.name,
      avatarUrl: e.avatarUrl,
      solvedCount: e.solved,
      avgGuesses: avg(e.guesses),
      avgTimeMs: avg(e.times),
    }))
    .sort(compareAllTime);
}
