export const dynamic = "force-dynamic";

import { redirect }            from "next/navigation";
import { sbAdmin } from "@/lib/supabase/admin";
import { AdminGroupSector }    from "@/components/admin/admin-group-sector";
import { getGroup, getMembers } from "@/lib/services/groups";
import { getCurrentUserProfile } from "@/lib/services/user-group";

export default async function AdminGroupPage({ params }: { params: { groupId: string } }) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup");

  // Verify this user is actually admin of this group
  const { data: groupCheck } = await sbAdmin()
    .from("groups")
    .select("admin_id, name")
    .eq("id", params.groupId)
    .single();

  if (!groupCheck) redirect("/groups");

  const isOwner = (groupCheck as { admin_id: string }).admin_id === userProfile.id;
  if (!isOwner) {
    // Allow co-admins
    const { data: membership } = await sbAdmin()
      .from("group_members")
      .select("role")
      .eq("group_id", params.groupId)
      .eq("user_id", userProfile.id)
      .maybeSingle();
    const memberRole = (membership as { role: string } | null)?.role;
    if (memberRole !== "admin" && memberRole !== "owner") redirect("/dashboard");
  }

  const groupId = params.groupId;
  const [group, members, finalMatch] = await Promise.all([
    getGroup(groupId),
    getMembers(groupId),
    sbAdmin().from("matches").select("status").eq("id", "final").maybeSingle(),
  ]);
  const finalLocked = (finalMatch.data as { status: string } | null)?.status === "finished";

  return (
    <AdminGroupSector
      group={group}
      members={members}
      isOwner={isOwner}
      currentUserId={userProfile.id}
      adminName={userProfile.name}
      finalLocked={finalLocked}
      groupId={groupId}
    />
  );
}
