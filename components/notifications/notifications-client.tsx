"use client";
import { useLocale } from "@/components/i18n/locale-provider";

import { useState, useEffect } from "react";
import { Bell, BellOff, Trophy, Users, MessageCircle, Check, Send, X } from "lucide-react";
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
  { key: "goals",       label: "Goal scored",         desc: "Get notified when a goal is scored in a live match", icon: <span className="text-lg">⚽</span>,                                  default: true  },
  { key: "results",     label: "Match result",         desc: "Final score when a match ends",                      icon: <Trophy size={18} style={{ color: "#fbbf24" }} />,                   default: true  },
  { key: "leaderboard", label: "Leaderboard change",   desc: "When your rank changes after a result",              icon: <span className="text-lg">📊</span>,                                  default: true  },
  { key: "chat",        label: "New chat message",     desc: "When someone messages in your group chat",           icon: <MessageCircle size={18} style={{ color: "#00D4FF" }} />,            default: false },
  { key: "newmember",   label: "New member joined",    desc: "When someone joins your group (admin only)",         icon: <Users size={18} style={{ color: "#00FF88" }} />,                    default: false },
];

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

const BOT_USERNAME = "CupClashBot";

export function NotificationsClient({ userId }: { userId: string }) {
  const { t } = useLocale();
  const SETTING_LABELS: Record<string, string> = {
    goals:       t("notif_goal"),
    results:     t("notif_result"),
    leaderboard: t("notif_leaderboard"),
    chat:        t("notif_chat"),
    newmember:   t("notif_new_member"),
  };
  const [settings,       setSettings]       = useState<Record<string, boolean>>({});
  const [pushEnabled,    setPushEnabled]     = useState(false);
  const [loading,        setLoading]         = useState(false);
  const [telegramChatId, setTelegramChatId]  = useState<string | null | undefined>(undefined);
  const [tgDisconnecting, setTgDisconnecting] = useState(false);

  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    SETTINGS.forEach(s => { defaults[s.key] = s.default; });

    const stored = localStorage.getItem("cupclash_notif_settings");
    setSettings(stored ? { ...defaults, ...JSON.parse(stored) } : defaults);

    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }

    // Load telegram_chat_id + server-synced notification preferences from profile
    async function loadProfile() {
      const sb = createClient();
      const { data } = await sb
        .from("profiles")
        .select("telegram_chat_id, notification_preferences")
        .eq("id", userId)
        .maybeSingle();
      const row = data as { telegram_chat_id: string | null; notification_preferences: Record<string, boolean> | null } | null;
      setTelegramChatId(row?.telegram_chat_id ?? null);
      if (row?.notification_preferences) {
        const merged = { ...defaults, ...row.notification_preferences };
        setSettings(merged);
        localStorage.setItem("cupclash_notif_settings", JSON.stringify(merged));
      }
    }
    loadProfile();
  }, [userId]);

  const toggleSetting = (key: string) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("cupclash_notif_settings", JSON.stringify(next));
      const sb = createClient();
      sb.from("profiles").update({ notification_preferences: next }).eq("id", userId).then();
      return next;
    });
  };

  const disconnectTelegram = async () => {
    setTgDisconnecting(true);
    const sb = createClient();
    await sb.from("profiles").update({ telegram_chat_id: null }).eq("id", userId);
    setTelegramChatId(null);
    setTgDisconnecting(false);
  };

  // Detect iOS to show install-to-home-screen note
  const isIOS = typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  const enablePush = async () => {
    setLoading(true);
    const success = await subscribeToPush(userId);
    setPushEnabled(success);
    setLoading(false);
  };

  return (
    <div className="space-y-5 max-w-lg">

      {/* Telegram connection card */}
      <div className="rounded-2xl p-5" style={glass}>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-xl"
            style={telegramChatId
              ? { background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)" }
              : { background: "rgba(0,136,204,0.1)", border: "1px solid rgba(0,136,204,0.25)" }}>
            ✈️
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base text-white">
              {telegramChatId ? t("notif_tg_connected") : t("notif_tg_connect")}
            </div>
            {telegramChatId ? (
              <>
                <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  You&apos;ll receive match reminders 1 hour before kickoff when you haven&apos;t predicted yet. Works on all devices.
                </div>
                <button onClick={disconnectTelegram} disabled={tgDisconnecting}
                  className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-opacity"
                  style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                  <X size={12} />
                  {tgDisconnecting ? t("notif_disconnecting") : "Disconnect"}
                </button>
              </>
            ) : (
              <>
                <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Get a Telegram message 1 hour before kickoff if you haven&apos;t predicted. Reliable on all devices — no browser install needed.
                </div>
                {isIOS && (
                  <div className="mt-2 text-xs rounded-lg px-3 py-2"
                    style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(251,191,36,0.8)" }}>
                    ℹ️ On iOS, browser push requires &ldquo;Add to Home Screen.&rdquo; Telegram reminders work without it.
                  </div>
                )}
                {telegramChatId === null && (
                  <a
                    href={`https://t.me/${BOT_USERNAME}?start=${userId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #229ED9, #1A86BA)", color: "#ffffff" }}>
                    <Send size={14} />
                    Connect Telegram
                  </a>
                )}
              </>
            )}
          </div>
          {telegramChatId && (
            <div className="shrink-0">
              <Check size={18} style={{ color: "#00FF88" }} />
            </div>
          )}
        </div>
      </div>

      {/* Push permission card */}
      <div className="rounded-2xl p-5" style={glass}>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
            style={pushEnabled ? {
              background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)",
            } : {
              background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
            }}>
            {pushEnabled
              ? <Bell size={22} style={{ color: "#00FF88" }} />
              : <BellOff size={22} style={{ color: "#00D4FF" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base text-white">
              {pushEnabled ? t("notif_push_on") : t("notif_push_off")}
            </div>
            <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {pushEnabled
                ? t("notif_push_on_desc")
                : t("notif_push_off_desc")}
            </div>
            {!pushEnabled && (
              <button onClick={enablePush} disabled={loading}
                className="mt-3 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-50 transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                {loading ? t("notif_enabling") : "Enable notifications"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Per-type settings */}
      <div className="rounded-2xl overflow-hidden" style={glass}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            Notification types
          </div>
        </div>
        {SETTINGS.map((s, i) => (
          <div key={s.key}
            className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="shrink-0 w-7 flex items-center justify-center">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">{SETTING_LABELS[s.key] ?? s.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.desc}</div>
            </div>
            {/* Toggle */}
            <button onClick={() => toggleSetting(s.key)}
              className="relative h-6 w-11 rounded-full shrink-0 transition-all"
              style={{ background: settings[s.key] ? "#00D4FF" : "rgba(255,255,255,0.12)" }}>
              <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all"
                style={{ left: settings[s.key] ? "22px" : "2px" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}