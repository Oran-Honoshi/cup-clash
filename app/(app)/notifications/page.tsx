export const dynamic = "force-dynamic";

import { NotificationsClient } from "@/components/notifications/notifications-client";
import { NotificationSettings } from "@/components/notifications/notification-settings";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="label-caps mb-1">Inbox</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Notifications
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="label-caps mb-3">Recent</div>
          <NotificationsClient />
        </div>
        <div>
          <div className="label-caps mb-3">Settings</div>
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}
