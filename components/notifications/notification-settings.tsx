"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageCircle, Smartphone, Check, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotifSettings {
  // Match reminders
  predictionReminders: boolean;  // "Match kicks off in 1hr — predict now"
  matchResults:        boolean;  // "Match ended — here's who got points"
  leaderboardUpdates:  boolean;  // "You moved up 2 spots"
  // Group
  memberJoined:        boolean;  // "Sarah joined your group"
  adminMessages:       boolean;  // Admin-sent nudges
  // Marketing
  productUpdates:      boolean;  // New features, announcements
  weeklyDigest:        boolean;  // Weekly standings summary
}

interface NotifChannels {
  email:  boolean;
  inApp:  boolean;
  push:   boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
  predictionReminders: true,
  matchResults:        true,
  leaderboardUpdates:  true,
  memberJoined:        true,
  adminMessages:       true,
  productUpdates:      false,
  weeklyDigest:        true,
};

const DEFAULT_CHANNELS: NotifChannels = {
  email: true,
  inApp: true,
  push:  false,
};

const STORAGE_KEY = "cupclash_notif_settings";

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={cn(
        "relative h-5 w-9 rounded-full transition-all shrink-0",
        on ? "bg-success" : "bg-white/10",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-0.5 h-4 w-4 rounded-full transition-all",
        on ? "left-[calc(100%-18px)] bg-white" : "left-0.5 bg-white/50"
      )} />
    </button>
  );
}

function SettingRow({
  icon: Icon, label, description, value, onChange, tag,
}: {
  icon: typeof Bell; label: string; description: string;
  value: boolean; onChange: (v: boolean) => void; tag?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        <Icon size={15} className="text-pitch-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{label}</span>
          {tag && (
            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
              {tag}
            </span>
          )}
        </div>
        <p className="text-xs text-pitch-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  );
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [channels, setChannels] = useState<NotifChannels>(DEFAULT_CHANNELS);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { settings: NotifSettings; channels: NotifChannels };
        setSettings(parsed.settings ?? DEFAULT_SETTINGS);
        setChannels(parsed.channels ?? DEFAULT_CHANNELS);
      }
    } catch { /* ignore */ }
  }, []);

  const set = (key: keyof NotifSettings, val: boolean) =>
    setSettings(s => ({ ...s, [key]: val }));

  const setChannel = (key: keyof NotifChannels, val: boolean) =>
    setChannels(c => ({ ...c, [key]: val }));

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, channels }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Could not save preferences");
    }
  };

  return (
    <div className="space-y-5">
      {/* Channels */}
      <Card variant="glass" className="p-5">
        <div className="font-display text-xl uppercase text-white mb-1">Notification channels</div>
        <p className="text-xs text-pitch-500 mb-4">Choose how you want to receive notifications.</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "email" as const,  icon: Mail,          label: "Email",    sub: "Match results & reminders" },
            { key: "inApp" as const,  icon: Bell,          label: "In-app",   sub: "Inbox inside Cup Clash"    },
            { key: "push"  as const,  icon: Smartphone,    label: "Push",     sub: "Install app to enable"     },
          ].map(({ key, icon: Icon, label, sub }) => (
            <button key={key}
              onClick={() => key !== "push" && setChannel(key, !channels[key])}
              disabled={key === "push"}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                channels[key] ? "border-success/30 bg-success/8" : "border-white/10 bg-white/[0.02]",
                key === "push" && "opacity-40 cursor-not-allowed"
              )}
              style={channels[key] ? { borderColor: "rgba(16,185,129,0.3)", backgroundColor: "rgba(16,185,129,0.08)" } : undefined}
            >
              <Icon size={16} className="mb-2" style={{ color: channels[key] ? "#10b981" : "#64748b" }} />
              <div className="text-xs font-bold text-white">{label}</div>
              <div className="text-[10px] text-pitch-500 mt-0.5">{sub}</div>
              {channels[key] && key !== "push" && (
                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-success">
                  <Check size={9} /> Enabled
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Match notifications */}
      <Card variant="glass" className="p-5">
        <div className="font-display text-lg uppercase text-white mb-1">Match notifications</div>
        <p className="text-xs text-pitch-500 mb-3">
          These keep you in the game — we recommend leaving them all on.
        </p>
        <SettingRow icon={Bell} label="Prediction reminders" tag="Recommended"
          description="Get notified 1 hour before kickoff if you haven't predicted yet."
          value={settings.predictionReminders} onChange={v => set("predictionReminders", v)} />
        <SettingRow icon={Bell} label="Match results"
          description="See who got points and how the leaderboard moved after each match."
          value={settings.matchResults} onChange={v => set("matchResults", v)} />
        <SettingRow icon={Bell} label="Leaderboard updates"
          description="Know when you move up or down the rankings after a result."
          value={settings.leaderboardUpdates} onChange={v => set("leaderboardUpdates", v)} />
      </Card>

      {/* Group notifications */}
      <Card variant="glass" className="p-5">
        <div className="font-display text-lg uppercase text-white mb-1">Group activity</div>
        <SettingRow icon={Bell} label="New member joined"
          description="Get notified when someone accepts an invite and joins your group."
          value={settings.memberJoined} onChange={v => set("memberJoined", v)} />
        <SettingRow icon={MessageCircle} label="Admin messages"
          description="Nudges and messages sent to you by your group admin."
          value={settings.adminMessages} onChange={v => set("adminMessages", v)} />
      </Card>

      {/* Marketing — clearly separated */}
      <Card variant="glass" className="p-5">
        <div className="font-display text-lg uppercase text-white mb-1">Optional</div>
        <p className="text-xs text-pitch-500 mb-3">
          These are completely optional and have no effect on your game experience.
        </p>
        <SettingRow icon={Mail} label="Weekly digest"
          description="A weekly summary of your standings and upcoming matches. Sent every Monday."
          value={settings.weeklyDigest} onChange={v => set("weeklyDigest", v)} />
        <SettingRow icon={Mail} label="Product updates"
          description="New features, improvements, and announcements from the Cup Clash team."
          value={settings.productUpdates} onChange={v => set("productUpdates", v)} />
      </Card>

      {/* GDPR notice */}
      <div className="flex items-start gap-2 text-xs text-pitch-600 px-1">
        <AlertCircle size={12} className="shrink-0 mt-0.5" />
        <span>
          Your notification preferences are saved locally. To permanently unsubscribe from all Cup Clash emails,{" "}
          <a href="/unsubscribe" className="underline hover:text-pitch-400 transition-colors">click here</a>.
          We comply with GDPR and CAN-SPAM — you can always opt out.
        </span>
      </div>

      {error && <div className="text-xs text-danger flex items-center gap-2"><AlertCircle size={13} />{error}</div>}

      <Button onClick={handleSave} size="sm" className="w-full"
        leftIcon={saved ? <Check size={14} /> : <Bell size={14} />}>
        {saved ? "Preferences saved!" : "Save notification preferences"}
      </Button>
    </div>
  );
}
