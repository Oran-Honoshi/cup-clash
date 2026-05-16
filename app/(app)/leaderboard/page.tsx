export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { LeaderboardTabs } from "@/components/dashboard/leaderboard-tabs";
import { getMembers, getGroup } from "@/lib/services/groups";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { DashboardGroupPicker } from "@/components/dashboard/dashboard-group-picker";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  // Get all paid groups for this user
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id, groups(id, name, passkey)")
    .eq("user_id", userProfile.id)
    .eq("payment_status", "paid")
    .order("joined_at", { ascending: false });

  const allGroups = (memberships ?? [])
    .map((m: unknown) => {
      const row = m as { group_id: string; groups: { id: string; name: string; passkey: string } | null };
      return row.groups ? { id: row.groups.id, name: row.groups.name, passkey: row.groups.passkey } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  if (!allGroups.length) redirect("/dashboard");

  const activeGroupId = searchParams.group && allGroups.find(g => g.id === searchParams.group)
    ? searchParams.group
    : allGroups[0].id;

  const [members, group] = await Promise.all([
    getMembers(activeGroupId),
    getGroup(activeGroupId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="label-caps mb-1">{group.name}</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
            Leaderboard
          </h1>
        </div>
        {allGroups.length > 1 && (
          <DashboardGroupPicker
            groups={allGroups}
            activeGroupId={activeGroupId}
            basePath="/leaderboard"
          />
        )}
      </div>
      <LeaderboardTabs members={members} currentUserId={userProfile.id} />
    </div>
  );
}