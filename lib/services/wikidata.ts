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

// ── Statements ───────────────────────────────────────────────────────────────

type StatementValue = { property: { id: string; data_type: string }; value: { type: string; content: unknown } };
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

// P54 (member of sports team) carries the player's whole club history, each
// entry qualified with P580 (start) / P582 (end). The current club is the
// most recent entry with no end date.
async function getCurrentClubQid(qid: string): Promise<string | null> {
  const memberships = await getStatements(qid, "P54");
  const current = memberships.find(m => !m.qualifiers.some(q => q.property.id === "P582"));
  const content = (current ?? memberships[memberships.length - 1])?.value.content;
  return typeof content === "string" ? content : null;
}

// ── Commons photo + attribution ─────────────────────────────────────────────

export type PhotoAttribution = {
  licenseShortName: string | null;
  licenseUrl: string | null;
  artist: string | null;
  attributionRequired: boolean;
};

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
      artist: meta.Artist?.value ?? null,
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

async function fetchFromWikidata(playerName: string): Promise<PlayerEnrichment> {
  const candidates = await searchEntity(playerName);
  const match = pickFootballerCandidate(candidates);
  if (!match) return EMPTY_ENRICHMENT;
  const qid = match.id;

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
  playerName: string
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

  const enrichment = await fetchFromWikidata(playerName);
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
