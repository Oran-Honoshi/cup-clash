import { createClient } from "@supabase/supabase-js";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface CompetitionRow {
  id: string;
  name: string;
  type: "league" | "cup" | "tournament";
  confederation: string | null;
  logoUrl: string | null;
  slug: string;
}

export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const WORLD_CUP_SLUG = "world-cup-2026";

export async function getCompetitions(): Promise<CompetitionRow[]> {
  const { data } = await sb()
    .from("competitions")
    .select("id, name, type, confederation, logo_url")
    .order("name", { ascending: true });

  const rows = ((data ?? []) as Array<{
    id: string; name: string; type: string; confederation: string | null; logo_url: string | null;
  }>).map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as CompetitionRow["type"],
    confederation: c.confederation,
    logoUrl: c.logo_url,
    slug: slugify(c.name),
  }));

  // World Cup first, then alphabetical (already sorted by the query above).
  return rows.sort((a, b) => (a.slug === WORLD_CUP_SLUG ? -1 : b.slug === WORLD_CUP_SLUG ? 1 : 0));
}
