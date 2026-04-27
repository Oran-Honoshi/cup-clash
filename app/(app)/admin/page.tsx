export const dynamic = "force-dynamic";

import { AdminPanel } from "@/components/admin/admin-panel";
import { getGroup, getMembers } from "@/lib/services/groups";

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
      <AdminPanel group={group} initialMembers={members} />
    </div>
  );
}
