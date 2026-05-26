// app/(app)/groups/[groupId]/unlock/page.tsx
// Dedicated payment page for corporate unlock, same pattern as /join/[code]
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { Logo } from "@/components/logo";
import { CorporatePaymentClient } from "@/components/groups/corporate-payment-client";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function CorporateUnlockPage({
  params,
}: { params: { groupId: string } }) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  const { data: group } = await sbAdmin()
    .from("groups")
    .select("id, name, passkey, admin_id, is_corporate_paid, max_group_capacity")
    .eq("id", params.groupId)
    .single();

  if (!group) redirect("/groups");
  if (group.admin_id !== userProfile.id) redirect(`/groups/${params.groupId}`);
  if (group.is_corporate_paid) redirect(`/groups/${params.groupId}`);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F8FAFC" }}>
      <div className="w-full max-w-sm space-y-5">
        <Logo size="lg" className="justify-center" />
        <CorporatePaymentClient
          groupId={group.id}
          groupName={group.name}
        />
      </div>
    </div>
  );
}