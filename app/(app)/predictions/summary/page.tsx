export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PredictionsSummaryClient } from "@/components/predictions/predictions-summary-client";
import { getAllUserGroups } from "@/lib/services/user-group";
import { getAllMatches } from "@/lib/services/matches";
import Link from "next/link";

export default async function PredictionsSummaryPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/signin");

  const memberships = await getAllUserGroups(user.id);
  const groups = memberships
    .filter(m => m.groups)
    .map(m => ({ id: m.groups!.id, name: m.groups!.name }));

  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-6">
        <div className="text-5xl">🏆</div>
        <h2 className="font-display text-2xl font-black uppercase" style={{ color: "var(--tx)" }}>No Groups Yet</h2>
        <p className="text-sm" style={{ color: "var(--t2)" }}>
          Join or create a group to see your predictions summary.
        </p>
        <Link href="/groups"
          className="px-6 py-3 rounded-2xl font-bold text-sm"
          style={{ background: "var(--ac)", color: "var(--at)" }}>
          Find a Group
        </Link>
      </div>
    );
  }

  const matches = await getAllMatches();

  return (
    <div className="pb-32">
      <PredictionsSummaryClient userId={user.id} groups={groups} matches={matches} />
    </div>
  );
}
