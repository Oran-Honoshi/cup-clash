export const dynamic = "force-dynamic";

import { redirect }   from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { PredictionsClient } from "@/components/predictions/predictions-client";
import { getCurrentUserProfile } from "@/lib/services/user-group";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  // Get all groups this user belongs to
  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id, payment_status, groups(id, name, passkey)")
    .eq("user_id", userProfile.id)
    .eq("payment_status", "paid");

  const groups = (memberships ?? [])
    .map((m: unknown) => {
      const row = m as { group_id: string; payment_status: string; groups: { id: string; name: string; passkey: string } | null };
      return row.groups;
    })
    .filter(Boolean) as Array<{ id: string; name: string; passkey: string }>;

  // Solo user — no paid groups, still allow predictions
  if (!groups.length) {
    return (
      <PredictionsClient
        groupId="solo"
        groupName="My Predictions"
        allGroups={[]}
        userId={userProfile.id}
        isPaid={false}
      />
    );
  }

  // Use group from URL param, or first group
  const activeGroupId = searchParams.group && groups.find(g => g.id === searchParams.group)
    ? searchParams.group
    : groups[0].id;

  const activeGroup = groups.find(g => g.id === activeGroupId)!;

  return (
    <PredictionsClient
      groupId={activeGroupId}
      groupName={activeGroup.name}
      allGroups={groups}
      userId={userProfile.id}
      isPaid={true}
    />
  );
}