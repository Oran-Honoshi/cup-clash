import { createClient } from "@/lib/supabase/client";
import { touchAnonLastSeen } from "@/lib/reengagement-storage";

const GAP_MS = 30 * 60 * 1000;

export type ReengagementResult =
  | { kind: "non-member"; hasFollows: boolean }
  | { kind: "group-member"; matchLabel: string; groups: Array<{ groupId: string; groupName: string; rank: number }> };

// Pure eligibility check, extracted so the nudge coordinator can call it exactly
// once per session — /api/reengagement/check resets profiles.last_seen_at as a
// side effect on every call, so this must never be invoked speculatively/twice.
export async function checkReengagement(): Promise<ReengagementResult | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    const previous = touchAnonLastSeen();
    if (!previous) return null;
    if (Date.now() - new Date(previous).getTime() < GAP_MS) return null;
    return { kind: "non-member", hasFollows: false };
  }

  const res = await fetch("/api/reengagement/check", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json() as
    | { eligible: false }
    | { eligible: true; persona: "following-no-group"; hasFollows: boolean }
    | { eligible: true; persona: "group-member"; matchLabel: string; groups: Array<{ groupId: string; groupName: string; rank: number }> };

  if (!data.eligible) return null;
  if (data.persona === "following-no-group") return { kind: "non-member", hasFollows: data.hasFollows };
  return { kind: "group-member", matchLabel: data.matchLabel, groups: data.groups };
}
