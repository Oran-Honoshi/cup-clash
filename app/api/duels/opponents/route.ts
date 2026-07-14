export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { searchOpponents } from "@/lib/services/duels";

export async function GET(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q");
  const result = await searchOpponents(sbAdmin(), user.id, q);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
