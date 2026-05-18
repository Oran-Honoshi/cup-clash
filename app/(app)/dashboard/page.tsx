export const dynamic = "force-dynamic";

import { redirect }        from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Leaderboard }     from "@/components/dashboard/leaderboard";
import { NextMatchCard }   from "@/components/dashboard/next-match-card";
import { BuyInStatus }     from "@/components/dashboard/buy-in-status";
import { StatCards }       from "@/components/dashboard/stat-cards";
import { DashboardPopups } from "@/components/dashboard/dashboard-popups";
import { WallOfShame }     from "@/components/dashboard/wall-of-shame";
import { DashboardGroupPicker } from "@/components/dashboard/dashboard-group-picker";
import { WelcomeModal }    from "@/components/ui/welcome-modal";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { getLeaderboard, getMembers, getGroup } from "@/lib/services/groups";
import { getNextMatch }    from "@/lib/services/matches";
import { getCurrentUserProfile } from "@/lib/services/user-group";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  // Get all groups this user belongs to
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id, payment_status, groups(id, name, passkey)")
    .eq("user_id", userProfile.id)
    .eq("payment_status", "paid")
    .order("joined_at", { ascending: false });

  const allGroups = (memberships ?? [])
    .map((m: unknown) => {
      const row = m as { group_id: string; groups: { id: string; name: string; passkey: string } | null };
      return row.groups ? { id: row.groups.id, name: row.groups.name, passkey: row.groups.passkey } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  // No groups — show rich empty state with clear paths
  if (!allGroups.length) {
    return (
      <div className="space-y-6">
        <WelcomeModal forceOpen={false} />
        <DashboardEmptyState />
      </div>
    );
  }

  // Active group from URL param or first group
  const activeGroupId = searchParams.group && allGroups.find(g => g.id === searchParams.group)
    ? searchParams.group
    : allGroups[0].id;

  const activeGroup = allGroups.find(g => g.id === activeGroupId)!;

  const [members, top8, group, nextMatch] = await Promise.all([
    getMembers(activeGroupId),
    getLeaderboard(activeGroupId, 8),
    getGroup(activeGroupId),
    getNextMatch(),
  ]);

  const currentMember = members.find(m => m.id === userProfile.id) ?? members[0];
  const rank          = members.findIndex(m => m.id === userProfile.id) + 1;
  const isPaid        = members.find(m => m.id === userProfile.id)?.paid ?? false;
  const isAdmin       = group.admin === userProfile.id;

  return (
    <div className="space-y-6">
      <WelcomeModal />
      <DashboardPopups groupId={activeGroupId} userId={userProfile.id} />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="label-caps mb-1">{group.name}</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
            Dashboard
          </h1>
          {isAdmin && (
            <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>
              Admin · Passkey: <span className="font-mono font-bold">{group.passkey}</span>
            </p>
          )}
        </div>
        {allGroups.length > 1 && (
          <DashboardGroupPicker
            groups={allGroups}
            activeGroupId={activeGroupId}
          />
        )}
      </div>

      <StatCards
        rank={isPaid ? rank : 0}
        points={currentMember?.points ?? 0}
        totalPlayers={members.filter(m => m.paid).length}
        correctPredictions={currentMember?.correctPredictions ?? 0}
        exactScores={currentMember?.exactScores ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <Leaderboard
            members={top8}
            currentUserId={userProfile.id}
            groupId={activeGroupId}
            showGhost
          />
          <WallOfShame members={members} totalMatches={48} />
        </div>
        <div className="lg:col-span-5 space-y-5">
          {nextMatch && <NextMatchCard match={nextMatch} groupId={activeGroupId} />}
          <BuyInStatus group={group} members={members} />
        </div>
      </div>
    </div>
  );
}