export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { PredictionsClient } from "@/components/predictions/predictions-client";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";

export default async function PredictionsPage() {
  const [userGroup, userProfile] = await Promise.all([
    getCurrentUserGroup(),
    getCurrentUserProfile(),
  ]);

  // Must be signed in
  if (!userProfile) redirect("/signin");

  // Must be in a group
  if (!userGroup.groupId) redirect("/dashboard");

  return (
    <PredictionsClient
      groupId={userGroup.groupId}
      userId={userProfile.id}
      isPaid={userGroup.isPaid}
    />
  );
}