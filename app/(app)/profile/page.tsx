"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Check, AlertCircle, Upload, RefreshCw, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CountrySelector } from "@/components/auth/country-selector";
import { MemberAvatar, SOCCER_PRESETS, dicebearUrl } from "@/components/ui/member-avatar";
import { useTheme } from "@/components/theme-provider";
import type { CountryCode } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProfileData {
  name: string;
  country: CountryCode | null;
  avatar_url: string | null;
}

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
} as const;

const btnOutline = {
  padding: "11px 16px", borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.7)",
  fontSize: 12, fontWeight: 700,
  fontFamily: "var(--font-ui)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
  transition: "all 0.15s",
} as const;

export default function ProfilePage() {
  const [profile, setProfile]     = useState<ProfileData>({ name: "", country: null, avatar_url: null });
  const [saving, setSaving]       = useState(false);
  const [saved,  setSaved]        = useState(false);
  const [error,  setError]        = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab]             = useState<"auto" | "preset" | "photo">("auto");
  const fileRef = useRef<HTMLInputElement>(null);
  const { setCountry } = useTheme();

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await sb.from("profiles")
        .select("name, country, avatar_url").eq("id", user.id).single();
      if (data) {
        const d = data as ProfileData;
        setProfile({ name: d.name ?? "", country: d.country ?? null, avatar_url: d.avatar_url ?? null });
        if (d.country) setCountry(d.country);
        if (d.avatar_url?.startsWith("preset:")) setTab("preset");
        else if (d.avatar_url && !d.avatar_url.startsWith("dicebear:")) setTab("photo");
        else setTab("auto");
      }
      setLoading(false);
    }
    load();
  }, [setCountry]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Photo must be under 2MB"); return; }
    setUploading(true); setError(null);

    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await sb.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = sb.storage.from("avatars").getPublicUrl(path);
    setProfile(p => ({ ...p, avatar_url: publicUrl }));
    setTab("photo");
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Not signed in. Please refresh and try again."); setSaving(false); return; }

    const { error: updateError } = await sb.from("profiles")
      .update({ name: profile.name, country: profile.country, avatar_url: profile.avatar_url } as Record<string, unknown>)
      .eq("id", user.id);

    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    if (profile.country) setCountry(profile.country);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20"
        style={{ color: "rgba(255,255,255,0.35)" }}>
        Loading profile...
      </div>
    );
  }

  const autoAvatarUrl = dicebearUrl(profile.name || "player", 160);
  const TABS = [
    { id: "auto",   label: "Auto Avatar", mobileLabel: "Auto"   },
    { id: "preset", label: "Soccer Role", mobileLabel: "Preset" },
    { id: "photo",  label: "My Photo",    mobileLabel: "Photo"  },
  ] as const;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <div className="label-caps mb-1">Account</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">My Profile</h1>
      </div>

      {/* Avatar section */}
      <div style={{ ...glassCard, padding: 24 }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <div style={{ display: "inline-flex", borderRadius: "50%", boxShadow: "0 0 0 3px rgba(0,212,255,0.25)" }}>
              <MemberAvatar name={profile.name || "Player"} avatarUrl={profile.avatar_url} size="xl" />
            </div>
            {tab === "auto" && (
              <button
                onClick={() => setProfile(p => ({ ...p, name: p.name + " " }))}
                title="Regenerate"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style={{ background: "rgba(18,14,38,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <RefreshCw size={12} style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl uppercase text-white truncate">{profile.name || "Your name"}</div>
            <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{profile.country ?? "No country"}</div>
            <div className="mt-1.5" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {tab === "auto"   && "DiceBear auto-generated · unique to your name"}
              {tab === "preset" && "Soccer role avatar"}
              {tab === "photo"  && "Your uploaded photo"}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 mb-5" style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all"
              style={{
                borderRadius: 10,
                background: tab === t.id ? "rgba(0,212,255,0.15)" : "transparent",
                border: tab === t.id ? "1px solid rgba(0,212,255,0.4)" : "1px solid transparent",
                color: tab === t.id ? "#00D4FF" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
              }}>
              <span className="sm:hidden">{t.mobileLabel}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Auto avatar */}
        {tab === "auto" && (
          <div className="text-center space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={autoAvatarUrl} alt="Auto avatar preview"
              className="h-32 w-32 mx-auto rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", boxShadow: "0 0 0 4px rgba(0,212,255,0.2)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Your avatar is generated automatically from your name. Every name produces a unique, consistent illustrated face.
            </p>
            <button onClick={() => setProfile(p => ({ ...p, avatar_url: null }))} style={btnOutline}>
              Use this avatar
            </button>
          </div>
        )}

        {/* Soccer role presets */}
        {tab === "preset" && (
          <div>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Pick your role on the pitch:</p>
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {SOCCER_PRESETS.map(preset => {
                const active = profile.avatar_url === `preset:${preset.id}`;
                return (
                  <button key={preset.id}
                    onClick={() => setProfile(p => ({ ...p, avatar_url: `preset:${preset.id}` }))}
                    className="flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2.5 rounded-xl border transition-all hover:-translate-y-0.5 relative"
                    style={active ? {
                      borderColor: `#${preset.bg}60`,
                      backgroundColor: `#${preset.bg}20`,
                      boxShadow: `0 0 12px #${preset.bg}40`,
                    } : {
                      borderColor: "rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(255,255,255,0.02)",
                    }}>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-base sm:text-xl"
                      style={{ backgroundColor: `#${preset.bg}` }}>
                      {preset.icon}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider leading-tight text-center"
                      style={{ color: active ? `#${preset.bg}` : "rgba(255,255,255,0.35)" }}>
                      {preset.label}
                    </span>
                    {active && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: `#${preset.bg}` }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload photo */}
        {tab === "photo" && (
          <div className="text-center space-y-3">
            {profile.avatar_url && !profile.avatar_url.startsWith("preset:") ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar_url} alt="Your photo"
                  className="h-32 w-32 mx-auto rounded-full object-cover"
                  style={{ boxShadow: "0 0 0 4px rgba(0,212,255,0.2)" }} />
                <button
                  onClick={() => { setProfile(p => ({ ...p, avatar_url: null })); setTab("auto"); }}
                  style={btnOutline}>
                  <X size={14} />Remove photo
                </button>
              </>
            ) : (
              <div className="h-32 w-32 mx-auto rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "2px dashed rgba(255,255,255,0.2)" }}>
                <Camera size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            )}
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Upload a photo. Max 2MB, JPG or PNG.</p>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ ...btnOutline, opacity: uploading ? 0.6 : 1 }}>
              <Upload size={14} />{uploading ? "Uploading..." : "Choose photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handlePhotoUpload} />
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{ ...glassCard, padding: 20 }}>
        <label className="block mb-2"
          style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)" }}>
          Display name
        </label>
        <input type="text" value={profile.name}
          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          placeholder="How your friends will see you"
          className="w-full"
          style={{
            padding: "12px 16px", borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#ffffff", fontSize: 14,
            fontFamily: "var(--font-ui)", outline: "none",
            transition: "all 0.15s",
          }} />
        <p className="mt-2" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          Your auto avatar updates live as you type.
        </p>
      </div>

      {/* Country */}
      <div style={{ ...glassCard, padding: 20 }}>
        <div className="label-caps mb-3">Your team</div>
        <CountrySelector value={profile.country} onChange={code => setProfile(p => ({ ...p, country: code }))} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-danger">
          <AlertCircle size={15} />{error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2"
        style={{
          padding: "14px 24px", borderRadius: 14,
          background: "linear-gradient(135deg, #00FF88, #00D4FF)",
          color: "#050810", fontSize: 15, fontWeight: 800,
          fontFamily: "var(--font-display)",
          textTransform: "uppercase", letterSpacing: "0.05em",
          cursor: saving ? "not-allowed" : "pointer",
          border: "none",
          boxShadow: "0 0 24px rgba(0,255,136,0.3)",
          opacity: saving ? 0.7 : 1,
          transition: "opacity 0.15s",
        }}>
        {saved && <Check size={16} />}
        {saving ? "Saving..." : saved ? "Profile saved!" : "Save changes"}
      </button>
    </div>
  );
}
