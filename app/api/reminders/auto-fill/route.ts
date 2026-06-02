import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = sbAdmin();

  // 1. Find matches in the 6–11 minute window before kickoff (safe before the 5-min lock fires)
  const now    = new Date();
  const from   = new Date(now.getTime() +  6 * 60 * 1000).toISOString();
  const until  = new Date(now.getTime() + 11 * 60 * 1000).toISOString();

  const { data: matches } = await sb
    .from("matches")
    .select("id, home, away")
    .eq("status", "upcoming")
    .gt("kickoff_at",  from)
    .lte("kickoff_at", until);

  if (!matches?.length) {
    return NextResponse.json({ filled: 0, skipped: 0, reason: "no matches in window" });
  }

  let filled  = 0;
  let skipped = 0;

  for (const match of matches as Array<{ id: string; home: string; away: string }>) {
    // 2. Find group members who can predict, have auto_fill_enabled, and are in tournament groups
    const { data: members } = await sb
      .from("group_members")
      .select(`
        user_id,
        groups!inner ( id, group_type ),
        profiles!inner ( auto_fill_enabled, auto_fill_home, auto_fill_away )
      `)
      .eq("can_predict", true)
      .eq("groups.group_type", "tournament");

    if (!members?.length) continue;

    type MemberRow = {
      user_id:  string;
      groups:   { id: string; group_type: string };
      profiles: { auto_fill_enabled: boolean; auto_fill_home: number; auto_fill_away: number };
    };

    const eligible = (members as unknown as MemberRow[]).filter(
      m => m.profiles?.auto_fill_enabled === true
    );

    if (!eligible.length) continue;

    // 3. Find who already has a prediction for this match
    const userIds = eligible.map(m => m.user_id);
    const { data: existing } = await sb
      .from("group_predictions")
      .select("user_id, group_id")
      .eq("match_id", match.id)
      .in("user_id",  userIds);

    const predictedSet = new Set(
      (existing as Array<{ user_id: string; group_id: string }> ?? [])
        .map(p => `${p.user_id}::${p.group_id}`)
    );

    // 4. Insert auto-fill predictions for those who haven't predicted yet
    const inserts = eligible
      .filter(m => !predictedSet.has(`${m.user_id}::${m.groups.id}`))
      .map(m => ({
        user_id:       m.user_id,
        group_id:      m.groups.id,
        match_id:      match.id,
        home_score:    m.profiles.auto_fill_home,
        away_score:    m.profiles.auto_fill_away,
        locked_at:     null,
        points_earned: 0,
        is_exact:      false,
        updated_at:    now.toISOString(),
      }));

    if (!inserts.length) { skipped += eligible.length; continue; }

    // ON CONFLICT DO NOTHING — never overwrite a real prediction
    const { error, data: inserted } = await sb
      .from("group_predictions")
      .upsert(inserts, { onConflict: "user_id,group_id,match_id", ignoreDuplicates: true })
      .select("user_id");

    filled  += (inserted ?? []).length;
    skipped += eligible.length - inserts.length;

    if (error) {
      console.error(`auto-fill error for match ${match.id}:`, error.message);
    }
  }

  return NextResponse.json({ filled, skipped });
}
