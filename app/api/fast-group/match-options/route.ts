// Backs the Fast Group creation screen's match picker: the popular
// auto-pick default plus a real cross-competition match list for the
// manual override. Read-only, no auth required (same data any signed-out
// visitor could see on /schedule) — just a GET wrapper around
// lib/services/matches.ts functions, since those use the server-only
// Supabase clients and this page is a client component.

import { NextResponse } from "next/server";
import { getFastGroupMatchOptions, getMostPopularUpcomingMatch } from "@/lib/services/matches";

export async function GET() {
  const [popular, options] = await Promise.all([
    getMostPopularUpcomingMatch(),
    getFastGroupMatchOptions(),
  ]);
  return NextResponse.json({ popular, options });
}
