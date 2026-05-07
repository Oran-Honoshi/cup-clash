import { createClient } from "@supabase/supabase-js";

// ── Server-side Supabase client (reads auth cookies) ─────────────────────────

async function getServerClient() {
  try {
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    return createServerClient();
  } catch {
    // Fallback to anon client if server client unavailable
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserGroupResult {
  groupId:  string | null;
  isMock:   false;
  userId:   string | null;
  isAdmin:  boolean;
  isPaid:   boolean;
}

export interface UserProfile {
  id:        string;
  name:      string;
  country:   string;
  avatarUrl: string | null;
  email:     string | null;
}

// ── getCurrentUserGroup ───────────────────────────────────────────────────────
// Returns the group the current user most recently joined.
// Returns null groupId if the user has no group yet.

export async function getCurrentUserGroup(): Promise<UserGroupResult> {
  const EMPTY: UserGroupResult = { groupId: null, isMock: false, userId: null, isAdmin: false, isPaid: false };

  try {
    const serverSb = await getServerClient();
    const { data: { user } } = await serverSb.auth.getUser();
    if (!user) return EMPTY;

    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get most recently joined group
    const { data: membership } = await anon
      .from("group_members")
      .select("group_id, payment_status")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1)
      .single();

    if (!membership) return { ...EMPTY, userId: user.id };

    const m = membership as { group_id: string; payment_status: string };

    // Check if admin
    const { data: group } = await anon
      .from("groups")
      .select("admin_id")
      .eq("id", m.group_id)
      .single();

    const isAdmin = (group as { admin_id: string } | null)?.admin_id === user.id;
    const isPaid  = m.payment_status === "paid";

    return {
      groupId:  m.group_id,
      isMock:   false,
      userId:   user.id,
      isAdmin,
      isPaid,
    };
  } catch (e) {
    console.warn("getCurrentUserGroup error:", e);
    return { groupId: null, isMock: false, userId: null, isAdmin: false, isPaid: false };
  }
}

// ── getCurrentUserProfile ─────────────────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const serverSb = await getServerClient();
    const { data: { user } } = await serverSb.auth.getUser();
    if (!user) return null;

    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await anon
      .from("profiles")
      .select("id, name, country, avatar_url")
      .eq("id", user.id)
      .single();

    if (!data) {
      // Profile doesn't exist yet — return basic info from auth
      return {
        id:        user.id,
        name:      user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Player",
        country:   user.user_metadata?.country ?? "",
        avatarUrl: null,
        email:     user.email ?? null,
      };
    }

    const d = data as { id: string; name: string; country: string | null; avatar_url: string | null };
    return {
      id:        d.id,
      name:      d.name,
      country:   d.country ?? "",
      avatarUrl: d.avatar_url,
      email:     user.email ?? null,
    };
  } catch (e) {
    console.warn("getCurrentUserProfile error:", e);
    return null;
  }
}

// ── getAllUserGroups ───────────────────────────────────────────────────────────
// For the "My Groups" multi-group dashboard

export async function getAllUserGroups(userId: string) {
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await anon
    .from("group_members")
    .select(`
      group_id, payment_status, can_predict, joined_at,
      groups ( id, name, passkey, max_members, enrollment_fee_cents, admin_id )
    `)
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  return (data ?? []) as unknown as Array<{
    group_id: string;
    payment_status: string;
    can_predict: boolean;
    joined_at: string;
    groups: {
      id: string; name: string; passkey: string;
      max_members: number; enrollment_fee_cents: number; admin_id: string;
    } | null;
  }>;
}

// ── ensureProfile ─────────────────────────────────────────────────────────────
// Called after sign-up to make sure a profile row exists

export async function ensureProfile(params: {
  userId:  string;
  name:    string;
  email:   string;
  country: string;
}): Promise<void> {
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await anon.from("profiles").upsert({
    id:      params.userId,
    name:    params.name,
    country: params.country,
    email:   params.email,
  }, { onConflict: "id" });
}