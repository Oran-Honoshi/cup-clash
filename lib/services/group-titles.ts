import type { SupabaseClient } from "@supabase/supabase-js";

// Dynamic, contestable Group Titles — computed live from group_predictions
// on every read, never persisted. This deliberately mirrors the trivia
// leaderboard's champion-badge pattern (lib/services/trivia.ts) rather than
// the group_members.is_trivia_champion column that pattern replaced: that
// column was written by a function nothing ever calls, so it silently
// drifted out of sync. A title held in a column can go stale; a title
// computed at render time cannot.
//
// Scope is "everything in group_predictions for this group" — there's no
// group→competition link yet (groups aren't scoped to a tournament in the
// schema), so this is effectively "current tournament" for how the app is
// used today. Revisit once groups gain a competition_id.

export type GroupTitle = "oracle" | "inverter";

export type GroupTitleHolder = {
  title: GroupTitle;
  userId: string;
  value: number; // exact-score count for Oracle, total points for Inverter
};

export async function getGroupTitles(sb: SupabaseClient, groupId: string): Promise<GroupTitleHolder[]> {
  const { data } = await sb
    .from("group_predictions")
    .select("user_id, points_earned, is_exact")
    .eq("group_id", groupId);

  const rows = (data ?? []) as { user_id: string; points_earned: number | null; is_exact: boolean | null }[];
  if (rows.length === 0) return [];

  const byUser = new Map<string, { points: number; exact: number }>();
  for (const row of rows) {
    const entry = byUser.get(row.user_id) ?? { points: 0, exact: 0 };
    entry.points += row.points_earned ?? 0;
    if (row.is_exact) entry.exact += 1;
    byUser.set(row.user_id, entry);
  }

  // Only members who've submitted at least one prediction are eligible —
  // otherwise an inactive member trivially "wins" The Inverter with zero
  // predictions ever made. Tie-broken by userId for a stable, deterministic
  // holder (so the title only visibly changes when someone actually takes
  // the lead, not on every re-render of a tied score).
  const entries = [...byUser.entries()].sort(([a], [b]) => a.localeCompare(b));

  const oracle = entries.reduce<[string, { points: number; exact: number }] | null>(
    (best, cur) => (!best || cur[1].exact > best[1].exact ? cur : best),
    null
  );
  const inverter = entries.reduce<[string, { points: number; exact: number }] | null>(
    (worst, cur) => (!worst || cur[1].points < worst[1].points ? cur : worst),
    null
  );

  const titles: GroupTitleHolder[] = [];
  if (oracle && oracle[1].exact > 0) titles.push({ title: "oracle", userId: oracle[0], value: oracle[1].exact });
  if (inverter) titles.push({ title: "inverter", userId: inverter[0], value: inverter[1].points });
  return titles;
}
