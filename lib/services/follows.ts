import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getFollowedCompetitionIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data } = await sbAdmin()
    .from("user_follows")
    .select("followed_id")
    .eq("user_id", userId)
    .eq("followed_type", "competition");
  return new Set(((data ?? []) as Array<{ followed_id: string }>).map((r) => r.followed_id));
}

export async function getFollowedTeamIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data } = await sbAdmin()
    .from("user_follows")
    .select("followed_id")
    .eq("user_id", userId)
    .eq("followed_type", "team");
  return new Set(((data ?? []) as Array<{ followed_id: string }>).map((r) => r.followed_id));
}

// Total follow count across both types — used to decide whether the
// post-signup "Pick your teams" onboarding step has anything left to offer.
export async function getFollowCount(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const { count } = await sbAdmin()
    .from("user_follows")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}
