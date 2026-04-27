import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BuyInStatus } from "@/components/dashboard/buy-in-status";
import { getGroup, getMembers } from "@/lib/services/groups";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [group, members] = await Promise.all([
    getGroup("grp_titans"),
    getMembers("grp_titans"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Tech Titans World Cup</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Admin Panel
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BuyInStatus group={group} members={members} />

        <Card variant="glass" className="p-6 flex flex-col items-center justify-center text-center">
          <ShieldCheck size={40} className="text-pitch-600 mb-4" />
          <div className="font-display text-2xl uppercase text-white mb-2">
            More controls coming
          </div>
          <p className="text-pitch-400 text-sm max-w-xs">
            Scoring rule toggles, payout split editor, invite link generator, and member management.
          </p>
        </Card>
      </div>
    </div>
  );
}