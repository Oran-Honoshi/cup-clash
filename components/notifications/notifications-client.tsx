"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Goal, Users, Trophy, MessageCircle, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToPush } from "@/lib/pwa";

interface NotifSetting {
  key:     string;
  label:   string;
  desc:    string;
  icon:    React.ReactNode;
  default: boolean;
}

const SETTINGS: NotifSetting[] = [
  { key: "goals",     label: "Goal scored",       desc: "Get notified when a goal is scored in a live match", icon: <span className="text-lg">⚽</span>, default: true  },
  { key: "results",   label: "Match result",       desc: "Final score when a match ends",                      icon: <Trophy size={18} style={{ color: "#d97706" }} />,  default: true  },
  { key: "leaderboard", label: "Leaderboard change", desc: "When your rank changes after a result",            icon: <span className="text-lg">📊</span>, default: true  },
  { key: "chat",      label: "New chat message",   desc: "When someone messages in your group chat",           icon: <MessageCircle size={18} style={{ color: "#0891B2" }} />, default: false },
  { key: "newmember", label: "New member joined",  desc: "When someone joins your group (admin only)",         icon: <Users size={18} style={{ color: "#059669" }} />,   default: false },
];

export function NotificationsClient({ userId }: { userId: string }) {
  const [settings,   setSettings]   = useState<Record<string, boolean>>({});
  const [pushEnabled,setPushEnabled]= useState(false);
  const [loading,    setLoading]    = useState(false);
  const [saved,      setSaved]      = useState(false);

  useEffect(() => {
    // Load from localStorage (preference only, not sensitive data)
    const stored = localStorage.getItem("cupclash_notif_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    } else {
      const defaults: Record<string, boolean> = {};
      SETTINGS.forEach(s => { defaults[s.key] = s.default; });
      setSettings(defaults);
    }

    // Check if push is already enabled
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const toggleSetting = (key: string) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("cupclash_notif_settings", JSON.stringify(next));
      return next;
    });
  };

  const enablePush = async () => {
    setLoading(true);
    const success = await subscribeToPush(userId);
    setPushEnabled(success);
    setLoading(false);
    if (success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const saveSettings = () => {
    localStorage.setItem("cupclash_notif_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg">

      {/* Push permission card */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: pushEnabled ? "rgba(0,255,136,0.12)" : "rgba(0,212,255,0.08)", border: `1px solid ${pushEnabled ? "rgba(0,255,136,0.25)" : "rgba(0,212,255,0.2)"}` }}>
            {pushEnabled ? <Bell size={22} style={{ color: "#00c46a" }} /> : <BellOff size={22} style={{ color: "#0891B2" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base" style={{ color: "#0F172A" }}>
              {pushEnabled ? "Push notifications enabled" : "Enable push notifications"}
            </div>
            <div className="text-sm mt-0.5" style={{ color: "#64748b" }}>
              {pushEnabled
                ? "You'll get notified about goals, results and leaderboard changes."
                : "Get notified about goals, results, and when your rank changes — even when the app is closed."}
            </div>
            {!pushEnabled && (
              <button onClick={enablePush} disabled={loading}
                className="mt-3 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                {loading ? "Enabling..." : "Enable notifications"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Per-type settings */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
            Notification types
          </div>
        </div>
        {SETTINGS.map((s, i) => (
          <div key={s.key}
            className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
            style={{ borderColor: "rgba(0,212,255,0.06)" }}>
            <div className="shrink-0">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold" style={{ color: "#0F172A" }}>{s.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{s.desc}</div>
            </div>
            <button onClick={() => toggleSetting(s.key)}
              className="relative h-6 w-11 rounded-full shrink-0 transition-all"
              style={{ background: settings[s.key] ? "#00D4FF" : "#e2e8f0" }}>
              <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                style={{ left: settings[s.key] ? "22px" : "2px" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Save button */}
      <button onClick={saveSettings}
        className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
        style={saved ? {
          background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.25)", color: "#059669",
        } : {
          background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B",
        }}>
        {saved ? <><Check size={16} /> Saved!</> : "Save preferences"}
      </button>
    </div>
  );
}