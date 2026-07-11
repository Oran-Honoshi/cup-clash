export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { getCurrentUserProfile } from "@/lib/services/user-group";
import { ENABLE_BETA_FEATURES } from "@/lib/feature-flags";

export default async function NotificationsPage() {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) redirect("/signup");

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Preferences</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "var(--tx)" }}>
          Notifications
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--mt)" }}>
          Choose when and how Cup Clash notifies you.
        </p>
        {ENABLE_BETA_FEATURES && (
          <Link href="/notifications/beta" className="text-[10px] font-bold uppercase tracking-widest inline-block mt-2" style={{ color: "#10b981" }}>
            Try the Beta notifications view →
          </Link>
        )}
      </div>
      <NotificationsClient userId={userProfile.id} />
    </div>
  );
}