export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { getCurrentUserProfile } from "@/lib/services/user-group";

export default async function NotificationsPage() {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signin");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Preferences</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "#0F172A" }}>
          Notifications
        </h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Choose when and how Cup Clash notifies you.
        </p>
      </div>
      <NotificationsClient userId={userProfile.id} />
    </div>
  );
}