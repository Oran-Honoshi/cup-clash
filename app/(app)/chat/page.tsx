export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function ChatPage() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/signin");

  const { data: memberships } = await sbAdmin()
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships?.length) {
    redirect(`/groups/${memberships[0].group_id}?tab=chat`);
  }

  redirect("/groups");
}
