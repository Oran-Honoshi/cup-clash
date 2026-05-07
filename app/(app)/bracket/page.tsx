export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { KnockoutBracket } from "@/components/dashboard/knockout-bracket";
import { getCurrentUserGroup } from "@/lib/services/user-group";

export default async function BracketPage() {
  const { groupId, userId } = await getCurrentUserGroup();
  if (!userId) redirect("/signin");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">World Cup 2026</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Knockout Bracket
        </h1>
        <p className="text-sm mt-2" style={{ color: "#64748b" }}>
          Teams confirmed after the group stage concludes June 29.
        </p>
      </div>
      <KnockoutBracket groupId={groupId ?? ""} />
    </div>
  );
}