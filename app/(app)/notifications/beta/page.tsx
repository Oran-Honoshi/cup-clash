export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { NotificationSettings } from "@/components/notifications/notification-settings";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { ENABLE_BETA_FEATURES } from "@/lib/feature-flags";

export default async function NotificationsBetaPage() {
  if (!ENABLE_BETA_FEATURES) notFound();

  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup?next=/notifications/beta");

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-block mb-2"
          style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
          Beta
        </span>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
          Notifications
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          A more granular notification preferences screen we're evaluating. Saved separately from your current preferences.
        </p>
      </div>
      <NotificationSettings />
    </div>
  );
}
