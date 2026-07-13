export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { getGroupTitles } from "@/lib/services/group-titles";

// Group Titles ("The Oracle" / "The Inverter") — computed live from
// group_predictions on every request, never persisted (see
// lib/services/group-titles.ts for why).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = sbAdmin();
  const titles = await getGroupTitles(sb, params.id);
  return NextResponse.json({ titles }, { headers: { "Cache-Control": "no-store" } });
}
