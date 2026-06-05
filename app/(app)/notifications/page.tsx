export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { getCurrentUserProfile } from "@/lib/services/user-group";

export default async function NotificationsPage() {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Preferences</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
          Notifications
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Choose when and how Cup Clash notifies you.
        </p>
      </div>
      <NotificationsClient userId={userProfile.id} />
    </div>
  );
}