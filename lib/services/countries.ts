import { createClient } from "@supabase/supabase-js";

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
