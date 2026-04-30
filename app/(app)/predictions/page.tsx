export const dynamic = "force-dynamic";

import { PredictionsClient } from "@/components/predictions/predictions-client";
import { getCurrentUserGroup } from "@/lib/services/user-group";

export default async function PredictionsPage() {
  const { groupId } = await getCurrentUserGroup();
  return <PredictionsClient groupId={groupId} />;
}