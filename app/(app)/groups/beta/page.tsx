export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { getUserGroups, calculateTotalEarnings } from "@/lib/services/multi-group";
import { MultiGroupDashboard } from "@/components/groups/multi-group-dashboard";
import { ENABLE_BETA_FEATURES } from "@/lib/feature-flags";

export default async function GroupsBetaPage() {
  if (!ENABLE_BETA_FEATURES) notFound();

  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup?next=/groups/beta");

  const groups        = await getUserGroups(userProfile.id);
  const totalEarnings = calculateTotalEarnings(groups);
  const totalPot       = groups.reduce((sum, g) => sum + g.potTotal, 0);

  return (
    <div className="space-y-6 pb-32">
      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-block"
        style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
        Beta — Your Groups
      </span>
      <MultiGroupDashboard groups={groups} totalEarnings={totalEarnings} totalPot={totalPot} />
    </div>
  );
}
