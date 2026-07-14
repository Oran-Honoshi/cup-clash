export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { respondToDuel } from "@/lib/services/duels";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { action?: "accept" | "decline" } | null;
  if (body?.action !== "accept" && body?.action !== "decline") {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }

  const result = await respondToDuel(sbAdmin(), user.id, params.id, body.action);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : result.error === "forbidden" ? 403 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
