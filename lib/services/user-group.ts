// lib/services/user-group.ts
// Resolves the current authenticated user's group ID.
// Falls back to the mock group ID if Supabase isn't configured.

import { MOCK_GROUP } from "@/lib/mocks/data";

export const MOCK_GROUP_ID = "grp_titans";

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

interface UserGroupResult {
  groupId: string;
  isMock: boolean;
  userId: string | null;
}

/**
 * Gets the group ID for the currently signed-in user.
 * - Checks Supabase for the user's group membership
 * - Falls back to mock group if no Supabase or no membership
 * Must be called from Server Components only (uses server-side Supabase client).
 */
export async function getCurrentUserGroup(): Promise<UserGroupResult> {
  const sb = getSupabaseClient();
  if (!sb) return { groupId: MOCK_GROUP_ID, isMock: true, userId: null };

  try {
    // Use server client for auth
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const serverSb = createServerClient();

    const { data: { user } } = await serverSb.auth.getUser();
    if (!user) return { groupId: MOCK_GROUP_ID, isMock: true, userId: null };

    // Find the user's most recently joined group
    const { data: membership } = await sb
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1)
      .single();

    if (!membership) return { groupId: MOCK_GROUP_ID, isMock: true, userId: user.id };

    return {
      groupId: (membership as { group_id: string }).group_id,
      isMock: false,
      userId: user.id,
    };
  } catch {
    return { groupId: MOCK_GROUP_ID, isMock: true, userId: null };
  }
}

/**
 * Gets the current user's profile (name, country, avatar).
 */
export async function getCurrentUserProfile() {
  const sb = getSupabaseClient();
  if (!sb) return { id: "1", name: "Player", country: "ARG", avatarUrl: null };

  try {
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const serverSb = createServerClient();
    const { data: { user } } = await serverSb.auth.getUser();
    if (!user) return null;

    const { data } = await sb
      .from("profiles")
      .select("id, name, country, avatar_url")
      .eq("id", user.id)
      .single();

    if (!data) return null;
    const d = data as { id: string; name: string; country: string | null; avatar_url: string | null };
    return { id: d.id, name: d.name, country: d.country ?? "", avatarUrl: d.avatar_url };
  } catch {
    return null;
  }
}
