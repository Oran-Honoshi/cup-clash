export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { PredictionsClient } from "@/components/predictions/predictions-client";
import { getCurrentUserGroup, getCurrentUserProfile } from "@/lib/services/user-group";

export default async function PredictionsPage() {
  const [{ groupId, userId, isPaid }, profile] = await Promise.all([
    getCurrentUserGroup(),
    getCurrentUserProfile(),
  ]);
  if (!profile || !groupId) redirect("/signin");
  return <PredictionsClient groupId={groupId} userId={userId ?? ""} isPaid={isPaid} />;
}