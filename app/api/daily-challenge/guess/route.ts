export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sbAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getPlayerEnrichment } from "@/lib/services/wikidata";
import { postSystemMessage } from "@/lib/services/group-chat";
import { TRANSLATIONS, interpolate, type Locale } from "@/lib/i18n";
import {
  getOrCreateTodayChallenge,
  getClueState,
  isCorrectGuess,
  recordGuess,
  TRY_LIMIT,
} from "@/lib/services/daily-challenge";

async function buildReveal(admin: ReturnType<typeof sbAdmin>, challenge: { game_type: string; answer_player_id: string | null; answer_team_id: string | null }, cookieLocale: Locale | undefined) {
  if (challenge.game_type === "guess_club") {
    const { data: team } = await admin
      .from("teams")
      .select("name, badge_url")
      .eq("id", challenge.answer_team_id)
      .maybeSingle();
    let facts: string[] = [];
    const { data: standing } = await admin
      .from("standings")
      .select("competition_id")
      .eq("team_id", challenge.answer_team_id)
      .maybeSingle();
    if (standing?.competition_id) {
      const { data: competition } = await admin
        .from("competitions")
        .select("name")
        .eq("id", standing.competition_id)
        .maybeSingle();
      if (competition?.name) {
        const t = TRANSLATIONS[cookieLocale && cookieLocale in TRANSLATIONS ? cookieLocale : "en"];
        facts = [interpolate(t.dc_club_reveal_fact_league, { league: competition.name })];
      }
    }
    return {
      fullName: team?.name ?? null,
      photoUrl: team?.badge_url ?? null,
      photoAttribution: null,
      facts,
    };
  }

  const { data: player } = await admin
    .from("players")
    .select("full_name, photo, country")
    .eq("id", challenge.answer_player_id)
    .maybeSingle();
  const enrichment = player
    ? await getPlayerEnrichment(admin, challenge.answer_player_id as string, player.full_name, player.country)
    : null;
  return {
    fullName: player?.full_name ?? null,
    photoUrl: enrichment?.photoUrl ?? player?.photo ?? null,
    photoAttribution: enrichment?.photoAttribution ?? null,
    facts: enrichment?.facts ?? [],
  };
}

// Works for anonymous and signed-in guessers alike — the answer is never
// sent to the client, only a correct/incorrect verdict and the next clue
// state, so an anonymous player can play the full game with no account.
// Persistence (and the group-social side effects) only happen when signed in.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { playerId?: string; priorWrongGuesses?: number } | null;
  const playerId = body?.playerId;
  if (!playerId) {
    return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  }

  const admin = sbAdmin();
  const challenge = await getOrCreateTodayChallenge(admin);
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  const correct = isCorrectGuess(challenge, playerId);

  let guessCount: number;
  let solved: boolean;
  let outOfTries: boolean;
  let shareText: string | null;
  let justSolved = false;

  if (user) {
    // lib/supabase/types.ts's Database type is stale relative to the real
    // schema and doesn't cover this table — reads/writes go through
    // sbAdmin() rather than fighting that type; `user.id` from the verified
    // session (not client input) is the security boundary, same as
    // app/api/join-free/route.ts.
    const before = await admin
      .from("daily_challenge_attempts")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("challenge_id", challenge.id)
      .maybeSingle();
    const wasAlreadyComplete = !!before.data?.completed_at;

    const result = await recordGuess(admin, user.id, challenge, playerId, correct);
    guessCount = result.guessCount;
    solved = result.solved;
    outOfTries = result.outOfTries;
    shareText = result.shareText;
    justSolved = solved && !wasAlreadyComplete;
  } else {
    const priorWrong = Math.max(0, Math.min(TRY_LIMIT, Number(body?.priorWrongGuesses) || 0));
    guessCount = priorWrong + 1; // total guesses so far, including this one
    solved = correct;
    outOfTries = !solved && guessCount >= TRY_LIMIT;
    shareText = null;
  }

  const wrongGuessCount = guessCount - (solved ? 1 : 0);
  const clueState = await getClueState(admin, challenge, wrongGuessCount);

  const cookieLocale = cookies().get("cupclash_locale")?.value as Locale | undefined;

  const completed = solved || outOfTries;
  const reveal = completed ? await buildReveal(admin, challenge, cookieLocale) : null;

  // Group-social layer: an "also do this" side effect for signed-in solvers
  // who happen to be in a group(s) — never a condition for play or sharing.
  if (justSolved && user) {
    const { data: profile } = await admin.from("profiles").select("name").eq("id", user.id).maybeSingle();
    const { data: memberships } = await admin.from("group_members").select("group_id").eq("user_id", user.id);
    const groupIds = (memberships ?? []).map(m => m.group_id as string);
    if (groupIds.length > 0 && profile?.name) {
      const t = TRANSLATIONS[cookieLocale && cookieLocale in TRANSLATIONS ? cookieLocale : "en"];
      const message = interpolate(t.daily_challenge_group_nudge, { name: profile.name, count: guessCount });
      await Promise.all(groupIds.map(groupId => postSystemMessage(admin, groupId, message)));
    }
  }

  return NextResponse.json(
    { correct, solved, outOfTries, guessCount, clueState, shareText, reveal },
    { headers: { "Cache-Control": "no-store" } }
  );
}
