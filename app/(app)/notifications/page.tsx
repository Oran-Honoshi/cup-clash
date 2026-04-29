export const dynamic = "force-dynamic";

import { NotificationsClient } from "@/components/notifications/notifications-client";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="label-caps mb-1">Inbox</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Notifications
        </h1>
      </div>
      <NotificationsClient />
    </div>
  );
}
