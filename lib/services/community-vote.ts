import type { SupabaseClient } from "@supabase/supabase-js";

// Community Voting — "Matchday MVP". One poll per finished match
// (vote_type='matchday_mvp', scope=match id). Candidates are drawn from the
// two competing teams' full squads (players.country matching the match's
// home/away team name) — the app has no per-match lineup/starting-XI data
// (see live-match-hub's "Lineups not available" tab), so this is an honest
// "players from both squads", not a confirmed appearance list.

const VOTE_WINDOW_MS = 48 * 60 * 60 * 1000; // 48h, per the feature spec

export type VoteOption = {
  optionId: string;
  playerId: string;
  fullName: string;
  photo: string | null;
  country: string;
};

export type VoteState = {
  voteId: string;
  closesAt: string;
  closed: boolean;
  options: VoteOption[];
  userOptionId: string | null; // set once this user has cast a vote
  results: { optionId: string; votes: number; pct: number }[] | null; // only populated once the caller has voted or the vote is closed
};

async function getNextMatchdayStart(sb: SupabaseClient, afterKickoffAt: string): Promise<string | null> {
  const { data } = await sb
    .from("matches")
    .select("kickoff_at")
    .gt("kickoff_at", afterKickoffAt)
    .order("kickoff_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data?.kickoff_at) return null;
  const d = new Date(data.kickoff_at);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

async function createMatchVote(sb: SupabaseClient, matchId: string): Promise<string | null> {
  const { data: match } = await sb
    .from("matches")
    .select("id, home, away, status, kickoff_at")
    .eq("id", matchId)
    .maybeSingle();
  if (!match || match.status !== "finished") return null;

  const nextMatchdayStart = await getNextMatchdayStart(sb, match.kickoff_at);
  const byWindow = new Date(Date.now() + VOTE_WINDOW_MS).toISOString();
  const closesAt = nextMatchdayStart && nextMatchdayStart < byWindow ? nextMatchdayStart : byWindow;

  const { data: created, error } = await sb
    .from("community_votes")
    .insert({ vote_type: "matchday_mvp", scope: matchId, closes_at: closesAt })
    .select("id")
    .single();
  if (error || !created) {
    // Unique violation on (vote_type, scope) — another request just created it.
    const { data: existing } = await sb
      .from("community_votes")
      .select("id")
      .eq("vote_type", "matchday_mvp")
      .eq("scope", matchId)
      .maybeSingle();
    return existing?.id ?? null;
  }

  const { data: candidates } = await sb
    .from("players")
    .select("id")
    .in("country", [match.home, match.away]);
  const options = (candidates ?? []).map(p => ({ vote_id: created.id, player_id: p.id as string }));
  if (options.length > 0) await sb.from("community_vote_options").insert(options);

  return created.id;
}

export async function getMatchVoteState(
  sb: SupabaseClient,
  matchId: string,
  userId: string | null
): Promise<VoteState | null> {
  let { data: vote } = await sb
    .from("community_votes")
    .select("id, closes_at")
    .eq("vote_type", "matchday_mvp")
    .eq("scope", matchId)
    .maybeSingle();

  if (!vote) {
    const createdId = await createMatchVote(sb, matchId);
    if (!createdId) return null; // match isn't finished yet — voting not open
    const { data: refetched } = await sb
      .from("community_votes")
      .select("id, closes_at")
      .eq("id", createdId)
      .single();
    vote = refetched;
  }
  if (!vote) return null;

  const closed = new Date(vote.closes_at) <= new Date();

  const { data: optionRows } = await sb
    .from("community_vote_options")
    .select("id, players(id, full_name, photo, country)")
    .eq("vote_id", vote.id);
  type OptionRow = { id: string; players: { id: string; full_name: string; photo: string | null; country: string } | { id: string; full_name: string; photo: string | null; country: string }[] };
  const options: VoteOption[] = ((optionRows ?? []) as unknown as OptionRow[])
    .map(r => {
      const p = Array.isArray(r.players) ? r.players[0] : r.players;
      if (!p) return null;
      return { optionId: r.id, playerId: p.id, fullName: p.full_name, photo: p.photo, country: p.country };
    })
    .filter((o): o is VoteOption => !!o)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  let userOptionId: string | null = null;
  if (userId) {
    const { data: ownCast } = await sb
      .from("community_vote_casts")
      .select("option_id")
      .eq("vote_id", vote.id)
      .eq("user_id", userId)
      .maybeSingle();
    userOptionId = ownCast?.option_id ?? null;
  }

  let results: VoteState["results"] = null;
  if (closed || userOptionId) {
    const { data: castRows } = await sb.from("community_vote_casts").select("option_id").eq("vote_id", vote.id);
    const counts = new Map<string, number>();
    for (const o of options) counts.set(o.optionId, 0);
    for (const c of (castRows ?? [])) counts.set(c.option_id, (counts.get(c.option_id) ?? 0) + 1);
    const total = (castRows ?? []).length || 1;
    results = options.map(o => {
      const votes = counts.get(o.optionId) ?? 0;
      return { optionId: o.optionId, votes, pct: Math.round((votes / total) * 100) };
    });
  }

  return { voteId: vote.id, closesAt: vote.closes_at, closed, options, userOptionId, results };
}

export type CastVoteResult = { ok: true } | { ok: false; error: "closed" | "already_voted" | "invalid_option" };

export async function castVote(
  sb: SupabaseClient,
  userId: string,
  voteId: string,
  optionId: string
): Promise<CastVoteResult> {
  const { data: vote } = await sb.from("community_votes").select("closes_at").eq("id", voteId).maybeSingle();
  if (!vote) return { ok: false, error: "invalid_option" };
  if (new Date(vote.closes_at) <= new Date()) return { ok: false, error: "closed" };

  const { data: option } = await sb
    .from("community_vote_options")
    .select("id")
    .eq("id", optionId)
    .eq("vote_id", voteId)
    .maybeSingle();
  if (!option) return { ok: false, error: "invalid_option" };

  const { error } = await sb.from("community_vote_casts").insert({ vote_id: voteId, option_id: optionId, user_id: userId });
  if (error) {
    // Unique violation on (vote_id, user_id) — already voted.
    return { ok: false, error: "already_voted" };
  }
  return { ok: true };
}
