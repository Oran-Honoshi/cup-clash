export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getPersonalAccuracyHistory } from "@/lib/services/personal-accuracy";

export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const history = await getPersonalAccuracyHistory(sbAdmin(), user.id);
  return NextResponse.json(history, { headers: { "Cache-Control": "no-store" } });
}
