import { serverT } from "@/lib/server-locale";
export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Leaderboard }     from "@/components/dashboard/leaderboard";
import { NextMatchCard }   from "@/components/dashboard/next-match-card";
import { StatCards }       from "@/components/dashboard/stat-cards";
import { DashboardPopups } from "@/components/dashboard/dashboard-popups";
import { WallOfShame }     from "@/components/dashboard/wall-of-shame";
import { DashboardGroupPicker } from "@/components/dashboard/dashboard-group-picker";
import { WelcomeModal }    from "@/components/ui/welcome-modal";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { getLeaderboard, getMembers, getGroup } from "@/lib/services/groups";
import { getNextMatch }    from "@/lib/services/matches";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function GuestBanner() {
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{
        background: "rgba(0,255,136,0.08)",
        border: "1px solid rgba(0,255,136,0.2)",
        borderRadius: 16,
        padding: "16px 20px",
        marginBottom: 24,
      }}
    >
      <div>
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
          👋 {serverT("dash_guest_banner")}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          {serverT("dash_guest_sub")}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/create-group">
          <button
            className="font-bold text-sm"
            style={{
              background: "linear-gradient(135deg, #00FF88, #00D4FF)",
              color: "#0B141B",
              borderRadius: 10,
              padding: "8px 16px",
            }}
          >
            Create Group
          </button>
        </Link>
        <Link href="/signin">
          <button
            className="font-bold text-sm text-white"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: "8px 16px",
            }}
          >
            Sign in
          </button>
        </Link>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { group?: string; action?: string };
}) {
  const userProfile = await getCurrentUserProfile();

  // Guest mode: explore without account
  if (!userProfile) {
    return (
      <div>
        <GuestBanner />
        <DashboardEmptyState highlight={searchParams.action} />
      </div>
    );
  }

  // Get all groups this user belongs to
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id, groups(id, name, passkey)")
    .eq("user_id", userProfile.id)
    .order("joined_at", { ascending: false });

  const allGroups = (memberships ?? [])
    .map((m: unknown) => {
      const row = m as { group_id: string; groups: { id: string; name: string; passkey: string } | null };
      return row.groups ? { id: row.groups.id, name: row.groups.name, passkey: row.groups.passkey } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  // No groups: show rich empty state with clear paths
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
  const isAdmin       = group.admin === userProfile.id;

  return (
    <div className="space-y-6">
      <WelcomeModal />
      <DashboardPopups groupId={activeGroupId} userId={userProfile.id} />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-ui)",
            }}
          >
            {group.name}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
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
        rank={rank}
        points={currentMember?.points ?? 0}
        totalPlayers={members.length}
        correctPredictions={currentMember?.correctPredictions ?? 0}
        exactScores={currentMember?.exactScores ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Primary action — first on mobile, right column on desktop */}
        <div className="lg:col-span-5 space-y-5 order-first lg:order-last">
          {nextMatch && <NextMatchCard match={nextMatch} groupId={activeGroupId} />}
        </div>
        {/* Secondary — leaderboard + wall, below on mobile, left on desktop */}
        <div className="lg:col-span-7 space-y-5">
          <Leaderboard
            members={top8}
            currentUserId={userProfile.id}
            groupId={activeGroupId}
            showGhost
          />
          <WallOfShame members={members} totalMatches={48} />
        </div>
      </div>
    </div>
  );
}