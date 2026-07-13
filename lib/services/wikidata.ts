import type { SupabaseClient } from "@supabase/supabase-js";

// Enrichment lookup for Daily Challenge clues/facts that aren't in our own
// `players` table (date of birth, reveal photo, short facts). Results are
// cached in player_wikidata_cache (migration 049) so a given player is only
// ever fetched from Wikidata/Commons once, not once per game instance.
//
// Wikimedia's usage policy requires a descriptive User-Agent identifying the
// application on every request — unset/generic UAs get throttled or blocked.
const USER_AGENT = "CupClash/1.0 (https://cupclash.app; contact via app support)";

const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const WIKIDATA_REST = "https://www.wikidata.org/w/rest.php/wikibase/v1";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

async function wdFetch(url: string): Promise<Response> {
  return fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
}

// ── Search ───────────────────────────────────────────────────────────────────
// wbsearchentities doesn't support filtering by occupation, so callers must
// disambiguate using the returned `description` (e.g. "... football player").

type SearchCandidate = { id: string; label: string; description?: string };

async function searchEntity(name: string): Promise<SearchCandidate[]> {
  const url = `${WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(name)}&format=json&language=en&type=item&limit=5`;
  const res = await wdFetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.search ?? []) as SearchCandidate[];
}

function pickFootballerCandidate(candidates: SearchCandidate[]): SearchCandidate | null {
  const footballer = candidates.find(c => /footbal|soccer/i.test(c.description ?? ""));
  return footballer ?? candidates[0] ?? null;
}

// `players.full_name` is frequently API-Football's abbreviated form ("R.
// Freuler" rather than "Remo Freuler") — verified live against real data,
// where wbsearchentities's label-prefix matching finds nothing for the
// abbreviated form (it needs the real first name). Full-text search
// (action=query&list=search) indexes descriptions too, so "Freuler
// footballer Switzerland" finds the right entity even without the first
// name — confirmed against Q16595441 (Remo Freuler). Multiple same-surname
// players (e.g. brothers Lucas/Théo Hernández) are disambiguated by
// checking the initial letter of each candidate's actual first name.
const ABBREVIATED_NAME = /^([A-Za-zÀ-ÖØ-öø-ÿ])\.\s*(.+)$/;

async function fullTextSearch(query: string, limit = 8): Promise<{ id: string }[]> {
  const url = `${WIKIDATA_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=${limit}`;
  const res = await wdFetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return ((json.query?.search ?? []) as { title: string }[]).map(r => ({ id: r.title }));
}

async function resolveAbbreviatedName(initial: string, surname: string, country: string): Promise<string | null> {
  const candidates = await fullTextSearch(`${surname} footballer ${country}`);
  for (const candidate of candidates) {
    const label = await getLabel(candidate.id);
    if (!label) continue;
    const firstName = label.trim().split(/\s+/)[0] ?? "";
    const surnameMatches = label.toLowerCase().includes(surname.toLowerCase());
    const initialMatches = firstName.toLowerCase().startsWith(initial.toLowerCase());
    if (surnameMatches && initialMatches) return candidate.id;
  }
  return null;
}

async function resolvePlayerQid(playerName: string, country: string): Promise<string | null> {
  const abbreviated = playerName.match(ABBREVIATED_NAME);
  if (abbreviated) {
    const [, initial, surname] = abbreviated;
    return resolveAbbreviatedName(initial, surname, country);
  }
  const candidates = await searchEntity(playerName);
  return pickFootballerCandidate(candidates)?.id ?? null;
}

// ── Statements ───────────────────────────────────────────────────────────────

type StatementValue = { property: { id: string; data_type: string }; value: { type: string; content: unknown }; rank: "preferred" | "normal" | "deprecated" };
type Statement = { qualifiers: { property: { id: string }; value: { content: unknown } }[] } & StatementValue;

async function getStatements(qid: string, propertyId: string): Promise<Statement[]> {
  const res = await wdFetch(`${WIKIDATA_REST}/entities/items/${qid}/statements?property=${propertyId}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json[propertyId] ?? []) as Statement[];
}

async function getLabel(qid: string, lang = "en"): Promise<string | null> {
  const res = await wdFetch(`${WIKIDATA_REST}/entities/items/${qid}/labels/${lang}`);
  if (!res.ok) return null;
  const label = await res.json();
  return typeof label === "string" ? label : null;
}

function wikidataTimeToDate(content: unknown): string | null {
  const time = (content as { time?: string } | undefined)?.time;
  if (!time) return null;
  // Wikidata time strings are like "+1987-06-24T00:00:00Z" — strip the sign.
  const match = time.match(/^[+-](\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  if (m === "00" || d === "00") return null; // year/month-only precision, not a usable birthdate
  return `${y}-${m}-${d}`;
}

// P54 (member of sports team) carries the player's whole history — both
// clubs AND national team call-ups — each entry qualified with P580
// (start) / P582 (end). Verified live against a real player (Remo Freuler)
// that neither "no end date" nor "latest start year" reliably identifies
// the current *club*: his only open-ended entry was his national team
// call-up (ongoing since 2017), while his actual current club (Bologna)
// was recorded with qualifiers but no open end date either. What DID mark
// it correctly was Wikidata's own `rank: "preferred"` — its standard
// convention for "this is the currently-valid value among several" — so
// that takes priority, with the no-end-date heuristic only as a fallback
// for players whose Wikidata entry doesn't use rank this way.
function startYear(qualifiers: Statement["qualifiers"]): number {
  const start = qualifiers.find(q => q.property.id === "P580");
  const time = (start?.value.content as { time?: string } | undefined)?.time;
  const match = time?.match(/^[+-](\d{4})/);
  return match ? Number(match[1]) : 0;
}

async function getCurrentClubQid(qid: string): Promise<string | null> {
  const memberships = await getStatements(qid, "P54");

  const withLabels = await Promise.all(
    memberships.map(async m => {
      const teamQid = typeof m.value.content === "string" ? m.value.content : null;
      const label = teamQid ? await getLabel(teamQid) : null;
      return {
        teamQid,
        label,
        rank: m.rank,
        openEnded: !m.qualifiers.some(q => q.property.id === "P582"),
        startYear: startYear(m.qualifiers),
      };
    })
  );

  const clubsOnly = withLabels.filter(c => c.teamQid && c.label && !/national\s+(\w+\s+)?team/i.test(c.label));
  const preferred = clubsOnly.find(c => c.rank === "preferred");
  if (preferred) return preferred.teamQid;

  const openEnded = clubsOnly.filter(c => c.openEnded).sort((a, b) => b.startYear - a.startYear);
  if (openEnded[0]) return openEnded[0].teamQid;

  const mostRecent = clubsOnly.sort((a, b) => b.startYear - a.startYear)[0];
  return mostRecent?.teamQid ?? withLabels[withLabels.length - 1]?.teamQid ?? null;
}

// ── Commons photo + attribution ─────────────────────────────────────────────

export type PhotoAttribution = {
  licenseShortName: string | null;
  licenseUrl: string | null;
  artist: string | null;
  attributionRequired: boolean;
};

// Commons' Artist field is frequently an HTML link (verified live —
// e.g. `<a href="//commons.wikimedia.org/wiki/User:Ago76">Ago76</a>`).
// We display attribution as plain text, so strip markup rather than
// risk rendering unsanitized external HTML.
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

async function getCommonsPhoto(filename: string): Promise<{ url: string; attribution: PhotoAttribution } | null> {
  const title = filename.startsWith("File:") ? filename : `File:${filename}`;
  const url = `${COMMONS_API}?action=query&prop=imageinfo&format=json&iiprop=url|extmetadata&titles=${encodeURIComponent(title)}`;
  const res = await wdFetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const pages = json.query?.pages ?? {};
  const page = Object.values(pages)[0] as
    | { imageinfo?: { url: string; extmetadata?: Record<string, { value: string }> }[] }
    | undefined;
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    url: info.url,
    attribution: {
      licenseShortName: meta.LicenseShortName?.value ?? null,
      licenseUrl: meta.LicenseUrl?.value ?? null,
      artist: meta.Artist?.value ? stripHtml(meta.Artist.value) : null,
      attributionRequired: meta.AttributionRequired?.value === "true",
    },
  };
}

// ── Public entry point ───────────────────────────────────────────────────────

export type PlayerEnrichment = {
  wikidataQid: string | null;
  dateOfBirth: string | null;
  photoUrl: string | null;
  photoAttribution: PhotoAttribution | null;
  facts: string[];
};

const EMPTY_ENRICHMENT: PlayerEnrichment = {
  wikidataQid: null,
  dateOfBirth: null,
  photoUrl: null,
  photoAttribution: null,
  facts: [],
};

// Builds our own short, factual phrasing from structured statements — never
// copies Wikipedia prose, per the data-sourcing constraint for this feature.
async function buildFacts(qid: string, nationalityQid: string | null, clubQid: string | null): Promise<string[]> {
  const facts: string[] = [];
  const [nationality, club] = await Promise.all([
    nationalityQid ? getLabel(nationalityQid) : null,
    clubQid ? getLabel(clubQid) : null,
  ]);
  if (nationality) facts.push(`Represents ${nationality} internationally.`);
  if (club) facts.push(`Currently plays for ${club}.`);

  const awards = await getStatements(qid, "P166");
  if (awards.length > 0) facts.push(`Has received ${awards.length} recorded award${awards.length === 1 ? "" : "s"}.`);

  return facts.slice(0, 3);
}

async function fetchFromWikidata(playerName: string, country: string): Promise<PlayerEnrichment> {
  const qid = await resolvePlayerQid(playerName, country);
  if (!qid) return EMPTY_ENRICHMENT;

  const [dobStatements, nationalityStatements, clubQid, imageStatements] = await Promise.all([
    getStatements(qid, "P569"),
    getStatements(qid, "P27"),
    getCurrentClubQid(qid),
    getStatements(qid, "P18"),
  ]);

  const dateOfBirth = wikidataTimeToDate(dobStatements[0]?.value.content);
  const nationalityQid = typeof nationalityStatements[0]?.value.content === "string"
    ? (nationalityStatements[0].value.content as string)
    : null;
  const imageFilename = typeof imageStatements[0]?.value.content === "string"
    ? (imageStatements[0].value.content as string)
    : null;

  const [facts, photo] = await Promise.all([
    buildFacts(qid, nationalityQid, clubQid),
    imageFilename ? getCommonsPhoto(imageFilename) : Promise.resolve(null),
  ]);

  return {
    wikidataQid: qid,
    dateOfBirth,
    photoUrl: photo?.url ?? null,
    photoAttribution: photo?.attribution ?? null,
    facts,
  };
}

// Cache-first lookup. `sb` should be sbAdmin() — writing to
// player_wikidata_cache requires the service role (see migration 049).
export async function getPlayerEnrichment(
  sb: SupabaseClient,
  playerId: string,
  playerName: string,
  country: string
): Promise<PlayerEnrichment> {
  const { data: cached } = await sb
    .from("player_wikidata_cache")
    .select("wikidata_qid, date_of_birth, photo_url, photo_attribution, facts")
    .eq("player_id", playerId)
    .maybeSingle();

  if (cached) {
    return {
      wikidataQid: cached.wikidata_qid,
      dateOfBirth: cached.date_of_birth,
      photoUrl: cached.photo_url,
      photoAttribution: cached.photo_attribution as PhotoAttribution | null,
      facts: (cached.facts as string[] | null) ?? [],
    };
  }

  const enrichment = await fetchFromWikidata(playerName, country);
  await sb.from("player_wikidata_cache").upsert({
    player_id: playerId,
    wikidata_qid: enrichment.wikidataQid,
    date_of_birth: enrichment.dateOfBirth,
    photo_url: enrichment.photoUrl,
    photo_attribution: enrichment.photoAttribution,
    facts: enrichment.facts,
  });
  return enrichment;
}
