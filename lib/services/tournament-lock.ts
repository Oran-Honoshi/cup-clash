import type { SupabaseClient } from "@supabase/supabase-js";
import { WORLD_CUP_STAGE_LIST } from "@/lib/schedule";

const LOCK_BEFORE_MS = 5 * 60 * 1000;

// Mirrors scripts/create-house-group.ts's LOCK_BEFORE_MS derivation so every
// group — not just ones created through that script — locks tournament
// picks 5 min before its OWN first match (scoped via competition_id, same
// null-means-World-Cup convention as matchInGroupScope) instead of falling
// back to tournament-picks.tsx's hardcoded WC2026 default date, which is
// wrong for any non-World-Cup group without an explicit scoring_rules row.
// scoring_rules.tournament_lock_at (admin/script-set) always wins when present.
export async function getEffectiveTournamentLockAt(
  sb: SupabaseClient,
  groupId: string,
  groupCompetitionId: string | null
): Promise<string | null> {
  const { data: rules } = await sb
    .from("scoring_rules")
    .select("tournament_lock_at")
    .eq("group_id", groupId)
    .maybeSingle();
  const explicit = (rules as { tournament_lock_at: string | null } | null)?.tournament_lock_at;
  if (explicit) return explicit;

  let query = sb.from("matches").select("kickoff_at").order("kickoff_at", { ascending: true }).limit(1);
  query = groupCompetitionId
    ? query.eq("competition_id", groupCompetitionId)
    : query.in("stage", WORLD_CUP_STAGE_LIST);
  const { data: firstMatch } = await query.maybeSingle();
  const kickoffAt = (firstMatch as { kickoff_at: string } | null)?.kickoff_at;
  if (!kickoffAt) return null;

  return new Date(new Date(kickoffAt).getTime() - LOCK_BEFORE_MS).toISOString();
}
