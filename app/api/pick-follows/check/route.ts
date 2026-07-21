export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFollowCount } from "@/lib/services/follows";

interface PickFollowsCheckResponse {
  eligible: boolean;
}

// Powers the pick-your-follows nudge (components/home/pick-follows-nudge-sheet.tsx).
// Mirrors the other nudge check routes (reengagement, house-groups, oracle-duels)
// so the nudge coordinator (lib/nudges/registry.ts) can resolve all four the same way.
export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ eligible: false } satisfies PickFollowsCheckResponse, { headers: { "Cache-Control": "no-store" } });
  }

  const followCount = await getFollowCount(user.id);
  return NextResponse.json(
    { eligible: followCount === 0 } satisfies PickFollowsCheckResponse,
    { headers: { "Cache-Control": "no-store" } }
  );
}
