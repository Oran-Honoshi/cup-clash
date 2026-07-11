import { serverT } from "@/lib/server-locale";
export const dynamic = "force-dynamic";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DashboardCarousel }  from "@/components/dashboard/dashboard-carousel";
import { DashboardPopups }   from "@/components/dashboard/dashboard-popups";
import { GroupSwipeSelector } from "@/components/groups/group-swipe-selector";
import { WelcomeModal }      from "@/components/ui/welcome-modal";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { AdBanner }          from "@/components/ads/ad-banner";
import { GroupPersistRedirect } from "@/components/app/group-persist-redirect";
import { OnboardingTour }    from "@/components/onboarding/onboarding-tour";
import { MyTeamsSection, type MyTeamEntry } from "@/components/dashboard/my-teams-section";
import { NewsHeroSection } from "@/components/dashboard/news-hero-section";
import { getMembers, getGroup } from "@/lib/services/groups";
import { getUpcomingMatches, getRecentResultsByTeam } from "@/lib/services/matches";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { getFollowedTeamIds } from "@/lib/services/follows";
import { getHeroArticle } from "@/lib/services/news";
import { getTeamsByIds } from "@/lib/services/teams";
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
        background: "var(--ip)",
        border: "1px solid var(--br)",
        borderRadius: 16,
        padding: "16px 20px",
        marginBottom: 24,
      }}
    >
      <div>
        <div className="text-sm" style={{ color: "var(--t2)" }}>
          👋 {serverT("dash_guest_banner")}
        </div>
        <div className="text-xs mt-0.5 ta-meta">
          {serverT("dash_guest_sub")}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/create-group">
          <button
            className="font-bold text-sm"
            style={{
              background: "var(--ac)",
              color: "var(--at)",
              borderRadius: 10,
              padding: "8px 16px",
            }}
          >
            Create Group
          </button>
        </Link>
        <Link href="/signin">
          <button
            className="font-bold text-sm"
            style={{
              background: "var(--ip)",
              border: "1px solid var(--br)",
              borderRadius: 10,
              padding: "8px 16px",
              color: "var(--tx)",
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
      <div className="ta-stadium-bg w-full max-w-full overflow-x-hidden">
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

  // My Teams — real followed teams + their last 5 finished results.
  const followedTeamIds = await getFollowedTeamIds(userProfile.id);
  const followedTeamIdList = Array.from(followedTeamIds);
  const [followedTeams, resultsByTeam, heroArticle] = await Promise.all([
    getTeamsByIds(followedTeamIdList),
    getRecentResultsByTeam(followedTeamIdList, 5),
    getHeroArticle(userProfile.id),
  ]);
  const myTeams: MyTeamEntry[] = followedTeams.map((team) => ({
    team,
    results: resultsByTeam.get(team.id) ?? [],
  }));

  // No groups: show rich empty state with clear paths
  if (!allGroups.length) {
    return (
      <div className="ta-stadium-bg w-full max-w-full overflow-x-hidden space-y-6">
        <WelcomeModal forceOpen={false} />
        <MyTeamsSection teams={myTeams} teamCountry={userProfile.country} />
        <NewsHeroSection article={heroArticle} />
        <DashboardEmptyState />
        <AdBanner isAdFree={false} isCorporate={false} />
      </div>
    );
  }

  // Active group from URL param or first group
  const activeGroupId = searchParams.group && allGroups.find(g => g.id === searchParams.group)
    ? searchParams.group
    : allGroups[0].id;

  const activeGroup = allGroups.find(g => g.id === activeGroupId)!;

  type AdStatus = { is_ad_free: boolean; groups: { is_corporate_paid: boolean } | null } | null;
  const [members, group, upcomingMatches, adStatusResult] = await Promise.all([
    getMembers(activeGroupId),
    getGroup(activeGroupId),
    getUpcomingMatches(5),
    sbAdmin()
      .from("group_members")
      .select("is_ad_free, groups(is_corporate_paid)")
      .eq("user_id", userProfile.id)
      .eq("group_id", activeGroupId)
      .maybeSingle(),
  ]);
  const adStatus = adStatusResult.data as AdStatus;
  const isAdFree    = adStatus?.is_ad_free ?? false;
  const isCorporate = adStatus?.groups?.is_corporate_paid ?? false;

  const currentMember = members.find(m => m.id === userProfile.id) ?? members[0];
  const rank          = members.findIndex(m => m.id === userProfile.id) + 1;
  const isAdmin       = group.admin === userProfile.id;

  return (
    <div className="ta-stadium-bg" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <GroupPersistRedirect groups={allGroups} basePath="/dashboard" />
      <OnboardingTour />
      <WelcomeModal />
      <DashboardPopups groupId={activeGroupId} userId={userProfile.id} />

      {/* Group swipe selector — shown when user belongs to multiple groups */}
      {allGroups.length > 1 && (
        <div id="tour-group-selector" className="-mx-4 sm:-mx-6" style={{ flexShrink: 0 }}>
          <GroupSwipeSelector groups={allGroups} activeGroupId={activeGroupId} basePath="/dashboard" />
        </div>
      )}

      {isAdmin && (
        <Link
          href={`/admin/${activeGroupId}`}
          className="-mx-4 sm:-mx-6 flex items-center justify-between gap-2 px-4 sm:px-6 py-2 shrink-0"
          style={{ background: "rgba(251,191,36,0.08)", borderBottom: "1px solid rgba(251,191,36,0.2)" }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
            Admin
          </span>
          <span className="text-xs font-bold" style={{ color: "#fbbf24" }}>
            Manage this group →
          </span>
        </Link>
      )}

      <MyTeamsSection teams={myTeams} />
      <NewsHeroSection article={heroArticle} />

      {/* 3-panel carousel — fills remaining space, but never shrinks below a
          usable height; once fixed content above (News, My Teams, etc.) grows
          past the viewport, the page scrolls to reach the rest instead of
          clipping it. */}
      <div className="-mx-4 sm:-mx-6" style={{ flex: 1, minHeight: 320, display: "flex", flexDirection: "column" }}>
        <DashboardCarousel
          matches={upcomingMatches}
          members={members}
          groupId={activeGroupId}
          groupName={group.name}
          currentUserId={userProfile.id}
          rank={rank}
          totalPlayers={members.length}
          isAdFree={isAdFree}
          isCorporate={isCorporate}
        />
      </div>
    </div>
  );
}