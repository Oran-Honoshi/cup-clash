import { unstable_cache } from "next/cache";
import { sbAnon } from "@/lib/supabase/anon";
import { WORLD_CUP_SLUG, slugify, type CompetitionRow } from "./competitions";
import type { CountryRow } from "./countries";
import type { TeamRow } from "./teams";

// Cached wrappers around the slow-changing reference-data services
// (competitions/countries/teams-by-id). Kept in their own file, separate
// from competitions.ts/teams.ts/countries.ts, because those files are
// imported directly by app/(app)/create-group/page.tsx (a "use client"
// component) — unstable_cache pulls in next/cache, which cannot be
// bundled into client code. sbAnon() pins the underlying fetch to
// cache: "no-store" so Next's own implicit fetch cache can't hold a
// snapshot outside of the explicit revalidate window below; unstable_cache
// is the only caching layer in play.

async function fetchCompetitions(): Promise<CompetitionRow[]> {
  const { data } = await sbAnon()
    .from("competitions")
    .select("id, name, type, confederation, logo_url, country")
    .order("name", { ascending: true });

  const rows = ((data ?? []) as Array<{
    id: string; name: string; type: string; confederation: string | null; logo_url: string | null; country: string | null;
  }>).map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as CompetitionRow["type"],
    confederation: c.confederation,
    logoUrl: c.logo_url,
    slug: slugify(c.name),
    country: c.country,
  }));

  return rows.sort((a, b) => (a.slug === WORLD_CUP_SLUG ? -1 : b.slug === WORLD_CUP_SLUG ? 1 : 0));
}

async function fetchCountries(): Promise<CountryRow[]> {
  const { data } = await sbAnon()
    .from("countries")
    .select("id, code, name, flag")
    .order("name", { ascending: true });
  return (data ?? []) as CountryRow[];
}

async function fetchTeamsByIds(ids: string[]): Promise<TeamRow[]> {
  if (ids.length === 0) return [];
  const { data } = await sbAnon()
    .from("teams")
    .select("id, name, short_name, badge_url, country")
    .in("id", ids);
  return ((data ?? []) as Array<{
    id: string; name: string; short_name: string | null; badge_url: string | null; country: string | null;
  }>).map((row) => ({
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    badgeUrl: row.badge_url,
    country: row.country,
  }));
}

// Migration-only inserts, roughly once every few weeks — see competitions.ts.
export const getCompetitionsCached = unstable_cache(fetchCompetitions, ["competitions"], {
  revalidate: 900,
});

// Hard-seeded once (migration 069), zero runtime writes anywhere in the app.
export const getCountriesCached = unstable_cache(fetchCountries, ["countries"], {
  revalidate: 3600,
});

// Mostly migration-seeded, but league-football.ts's cron can upsert a new
// team row on a ~3h cadence (resolveTeamIds) — shortest window of the three.
export const getTeamsByIdsCached = unstable_cache(fetchTeamsByIds, ["teams-by-ids"], {
  revalidate: 300,
});
