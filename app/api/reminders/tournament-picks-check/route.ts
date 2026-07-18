export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { getEffectiveTournamentLockAt } from "@/lib/services/tournament-lock";

export interface IncompleteTournamentGroup {
  groupId:   string;
  groupName: string;
  missing:   Array<"winner" | "top_scorer" | "top_assister">;
}

// Powers the persistent tournament-picks nag (components/reminders/
// tournament-picks-nag.tsx) on Home and a group's Predictions sub-sector.
// Scoped to exactly the three picks named in the brief (winner/top scorer/
// top assister) — golden ball/best defence/etc. are optional house-rules
// add-ons, not part of this nag. A group only nags while it's actually
// enabled for a given pick AND not yet locked, using the group's real lock
// time (see getEffectiveTournamentLockAt) instead of a hardcoded WC date.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ groups: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const admin = sbAdmin();

  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id, groups!inner ( id, name, group_type, competition_id )")
    .eq("user_id", user.id)
    .eq("groups.group_type", "tournament");

  type Row = { group_id: string; groups: { id: string; name: string; group_type: string; competition_id: string | null } };
  const groups = ((memberships ?? []) as unknown as Row[]).map(m => m.groups);
  if (!groups.length) {
    return NextResponse.json({ groups: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const result: IncompleteTournamentGroup[] = [];

  for (const group of groups) {
    const lockAt = await getEffectiveTournamentLockAt(admin, group.id, group.competition_id);
    if (lockAt && new Date(lockAt).getTime() <= Date.now()) continue; // already locked — no nag

    const { data: rulesRow } = await admin
      .from("scoring_rules")
      .select("enable_winner, enable_scorer, enable_assister")
      .eq("group_id", group.id)
      .maybeSingle();
    const rules = rulesRow as { enable_winner: boolean; enable_scorer: boolean; enable_assister: boolean } | null;
    const enableWinner   = rules?.enable_winner   ?? true;
    const enableScorer   = rules?.enable_scorer   ?? true;
    const enableAssister = rules?.enable_assister ?? true;
    if (!enableWinner && !enableScorer && !enableAssister) continue;

    const { data: predsData } = await admin
      .from("group_predictions")
      .select("pred_type")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .in("pred_type", ["winner", "top_scorer", "top_assister"]);
    const done = new Set((predsData as Array<{ pred_type: string }> ?? []).map(p => p.pred_type));

    const missing: IncompleteTournamentGroup["missing"] = [];
    if (enableWinner   && !done.has("winner"))       missing.push("winner");
    if (enableScorer   && !done.has("top_scorer"))   missing.push("top_scorer");
    if (enableAssister && !done.has("top_assister")) missing.push("top_assister");

    if (missing.length) result.push({ groupId: group.id, groupName: group.name, missing });
  }

  return NextResponse.json({ groups: result }, { headers: { "Cache-Control": "no-store" } });
}
