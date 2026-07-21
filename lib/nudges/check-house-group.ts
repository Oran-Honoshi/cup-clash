import { createClient } from "@/lib/supabase/client";

export interface HouseGroupNudgeResult {
  groupId: string;
  groupName: string;
  memberCount: number;
}

// Pure eligibility check, extracted so the nudge coordinator can call it once
// per session alongside the other three nudges' checks.
export async function checkHouseGroupInvite(): Promise<HouseGroupNudgeResult | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const res = await fetch("/api/house-groups/check", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json() as
    | { eligible: false }
    | { eligible: true; group: { id: string; name: string; memberCount: number } };

  if (!data.eligible) return null;
  return { groupId: data.group.id, groupName: data.group.name, memberCount: data.group.memberCount };
}
