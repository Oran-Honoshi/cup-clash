export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup?next=/settings");

  return <SettingsClient userId={userProfile.id} initialTab={searchParams.tab} />;
}
