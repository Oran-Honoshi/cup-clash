"use client";
import { useLocale } from "@/components/i18n/locale-provider";

import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Trophy, Users, MessageCircle, Check, Send, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToPush } from "@/lib/pwa";
import { TELEGRAM_PREF_DEFAULTS, type TelegramPrefKey } from "@/lib/services/telegram";

interface NotifSetting {
  key:     string;
  label:   string;
  desc:    string;
  icon:    React.ReactNode;
  default: boolean;
}

const SETTINGS: NotifSetting[] = [
  { key: "goals",          label: "Goal scored",       desc: "Get notified when a goal is scored in a live match", icon: <span className="text-lg">⚽</span>,                                  default: true  },
  { key: "results",        label: "Match result",       desc: "Final score when a match ends",                      icon: <Trophy size={18} style={{ color: "#fbbf24" }} />,                   default: true  },
  { key: "leaderboard",    label: "Leaderboard change", desc: "When your rank changes after a result",              icon: <span className="text-lg">📊</span>,                                  default: true  },
  { key: "chat",           label: "New chat message",   desc: "When someone messages in your group chat",           icon: <MessageCircle size={18} style={{ color: "#00D4FF" }} />,            default: false },
  { key: "newmember",      label: "New member joined",  desc: "When someone joins your group (admin only)",         icon: <Users size={18} style={{ color: "#00FF88" }} />,                    default: false },
  { key: "oracle_duel",    label: "Oracle Duel result", desc: "When your Beat-the-Oracle duel is settled",          icon: <span className="text-lg">🔮</span>,                                 default: false },
  { key: "match_reminder", label: "Match reminder",     desc: "24h and 1h before kickoff, if you haven't predicted",icon: <span className="text-lg">🔔</span>,                                 default: false },
];

interface TelegramSetting {
  key:  TelegramPrefKey;
  icon: React.ReactNode;
}

const TELEGRAM_SETTINGS: TelegramSetting[] = [
  { key: "goals",            icon: <span className="text-lg">⚽</span> },
  { key: "results",          icon: <Trophy size={18} style={{ color: "#fbbf24" }} /> },
  { key: "locking_reminder", icon: <span className="text-lg">⏰</span> },
  { key: "match_reminder",   icon: <span className="text-lg">🔔</span> },
  { key: "weekly_digest",    icon: <span className="text-lg">🗓️</span> },
  { key: "leaderboard",      icon: <span className="text-lg">📊</span> },
];

const glass = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
} as const;

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_TRIES   = 40; // ~2 minutes

export function NotificationsClient({ userId }: { userId: string }) {
  const { t } = useLocale();
  const SETTING_LABELS: Record<string, string> = {
    goals:          t("notif_goal"),
    results:        t("notif_result"),
    leaderboard:    t("notif_leaderboard"),
    chat:           t("notif_chat"),
    newmember:      t("notif_new_member"),
    oracle_duel:    t("notif_push_oracle_duel"),
    match_reminder: t("notif_push_match_reminder"),
  };
  const TELEGRAM_LABELS: Record<TelegramPrefKey, { label: string; desc: string }> = {
    goals:            { label: t("notif_tg_goals"),         desc: t("notif_tg_goals_desc") },
    results:          { label: t("notif_tg_results"),       desc: t("notif_tg_results_desc") },
    locking_reminder: { label: t("notif_tg_locking_label"), desc: t("notif_tg_locking_desc") },
    match_reminder:   { label: t("notif_tg_match_reminder"), desc: t("notif_tg_match_reminder_desc") },
    weekly_digest:    { label: t("notif_tg_digest"),        desc: t("notif_tg_digest_desc") },
    leaderboard:      { label: t("notif_tg_leaderboard"),   desc: t("notif_tg_leaderboard_desc") },
  };

  const [settings,        setSettings]        = useState<Record<string, boolean>>({});
  const [telegramSettings, setTelegramSettings] = useState<Record<TelegramPrefKey, boolean>>(TELEGRAM_PREF_DEFAULTS);
  const [pushEnabled,     setPushEnabled]      = useState(false);
  const [loading,         setLoading]          = useState(false);
  const [telegramChatId,  setTelegramChatId]   = useState<string | null | undefined>(undefined);
  const [tgDisconnecting, setTgDisconnecting]  = useState(false);
  const [tgConnecting,    setTgConnecting]     = useState(false);
  const [tgWaiting,       setTgWaiting]        = useState(false);
  const [tgError,         setTgError]          = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    SETTINGS.forEach(s => { defaults[s.key] = s.default; });

    const stored = localStorage.getItem("cupclash_notif_settings");
    setSettings(stored ? { ...defaults, ...JSON.parse(stored) } : defaults);

    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }

    async function loadProfile() {
      const sb = createClient();
      const { data } = await sb
        .from("profiles")
        .select("telegram_chat_id, notification_preferences")
        .eq("id", userId)
        .maybeSingle();
      const row = data as {
        telegram_chat_id: string | null;
        notification_preferences: { push?: Record<string, boolean>; telegram?: Partial<Record<TelegramPrefKey, boolean>> } | null;
      } | null;
      setTelegramChatId(row?.telegram_chat_id ?? null);

      if (row?.notification_preferences?.push) {
        const merged = { ...defaults, ...row.notification_preferences.push };
        setSettings(merged);
        localStorage.setItem("cupclash_notif_settings", JSON.stringify(merged));
      }
      setTelegramSettings({ ...TELEGRAM_PREF_DEFAULTS, ...(row?.notification_preferences?.telegram ?? {}) });
    }
    loadProfile();

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [userId]);

  const toggleSetting = (key: string) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("cupclash_notif_settings", JSON.stringify(next));
      const sb = createClient();
      sb.from("profiles")
        .update({ notification_preferences: { push: next, telegram: telegramSettings } })
        .eq("id", userId)
        .then();
      return next;
    });
  };

  const toggleTelegramSetting = (key: TelegramPrefKey) => {
    setTelegramSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const sb = createClient();
      sb.from("profiles")
        .update({ notification_preferences: { push: settings, telegram: next } })
        .eq("id", userId)
        .then();
      return next;
    });
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setTgWaiting(false);
  };

  const connectTelegram = async () => {
    setTgConnecting(true);
    setTgError(false);
    try {
      const res = await fetch("/api/telegram/link-token", { method: "POST" });
      if (!res.ok) throw new Error("link-token failed");
      const { deepLink } = await res.json() as { deepLink: string };

      window.open(deepLink, "_blank", "noopener,noreferrer");

      setTgWaiting(true);
      let tries = 0;
      const sb = createClient();
      pollRef.current = setInterval(async () => {
        tries++;
        const { data } = await sb
          .from("profiles")
          .select("telegram_chat_id")
          .eq("id", userId)
          .maybeSingle();
        const chatId = (data as { telegram_chat_id: string | null } | null)?.telegram_chat_id ?? null;
        if (chatId) {
          setTelegramChatId(chatId);
          stopPolling();
        } else if (tries >= POLL_MAX_TRIES) {
          stopPolling();
        }
      }, POLL_INTERVAL_MS);
    } catch {
      setTgError(true);
    } finally {
      setTgConnecting(false);
    }
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
                  {t("notif_tg_desc_connected")}
                </div>
                <button onClick={disconnectTelegram} disabled={tgDisconnecting}
                  className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-opacity"
                  style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                  <X size={12} />
                  {tgDisconnecting ? t("notif_disconnecting") : t("notif_tg_disconnect_label")}
                </button>
              </>
            ) : (
              <>
                <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {t("notif_tg_desc_connect")}
                </div>
                {isIOS && (
                  <div className="mt-2 text-xs rounded-lg px-3 py-2"
                    style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(251,191,36,0.8)" }}>
                    ℹ️ {t("notif_tg_ios_note")}
                  </div>
                )}
                {telegramChatId === null && (
                  <>
                    <button
                      onClick={connectTelegram}
                      disabled={tgConnecting || tgWaiting}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #229ED9, #1A86BA)", color: "#ffffff" }}>
                      {tgWaiting
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Send size={14} />}
                      {tgConnecting ? t("notif_tg_connecting") : tgWaiting ? t("notif_tg_waiting") : t("notif_tg_connect_btn")}
                    </button>
                    {tgError && (
                      <div className="mt-2 text-xs" style={{ color: "#dc2626" }}>{t("notif_tg_link_error")}</div>
                    )}
                  </>
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

      {/* Telegram per-type settings — only meaningful once connected */}
      {telegramChatId && (
        <div className="rounded-2xl overflow-hidden" style={glass}>
          <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              {t("notif_tg_types_title")}
            </div>
          </div>
          {TELEGRAM_SETTINGS.map(s => (
            <div key={s.key}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="shrink-0 w-7 flex items-center justify-center">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{TELEGRAM_LABELS[s.key].label}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{TELEGRAM_LABELS[s.key].desc}</div>
              </div>
              <button onClick={() => toggleTelegramSetting(s.key)}
                className="relative h-6 w-11 rounded-full shrink-0 transition-all"
                style={{ background: telegramSettings[s.key] ? "#229ED9" : "rgba(255,255,255,0.12)" }}>
                <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all"
                  style={{ left: telegramSettings[s.key] ? "22px" : "2px" }} />
              </button>
            </div>
          ))}
        </div>
      )}

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
            {!pushEnabled && isIOS && (
              <div className="mt-2 text-xs rounded-lg px-3 py-2"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(251,191,36,0.8)" }}>
                {t("notif_push_ios_note")}
              </div>
            )}
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
