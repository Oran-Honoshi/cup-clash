/**
 * Trivia service — loads scores from Supabase and determines the champion.
 * Champion = Max(correct_count), tie-broken by Min(total_time_ms).
 * If still tied → multiple champions, all get the badge.
 */

import type { TriviaScore } from "@/components/trivia/trivia-leaderboard";

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getTriviaScores(groupId: string): Promise<TriviaScore[]> {
  const sb = getSupabaseClient();
  if (!sb) return getMockScores();

  try {
    const { data: scores } = await sb
      .from("trivia_scores")
      .select("user_id, score, correct_count, total_questions, total_time_ms")
      .eq("group_id", groupId)
      .eq("mode", "points");

    if (!scores || scores.length === 0) return [];

    // Fetch profiles for names/avatars
    const userIds = (scores as Array<{ user_id: string }>).map(s => s.user_id);
    const { data: profiles } = await sb
      .from("profiles")
      .select("id, name, country, avatar_url")
      .in("id", userIds);

    const profileMap: Record<string, { name: string; country: string; avatar_url: string | null }> = {};
    if (profiles) {
      (profiles as Array<{ id: string; name: string; country: string; avatar_url: string | null }>)
        .forEach(p => { profileMap[p.id] = p; });
    }

    // Determine champion(s): max score, then min time
    const typed = scores as Array<{
      user_id: string; score: number; correct_count: number;
      total_questions: number; total_time_ms: number;
    }>;

    const maxCorrect = Math.max(...typed.map(s => s.correct_count));
    const fastestTime = Math.min(
      ...typed.filter(s => s.correct_count === maxCorrect).map(s => s.total_time_ms)
    );

    return typed.map(s => {
      const profile = profileMap[s.user_id];
      const isChampion = s.correct_count === maxCorrect && s.total_time_ms === fastestTime;
      return {
        userId: s.user_id,
        name: profile?.name ?? "Unknown",
        country: profile?.country ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        correct: s.correct_count,
        total: s.total_questions,
        totalTimeMs: s.total_time_ms,
        isChampion,
      };
    });
  } catch (e) {
    console.warn("getTriviaScores error:", e);
    return getMockScores();
  }
}

/**
 * After all members play, update champion badges in the DB.
 */
export async function updateChampionBadges(groupId: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  try {
    const scores = await getTriviaScores(groupId);
    const championIds = scores.filter(s => s.isChampion).map(s => s.userId);

    // Clear all existing champion badges for this group
    await sb.from("group_members")
      .update({ is_trivia_champion: false } as Record<string, boolean>)
      .eq("group_id", groupId);

    // Set new champion badges
    if (championIds.length > 0) {
      await Promise.all(championIds.map(userId =>
        sb.from("group_members")
          .update({ is_trivia_champion: true } as Record<string, boolean>)
          .eq("group_id", groupId)
          .eq("user_id", userId)
      ));
    }
  } catch (e) {
    console.warn("updateChampionBadges error:", e);
  }
}

function getMockScores(): TriviaScore[] {
  return [
    { userId: "1", name: "Amit",  country: "Argentina", correct: 18, total: 20, totalTimeMs: 62000, isChampion: true,  avatarUrl: null },
    { userId: "2", name: "Sarah", country: "Brazil",    correct: 15, total: 20, totalTimeMs: 78000, isChampion: false, avatarUrl: null },
    { userId: "3", name: "John",  country: "England",   correct: 14, total: 20, totalTimeMs: 95000, isChampion: false, avatarUrl: null },
  ];
}
