"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileTab } from "@/components/settings/profile-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";

type SettingsTab = "profile" | "notifications" | "preferences";
const TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile",       label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "preferences",   label: "Preferences" },
];

interface SettingsClientProps {
  userId: string;
  initialTab?: string;
}

export function SettingsClient({ userId, initialTab }: SettingsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>(
    TABS.some(t => t.id === initialTab) ? (initialTab as SettingsTab) : "profile"
  );

  function selectTab(next: SettingsTab) {
    setTab(next);
    router.replace(`/settings?tab=${next}`, { scroll: false });
  }

  return (
    <div className={`space-y-6 ${zoneFontVars}`}>
      <div>
        <div className="label-caps mb-1">Account</div>
        <h1 style={{ fontFamily: "var(--font-zone-display)", fontSize: 32, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "var(--tx)" }}>
          Settings
        </h1>
      </div>

      {/* Sub-sector pill row — same pattern as Group Detail / Newsroom filters */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => selectTab(t.id)}
              className="shrink-0 rounded-full transition-all"
              style={{
                padding: "8px 16px",
                fontFamily: "var(--font-zone-body)",
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                background: active ? "var(--ac)" : "var(--ip)",
                color: active ? "var(--at)" : "var(--mt)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "notifications" && <NotificationsClient userId={userId} />}
      {tab === "preferences" && <PreferencesTab />}
    </div>
  );
}
