import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlayerEnrichment } from "@/lib/services/wikidata";
import { computeWordleFeedback, type LetterTile } from "@/lib/services/wordle-feedback";

// Core "Guess the Footballer" game logic — puzzle selection, progressive
// clue reveal, guess validation, and the group streak calculation. Kept as
// a single shared module so streak/leaderboard numbers can never be
// computed two different ways in two different places (that exact bug has
// hit this app repeatedly).

export const TRY_LIMIT = 6;

export type GameType = "guess_footballer" | "guess_club";

export type FootballerClueField = "nationality" | "club" | "position" | "age" | "silhouette";
export type ClubClueField = "league" | "silhouette";
export type ClueField = FootballerClueField | ClubClueField;

export const DEFAULT_CLUE_ORDER: FootballerClueField[] = ["nationality", "club", "position", "age", "silhouette"];
export const DEFAULT_CLUB_CLUE_ORDER: ClubClueField[] = ["league", "silhouette"];

// How many days back an answer is excluded from re-selection. The spec asked
// for "last 30-60 days" — 45 is the midpoint, easy to tune later.
const AVOID_REPEAT_DAYS = 45;

export type DailyChallengeRow = {
  id: string;
  challenge_date: string;
  game_type: GameType;
  answer_player_id: string | null;
  answer_team_id: string | null;
  clue_order: ClueField[];
  created_at: string;
};

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Deterministic day-parity alternation between the two game types — avoids
// needing an admin-curated calendar and keeps the existing
// daily_challenges_date_key (unique on challenge_date alone) valid, since
// only one game type is ever chosen for a given date.
export function pickGameTypeForDate(dateISO: string): GameType {
  const d = new Date(`${dateISO}T00:00:00Z`);
  const startOfYear = Date.UTC(d.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - startOfYear) / 86_400_000);
  return dayOfYear % 2 === 0 ? "guess_footballer" : "guess_club";
}

// The single entity id a challenge is "about", regardless of game_type —
// every correctness check and guess-history comparison should go through
// this rather than reading answer_player_id/answer_team_id directly.
export function getAnswerId(challenge: DailyChallengeRow): string {
  const id = challenge.game_type === "guess_club" ? challenge.answer_team_id : challenge.answer_player_id;
  if (!id) throw new Error(`daily_challenges row ${challenge.id} has no answer id for game_type ${challenge.game_type}`);
  return id;
}

// ── Puzzle selection ─────────────────────────────────────────────────────────
// On-demand-if-not-exists: the first request of the day creates the row.
// Fits this repo's cron model better than a scheduled seed job since there's
// no existing "midnight" cron and this way a quiet day never wastes a run.

export async function getOrCreateTodayChallenge(sb: SupabaseClient): Promise<DailyChallengeRow> {
  const today = todayISO();

  const { data: existing } = await sb
    .from("daily_challenges")
    .select("*")
    .eq("challenge_date", today)
    .maybeSingle();
  if (existing) return existing as DailyChallengeRow;

  const gameType = pickGameTypeForDate(today);
  const created =
    gameType === "guess_club"
      ? await createClubChallenge(sb, today)
      : await createFootballerChallenge(sb, today);
  if (created) return created;

  // Unique violation on challenge_date means a concurrent request won the
  // race and already created today's row — fetch and return that instead.
  const { data: raceWinner } = await sb
    .from("daily_challenges")
    .select("*")
    .eq("challenge_date", today)
    .single();
  if (raceWinner) return raceWinner as DailyChallengeRow;
  throw new Error(`Failed to create or fetch daily challenge for ${today}`);
}

async function createFootballerChallenge(sb: SupabaseClient, today: string): Promise<DailyChallengeRow | null> {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - AVOID_REPEAT_DAYS);
  const { data: recent } = await sb
    .from("daily_challenges")
    .select("answer_player_id")
    .eq("game_type", "guess_footballer")
    .gte("challenge_date", cutoff.toISOString().slice(0, 10));
  const excludeIds = new Set((recent ?? []).map(r => r.answer_player_id as string));

  const { data: allPlayers } = await sb.from("players").select("id, full_name, country");
  const candidates = (allPlayers ?? []) as { id: string; full_name: string; country: string }[];
  const eligible = candidates.filter(p => !excludeIds.has(p.id));
  const pool = eligible.length > 0 ? eligible : candidates;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const { data: created, error } = await sb
    .from("daily_challenges")
    .insert({
      challenge_date: today,
      game_type: "guess_footballer",
      answer_player_id: chosen.id,
      clue_order: DEFAULT_CLUE_ORDER,
    })
    .select("*")
    .single();
  if (error) return null;

  // Warm the enrichment cache now so gameplay requests never block on an
  // external Wikidata/Commons call. Best-effort — a failed fetch just means
  // the age/silhouette clues degrade gracefully to "unavailable" later.
  void getPlayerEnrichment(sb, chosen.id, chosen.full_name, chosen.country).catch(() => {});

  return created as DailyChallengeRow;
}

// Answer pool is scoped to clubs with a synced `standings` row (rather than
// every row in `teams`) so the "league" clue always resolves to a real value
// — see the Step 0 investigation: only ~60 of 78 club teams have a synced
// standings link today, and national teams have no badge/crest at all.
async function createClubChallenge(sb: SupabaseClient, today: string): Promise<DailyChallengeRow | null> {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - AVOID_REPEAT_DAYS);
  const { data: recent } = await sb
    .from("daily_challenges")
    .select("answer_team_id")
    .eq("game_type", "guess_club")
    .gte("challenge_date", cutoff.toISOString().slice(0, 10));
  const excludeIds = new Set((recent ?? []).map(r => r.answer_team_id as string));

  const { data: standingsRows } = await sb.from("standings").select("team_id");
  const standingTeamIds = Array.from(new Set((standingsRows ?? []).map(r => r.team_id as string)));
  if (standingTeamIds.length === 0) return null;

  const { data: teams } = await sb
    .from("teams")
    .select("id, name, badge_url")
    .in("id", standingTeamIds)
    .not("badge_url", "is", null);
  const candidates = (teams ?? []) as { id: string; name: string; badge_url: string }[];
  const eligible = candidates.filter(t => !excludeIds.has(t.id));
  const pool = eligible.length > 0 ? eligible : candidates;
  if (pool.length === 0) return null;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const { data: created, error } = await sb
    .from("daily_challenges")
    .insert({
      challenge_date: today,
      game_type: "guess_club",
      answer_team_id: chosen.id,
      clue_order: DEFAULT_CLUB_CLUE_ORDER,
    })
    .select("*")
    .single();
  if (error) return null;

  return created as DailyChallengeRow;
}

// ── Clue reveal ──────────────────────────────────────────────────────────────

export type ClueState = {
  cluesUnlocked: ClueField[];
  values: {
    nationality?: string | null;
    club?: string | null;
    position?: string | null;
    age?: number | null;
    league?: string | null;
    silhouetteUrl?: string | null;
  };
};

function computeAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const hasHadBirthdayThisYear =
    now.getUTCMonth() > dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() >= dob.getUTCDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export async function getClueState(
  sb: SupabaseClient,
  challenge: DailyChallengeRow,
  wrongGuessCount: number
): Promise<ClueState> {
  const order = challenge.clue_order?.length
    ? challenge.clue_order
    : challenge.game_type === "guess_club"
      ? DEFAULT_CLUB_CLUE_ORDER
      : DEFAULT_CLUE_ORDER;
  const cluesUnlocked = order.slice(0, Math.min(wrongGuessCount, order.length));

  if (challenge.game_type === "guess_club") {
    return getClubClueState(sb, challenge, cluesUnlocked);
  }
  return getFootballerClueState(sb, challenge, cluesUnlocked);
}

async function getFootballerClueState(
  sb: SupabaseClient,
  challenge: DailyChallengeRow,
  cluesUnlocked: ClueField[]
): Promise<ClueState> {
  const [{ data: player }, { data: enrichment }] = await Promise.all([
    sb
      .from("players")
      .select("country, club, position, photo")
      .eq("id", challenge.answer_player_id)
      .maybeSingle(),
    sb
      .from("player_wikidata_cache")
      .select("date_of_birth, photo_url")
      .eq("player_id", challenge.answer_player_id)
      .maybeSingle(),
  ]);

  const age = enrichment?.date_of_birth ? computeAge(enrichment.date_of_birth) : null;

  const values: ClueState["values"] = {};
  for (const clue of cluesUnlocked) {
    if (clue === "nationality") values.nationality = player?.country ?? null;
    if (clue === "club") values.club = player?.club ?? null;
    if (clue === "position") values.position = player?.position ?? null;
    if (clue === "age") values.age = age;
    if (clue === "silhouette") values.silhouetteUrl = enrichment?.photo_url ?? player?.photo ?? null;
  }
  return { cluesUnlocked, values };
}

async function getClubClueState(
  sb: SupabaseClient,
  challenge: DailyChallengeRow,
  cluesUnlocked: ClueField[]
): Promise<ClueState> {
  const { data: team } = await sb
    .from("teams")
    .select("name, badge_url")
    .eq("id", challenge.answer_team_id)
    .maybeSingle();

  let leagueName: string | null = null;
  if (cluesUnlocked.includes("league")) {
    const { data: standing } = await sb
      .from("standings")
      .select("competition_id")
      .eq("team_id", challenge.answer_team_id)
      .maybeSingle();
    if (standing?.competition_id) {
      const { data: competition } = await sb
        .from("competitions")
        .select("name")
        .eq("id", standing.competition_id)
        .maybeSingle();
      leagueName = competition?.name ?? null;
    }
  }

  const values: ClueState["values"] = {};
  for (const clue of cluesUnlocked) {
    if (clue === "league") values.league = leagueName;
    if (clue === "silhouette") values.silhouetteUrl = team?.badge_url ?? null;
  }
  return { cluesUnlocked, values };
}

// ── Guess validation + attempt persistence ──────────────────────────────────
// Validation always runs server-side (never ship the answer to the client)
// and works the same for anonymous and authenticated guessers. Persistence
// (this section past the equality check) only happens for authenticated
// users — anonymous play stays entirely in client-side state until signup.

export function isCorrectGuess(challenge: DailyChallengeRow, guessedEntityId: string): boolean {
  return getAnswerId(challenge) === guessedEntityId;
}

// Batch name lookup for the Wordle letter-feedback diff — keyed by
// game_type since a challenge's entities are always all-players or
// all-teams, never mixed. `players.full_name` / `teams.name` are the only
// name fields either table has (full_name is sometimes API-Football's
// abbreviated form like "R. Freuler" — a pre-existing data-quality issue,
// not something this diff tries to work around).
async function getEntityNames(sb: SupabaseClient, gameType: GameType, ids: string[]): Promise<Map<string, string>> {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  const map = new Map<string, string>();
  if (uniqueIds.length === 0) return map;

  if (gameType === "guess_club") {
    const { data } = await sb.from("teams").select("id, name").in("id", uniqueIds);
    for (const row of (data ?? []) as { id: string; name: string }[]) map.set(row.id, row.name);
  } else {
    const { data } = await sb.from("players").select("id, full_name").in("id", uniqueIds);
    for (const row of (data ?? []) as { id: string; full_name: string }[]) map.set(row.id, row.full_name);
  }
  return map;
}

// Computes the per-letter Wordle feedback for one guess against the real
// answer — the answer string itself is never returned to the caller, only
// the derived tile colors, same "never ship the answer" posture as the rest
// of this module.
export async function getGuessFeedback(
  sb: SupabaseClient,
  challenge: DailyChallengeRow,
  guessedEntityId: string
): Promise<{ guessedName: string; letters: LetterTile[] }> {
  const answerId = getAnswerId(challenge);
  const names = await getEntityNames(sb, challenge.game_type, [guessedEntityId, answerId]);
  const guessedName = names.get(guessedEntityId) ?? "";
  const answerName = names.get(answerId) ?? "";
  return { guessedName, letters: computeWordleFeedback(guessedName, answerName) };
}

// Field name kept as `player_id` for both game types — this is the guessed
// entity id (a player or a team, per challenge.game_type), and repurposing
// it avoids a schema-shape difference between historical footballer rows
// and new club rows in the same jsonb column.
export type GuessRecord = { player_id: string; correct: boolean; name: string; letters: LetterTile[] };

export function buildShareText(challenge: DailyChallengeRow, guesses: GuessRecord[], solved: boolean): string {
  const squares = guesses.map(g => (g.correct ? "🟩" : "⬛")).join("");
  const result = solved ? `${guesses.length}/${TRY_LIMIT}` : `X/${TRY_LIMIT}`;
  const label = challenge.game_type === "guess_club" ? "🛡️ Guess the Club" : "⚽ Guess the Footballer";
  return `${label} — ${challenge.challenge_date}\n${squares} ${result}`;
}

export type RecordGuessResult = {
  guessCount: number;
  solved: boolean;
  outOfTries: boolean;
  shareText: string | null;
};

export async function recordGuess(
  sb: SupabaseClient,
  userId: string,
  challenge: DailyChallengeRow,
  guessedPlayerId: string,
  correct: boolean,
  guessedName: string,
  letters: LetterTile[]
): Promise<RecordGuessResult> {
  const { data: existing } = await sb
    .from("daily_challenge_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challenge.id)
    .maybeSingle();

  if (existing?.completed_at) {
    // Already solved, or already out of tries — either way the attempt is
    // closed, so a stray extra guess request is a no-op, not a new guess.
    return {
      guessCount: existing.guess_count,
      solved: existing.solved,
      outOfTries: !existing.solved,
      shareText: existing.share_text,
    };
  }

  const priorGuesses = ((existing?.guesses as GuessRecord[] | null) ?? []).filter(Boolean);
  const guesses = [...priorGuesses, { player_id: guessedPlayerId, correct, name: guessedName, letters }];
  const solved = correct;
  const outOfTries = !solved && guesses.length >= TRY_LIMIT;
  const completed = solved || outOfTries;
  const shareText = completed ? buildShareText(challenge, guesses, solved) : null;

  await sb.from("daily_challenge_attempts").upsert(
    {
      id: existing?.id,
      user_id: userId,
      challenge_id: challenge.id,
      guesses,
      guess_count: guesses.length,
      solved,
      completed_at: completed ? new Date().toISOString() : null,
      share_text: shareText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,challenge_id" }
  );

  return { guessCount: guesses.length, solved, outOfTries, shareText };
}

// One-shot save of a completed anonymous attempt, invoked once after signup
// (see lib/auth-wall.ts buildDailyPuzzleAuthWallUrl + ConsumeDailyChallengeParam).
// Never trusts the client's "correct" flags — recomputes each guess against
// the real answer server-side. Idempotent: skips if the user already has a
// row for this challenge (e.g. they'd already started playing signed in).
export async function saveAnonymousAttempt(
  sb: SupabaseClient,
  userId: string,
  challenge: DailyChallengeRow,
  clientGuesses: { player_id: string }[]
): Promise<{ saved: boolean }> {
  const { data: existing } = await sb
    .from("daily_challenge_attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challenge.id)
    .maybeSingle();
  if (existing) return { saved: false };

  const answerId = getAnswerId(challenge);
  const limitedGuesses = clientGuesses.slice(0, TRY_LIMIT);
  const names = await getEntityNames(sb, challenge.game_type, [...limitedGuesses.map(g => g.player_id), answerId]);
  const answerName = names.get(answerId) ?? "";
  const recomputed: GuessRecord[] = limitedGuesses.map(g => {
    const guessedName = names.get(g.player_id) ?? "";
    return {
      player_id: g.player_id,
      correct: g.player_id === answerId,
      name: guessedName,
      letters: computeWordleFeedback(guessedName, answerName),
    };
  });
  if (recomputed.length === 0) return { saved: false };

  const firstCorrectIndex = recomputed.findIndex(g => g.correct);
  const guesses = firstCorrectIndex >= 0 ? recomputed.slice(0, firstCorrectIndex + 1) : recomputed;
  const solved = firstCorrectIndex >= 0;
  const outOfTries = !solved && guesses.length >= TRY_LIMIT;
  const completed = solved || outOfTries;

  await sb.from("daily_challenge_attempts").insert({
    user_id: userId,
    challenge_id: challenge.id,
    guesses,
    guess_count: guesses.length,
    solved,
    completed_at: completed ? new Date().toISOString() : null,
    share_text: completed ? buildShareText(challenge, guesses, solved) : null,
  });
  return { saved: true };
}

// ── Group Streak — THE single shared computation ────────────────────────────
// A calendar day counts toward the streak only if at least one group member
// attempted that day's puzzle AND every member who attempted it solved it.
// A day with zero participation breaks the streak (same intuition as any
// other daily-habit streak) rather than being silently skipped — otherwise a
// group could keep an artificial streak alive forever by simply not playing.

export type GroupStreakResult = { currentStreak: number; lastPerfectDate: string | null };

export async function getGroupStreak(
  sb: SupabaseClient,
  groupId: string,
  asOf: string = todayISO()
): Promise<GroupStreakResult> {
  const { data: members } = await sb.from("group_members").select("user_id").eq("group_id", groupId);
  const memberIds = (members ?? []).map(m => m.user_id as string);
  if (memberIds.length === 0) return { currentStreak: 0, lastPerfectDate: null };

  const { data: rows } = await sb
    .from("daily_challenge_attempts")
    .select("solved, daily_challenges!inner(challenge_date)")
    .in("user_id", memberIds)
    .lte("daily_challenges.challenge_date", asOf);

  type StreakRow = { solved: boolean; daily_challenges: { challenge_date: string } | { challenge_date: string }[] };
  const byDate = new Map<string, boolean[]>();
  for (const row of ((rows ?? []) as unknown as StreakRow[])) {
    const joined = Array.isArray(row.daily_challenges) ? row.daily_challenges[0] : row.daily_challenges;
    if (!joined) continue;
    const arr = byDate.get(joined.challenge_date);
    if (arr) arr.push(row.solved);
    else byDate.set(joined.challenge_date, [row.solved]);
  }

  let streak = 0;
  let lastPerfectDate: string | null = null;
  const cursor = new Date(`${asOf}T00:00:00Z`);
  // Today's puzzle may still be in progress for some members — don't let an
  // incomplete "today" break a streak earned on all prior days. Only start
  // evaluating from today if it already has at least one attempt logged.
  if (!byDate.has(asOf)) cursor.setUTCDate(cursor.getUTCDate() - 1);

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const dayResults = byDate.get(dateStr);
    if (!dayResults || dayResults.length === 0) break;
    if (!dayResults.every(Boolean)) break;
    streak++;
    if (!lastPerfectDate) lastPerfectDate = dateStr;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { currentStreak: streak, lastPerfectDate };
}
