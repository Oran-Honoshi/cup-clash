export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { LeaderboardTabs } from "@/components/dashboard/leaderboard-tabs";
import { getMembers, getGroup } from "@/lib/services/groups";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { DashboardGroupPicker } from "@/components/dashboard/dashboard-group-picker";
import { AdBanner } from "@/components/ads/ad-banner";
import Link from "next/link";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function LeaderboardPage({ searchParams }: { searchParams: { group?: string } }) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  const { data: memberships } = await sbAdmin()
    .from("group_members").select("group_id, groups(id, name, passkey)")
    .eq("user_id", userProfile.id)
    .order("joined_at", { ascending: false });

  const allGroups = (memberships ?? [])
    .map((m: unknown) => { const row = m as { group_id: string; groups: { id: string; name: string; passkey: string } | null }; return row.groups ? { id: row.groups.id, name: row.groups.name, passkey: row.groups.passkey } : null; })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  if (!allGroups.length) {
    return (
      <div className="space-y-6">
        <div>
          <div className="label-caps mb-1">Leaderboard</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">Leaderboard</h1>
        </div>
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="text-4xl mb-3">🏆</div>
          <div className="font-display text-xl uppercase font-black mb-2 text-white">No group yet</div>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Join or create a group to see the leaderboard.</p>
          <Link href="/groups" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
            Find a group
          </Link>
        </div>
        <AdBanner isAdFree={false} isCorporate={false} />
      </div>
    );
  }

  const activeGroupId = searchParams.group && allGroups.find(g => g.id === searchParams.group) ? searchParams.group : allGroups[0].id;

  type AdStatus = { is_ad_free: boolean; groups: { is_corporate_paid: boolean } | null } | null;
  const [members, group, adStatusResult] = await Promise.all([
    getMembers(activeGroupId),
    getGroup(activeGroupId),
    sbAdmin()
      .from("group_members")
      .select("is_ad_free, groups(is_corporate_paid)")
      .eq("user_id", userProfile.id)
      .eq("group_id", activeGroupId)
      .maybeSingle(),
  ]);
  const adStatus = adStatusResult.data as AdStatus;
  const isAdFree   = adStatus?.is_ad_free ?? false;
  const isCorporate = adStatus?.groups?.is_corporate_paid ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="label-caps mb-1">{group.name}</div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">Leaderboard</h1>
        </div>
        {allGroups.length > 1 && <DashboardGroupPicker groups={allGroups} activeGroupId={activeGroupId} basePath="/leaderboard" />}
      </div>
      <LeaderboardTabs members={members} currentUserId={userProfile.id} />
      <AdBanner isAdFree={isAdFree} isCorporate={isCorporate} />
    </div>
  );
}