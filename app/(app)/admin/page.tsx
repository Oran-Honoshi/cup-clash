export const dynamic = "force-dynamic";

import { AdminPanel } from "@/components/admin/admin-panel";
import { ScoringRulesEditor } from "@/components/admin/scoring-rules-editor";
import { getGroup, getMembers } from "@/lib/services/groups";
import { getCurrentUserGroup } from "@/lib/services/user-group";

export default async function AdminPage() {
  const { groupId } = await getCurrentUserGroup();
  const [group, members] = await Promise.all([
    getGroup(groupId),
    getMembers(groupId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Admin Panel
        </h1>
      </div>
      <AdminPanel group={group} initialMembers={members} />
      <ScoringRulesEditor groupId={group.id} />
    </div>
  );
}
