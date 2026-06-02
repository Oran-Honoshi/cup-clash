import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 503 });
  }

  const sb = sbAdmin();

  // 1. Find matches kicking off in the next hour that are still upcoming
  const { data: matches } = await sb
    .from("matches")
    .select("id, home, away")
    .eq("status", "upcoming")
    .gt("kickoff_at",  new Date().toISOString())
    .lte("kickoff_at", new Date(Date.now() + 60 * 60 * 1000).toISOString());

  if (!matches?.length) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: "no upcoming matches in window" });
  }

  let sent    = 0;
  let skipped = 0;

  for (const match of matches as Array<{ id: string; home: string; away: string }>) {
    // 2. Find group_members who can predict and are in a group covering this tournament match
    //    (tournament groups — not single_match groups for different matches)
    const { data: members } = await sb
      .from("group_members")
      .select(`
        user_id,
        groups!inner ( id, group_type ),
        profiles!inner ( telegram_chat_id )
      `)
      .eq("can_predict", true)
      .eq("groups.group_type", "tournament");

    if (!members?.length) continue;

    type MemberRow = {
      user_id:  string;
      groups:   { id: string; group_type: string };
      profiles: { telegram_chat_id: string | null };
    };

    const eligible = (members as unknown as MemberRow[]).filter(
      m => m.profiles?.telegram_chat_id
    );

    if (!eligible.length) continue;

    // 3. Find who has already predicted this match
    const userIds = eligible.map(m => m.user_id);
    const { data: existingPreds } = await sb
      .from("group_predictions")
      .select("user_id")
      .eq("match_id", match.id)
      .in("user_id",  userIds);

    const predictedSet = new Set(
      (existingPreds as Array<{ user_id: string }> ?? []).map(p => p.user_id)
    );

    // 4. Send reminders to those who haven't predicted
    for (const member of eligible) {
      if (predictedSet.has(member.user_id)) { skipped++; continue; }

      const groupId = member.groups.id;
      const text =
        `⚽ <b>${match.home} vs ${match.away}</b> kicks off in less than 1 hour!\n\n` +
        `You haven't predicted yet.\n` +
        `👉 <a href="https://cupclash.live/dashboard?group=${groupId}">Submit your prediction</a>`;

      const ok = await sendTelegram(member.profiles.telegram_chat_id!, text);
      if (ok) sent++; else skipped++;
    }
  }

  return NextResponse.json({ sent, skipped });
}
