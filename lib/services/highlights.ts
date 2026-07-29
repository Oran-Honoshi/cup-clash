// On-demand Highlightly lookups for Match Center's Overview tab — mirrors
// lib/services/match-center.ts's cost discipline (no DB table, no cron,
// called only in direct response to a user viewing a finished match's
// Overview tab). Built against Highlightly's free Basic tier: major
// competitions may legitimately return an empty highlight list on Basic
// (a content-gating limit of the tier, not a bug), so every caller treats
// "no confident match" and "no highlights returned" identically — show
// nothing, same principle as the lineups "not available yet" state.
//
// Upgrading to Pro later is meant to be a HIGHLIGHTLY_API_KEY swap only:
// nothing here is Basic-tier-specific, so no rebuild is needed.

const HIGHLIGHTLY_BASE = "https://soccer.highlightly.net";

function apiHeaders(): Record<string, string> {
  return { "x-rapidapi-key": process.env.HIGHLIGHTLY_API_KEY! };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${HIGHLIGHTLY_BASE}${path}`, {
    headers: apiHeaders(),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Highlightly HTTP ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

// Highlightly nests list results under `data` per its docs, but this
// defends against a bare-array response shape too rather than assuming.
function unwrapList<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  const data = (json as { data?: T[] } | null)?.data;
  return Array.isArray(data) ? data : [];
}

// ── Fuzzy team-name matching ────────────────────────────────────────────
// Our team names (matches.home/away) and Highlightly's own team names
// won't always be byte-identical ("Man United" vs "Manchester United",
// accented names, club-suffix conventions), so an exact-string compare
// would under-match constantly. Normalize away the noise, then accept
// equality, containment, or the shorter name's significant words all
// appearing in the longer one.

const CLUB_NOISE_WORDS = new Set(["fc", "cf", "afc", "sc", "ac", "cd", "ca", "sad", "club", "the"]);

const DIACRITIC_MARKS = /[̀-ͯ]/g;

function normalizeTeamName(name: string): string {
  return name
    .normalize("NFD").replace(DIACRITIC_MARKS, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w && !CLUB_NOISE_WORDS.has(w))
    .join(" ")
    .trim();
}

function fuzzyTeamEquals(a: string, b: string): boolean {
  const na = normalizeTeamName(a);
  const nb = normalizeTeamName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 4 && nb.length >= 4 && (na.includes(nb) || nb.includes(na))) return true;

  const wordsA = na.split(" ").filter(w => w.length >= 3);
  const wordsB = nb.split(" ").filter(w => w.length >= 3);
  const [shorter, longer] = wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];
  return shorter.length > 0 && shorter.every(w => longer.includes(w));
}

// ── /matches search ──────────────────────────────────────────────────────

interface HighlightlyTeamRef { id: number; name: string; logo: string | null }

interface HighlightlyMatchRow {
  id: number;
  date: string;
  homeTeam: HighlightlyTeamRef;
  awayTeam: HighlightlyTeamRef;
  league: { id: number; name: string };
  country: { code: string | null; name: string | null } | null;
}

function toUtcDateString(iso: string, dayOffset: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

// countryName disambiguates same-named competitions across countries (e.g.
// a bare "Premier League" leagueName search collides with Kazakhstan's
// Premier League among others) — never search by leagueName alone without
// pairing it with a country/league id. This service sidesteps leagueName
// entirely, searching by team names + date instead, but still passes
// countryName whenever the match's competition has one (competitions.country)
// as an extra disambiguating signal.
async function searchMatchesOnDate(
  home: string, away: string, dateStr: string, countryName: string | null
): Promise<HighlightlyMatchRow[]> {
  const qs = new URLSearchParams({
    homeTeamName: home,
    awayTeamName: away,
    date: dateStr,
  });
  if (countryName) qs.set("countryName", countryName);
  const json = await apiFetch<unknown>(`/matches?${qs.toString()}`);
  return unwrapList<HighlightlyMatchRow>(json);
}

function isTeamPairMatch(home: string, away: string, row: HighlightlyMatchRow): boolean {
  return (fuzzyTeamEquals(home, row.homeTeam.name) && fuzzyTeamEquals(away, row.awayTeam.name)) ||
         (fuzzyTeamEquals(home, row.awayTeam.name) && fuzzyTeamEquals(away, row.homeTeam.name));
}

// Tries kickoff date first, then ±1 day (Highlightly's own match date can
// land a day off ours depending on timezone handling), stopping at the
// first date whose raw search returns anything. A single fuzzy-matched
// candidate on that date is confident; zero or multiple is not — both
// resolve to "no highlight shown", never a guess.
async function findConfidentMatch(
  home: string, away: string, kickoffAtIso: string, countryName: string | null
): Promise<HighlightlyMatchRow | null> {
  for (const offset of [0, -1, 1]) {
    const dateStr = toUtcDateString(kickoffAtIso, offset);
    const rows = await searchMatchesOnDate(home, away, dateStr, countryName);
    if (rows.length === 0) continue;
    const candidates = rows.filter(r => isTeamPairMatch(home, away, r));
    return candidates.length === 1 ? candidates[0] : null;
  }
  return null;
}

// ── /highlights ──────────────────────────────────────────────────────────

interface HighlightlyHighlightRow {
  id: number;
  type: string; // "VERIFIED" | "UNVERIFIED"
  title: string;
  imgUrl: string | null;
  url: string;
  embedUrl: string | null;
  source: string;
  category: string; // "match-highlights" | "goal-clip" | "pre-match-content" | ...
}

// Prefers a verified full match-highlights clip over goal clips/pre-match
// content/unverified uploads, without discarding them outright — on Basic
// tier there may only be one result at all.
function pickBestHighlight(rows: HighlightlyHighlightRow[]): HighlightlyHighlightRow {
  const rank = (h: HighlightlyHighlightRow) =>
    (h.category === "match-highlights" ? 0 : 1) + (h.type === "VERIFIED" ? 0 : 2);
  return [...rows].sort((a, b) => rank(a) - rank(b))[0];
}

export interface MatchHighlight {
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  source: string;
}

// Public read (Match Center Overview tab). Returns null whenever there is
// nothing confident to show — no confident match found, or the confident
// match's highlights come back empty (expected on Basic tier for major
// competitions). Callers must never render a placeholder/broken player for
// a null result, only omit the section entirely.
export async function getMatchHighlight(
  home: string, away: string, kickoffAtIso: string, countryName: string | null
): Promise<MatchHighlight | null> {
  const match = await findConfidentMatch(home, away, kickoffAtIso, countryName);
  if (!match) return null;

  const json = await apiFetch<unknown>(`/highlights?matchId=${match.id}&limit=10`);
  const rows = unwrapList<HighlightlyHighlightRow>(json);
  if (rows.length === 0) return null;

  const best = pickBestHighlight(rows);
  return { title: best.title, videoUrl: best.url, thumbnailUrl: best.imgUrl, source: best.source };
}
