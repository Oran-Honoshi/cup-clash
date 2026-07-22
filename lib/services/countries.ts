import { createClient } from "@supabase/supabase-js";
import { sbAdmin } from "@/lib/supabase/admin";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface CountryRow {
  id: string;
  code: string;
  name: string;
  flag: string;
}

export async function getCountries(): Promise<CountryRow[]> {
  const { data } = await sb()
    .from("countries")
    .select("id, code, name, flag")
    .order("name", { ascending: true });
  return (data ?? []) as CountryRow[];
}

// Resolves a user's country-follows down to the competition ids that
// belong to those countries (via competitions.country), so "Following"
// filters that already OR against followedCompetitionIds pick up
// country-follows for free — no separate country branch needed at the
// query layer. teams.country is unpopulated app-wide today (see migration
// 037), so this only reaches matches/articles through their competition,
// not through a team's home country.
export async function getFollowedCompetitionIdsViaCountry(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const admin = sbAdmin();

  const { data: follows } = await admin
    .from("user_follows")
    .select("followed_id")
    .eq("user_id", userId)
    .eq("followed_type", "country");
  const countryIds = ((follows ?? []) as Array<{ followed_id: string }>).map((r) => r.followed_id);
  if (countryIds.length === 0) return new Set();

  const { data: countries } = await admin.from("countries").select("name").in("id", countryIds);
  const countryNames = ((countries ?? []) as Array<{ name: string }>).map((c) => c.name);
  if (countryNames.length === 0) return new Set();

  const { data: competitions } = await admin.from("competitions").select("id").in("country", countryNames);
  return new Set(((competitions ?? []) as Array<{ id: string }>).map((c) => c.id));
}
