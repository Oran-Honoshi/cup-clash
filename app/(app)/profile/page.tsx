"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Check, AlertCircle, Upload, RefreshCw } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CountrySelector } from "@/components/auth/country-selector";
import { MemberAvatar, SOCCER_PRESETS, dicebearUrl } from "@/components/ui/member-avatar";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { CountryCode } from "@/lib/types";

export const dynamic = "force-dynamic";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface ProfileData {
  name: string;
  country: CountryCode | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile]   = useState<ProfileData>({ name: "", country: null, avatar_url: null });
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);
  const [error,  setError]      = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab]           = useState<"auto" | "preset" | "photo">("auto");
  const fileRef = useRef<HTMLInputElement>(null);
  const { setCountry } = useTheme();

  useEffect(() => {
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { setLoading(false); return; }
      const sb = getClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await sb.from("profiles")
        .select("name, country, avatar_url").eq("id", user.id).single();
      if (data) {
        const d = data as ProfileData;
        setProfile({ name: d.name ?? "", country: d.country ?? null, avatar_url: d.avatar_url ?? null });
        if (d.country) setCountry(d.country);
        // Set the active tab based on current avatar
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
    if (!file || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    if (file.size > 2 * 1024 * 1024) { setError("Photo must be under 2MB"); return; }
    setUploading(true);
    setError(null);

    const sb = getClient();
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await new Promise(r => setTimeout(r, 600));
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); return;
    }
    const sb = getClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Not signed in"); setSaving(false); return; }

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
    return <div className="flex items-center justify-center py-20 text-pitch-500">Loading profile...</div>;
  }

  const autoAvatarUrl = dicebearUrl(profile.name || "player", 160);
  const TABS = [
    { id: "auto",   label: "Auto avatar" },
    { id: "preset", label: "Soccer role" },
    { id: "photo",  label: "My photo"    },
  ] as const;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <div className="label-caps mb-1">Account</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">My Profile</h1>
      </div>

      {/* ── AVATAR SECTION ── */}
      <Card variant="glass" className="p-6">
        {/* Live preview */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <MemberAvatar
              name={profile.name || "Player"}
              avatarUrl={profile.avatar_url}
              size="xl"
              ring
            />
            {tab === "auto" && (
              <button
                onClick={() => setProfile(p => ({ ...p, name: p.name + " " }))}
                title="Regenerate"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-pitch-800 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={12} className="text-pitch-300" />
              </button>
            )}
          </div>
          <div>
            <div className="font-display text-2xl uppercase text-white">{profile.name || "Your name"}</div>
            <div className="text-pitch-400 text-sm mt-0.5">{profile.country ?? "No country"}</div>
            <div className="text-[11px] text-pitch-500 mt-1.5">
              {tab === "auto"   && "DiceBear auto-generated · unique to your name"}
              {tab === "preset" && "Soccer role avatar"}
              {tab === "photo"  && "Your uploaded photo"}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 glass rounded-xl mb-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                tab === t.id ? "text-white" : "text-pitch-500 hover:text-pitch-300"
              )}
              style={tab === t.id ? {
                backgroundColor: "rgb(var(--accent) / 0.15)",
                color: "rgb(var(--accent-glow))",
                boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)",
              } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Auto avatar */}
        {tab === "auto" && (
          <div className="text-center space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={autoAvatarUrl} alt="Auto avatar preview"
              className="h-32 w-32 mx-auto rounded-full ring-4 ring-white/10"
              style={{ background: "rgba(255,255,255,0.06)" }} />
            <p className="text-sm text-pitch-400">
              Your avatar is generated automatically from your name.
              Every name produces a unique, consistent illustrated face.
            </p>
            <Button
              onClick={() => setProfile(p => ({ ...p, avatar_url: null }))}
              variant="outline" size="sm"
            >
              Use this avatar
            </Button>
          </div>
        )}

        {/* Tab: Soccer role presets */}
        {tab === "preset" && (
          <div>
            <p className="text-xs text-pitch-400 mb-3">Pick your role on the pitch:</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {SOCCER_PRESETS.map((preset) => {
                const active = profile.avatar_url === `preset:${preset.id}`;
                return (
                  <button key={preset.id}
                    onClick={() => setProfile(p => ({ ...p, avatar_url: `preset:${preset.id}` }))}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all hover:-translate-y-0.5",
                      active ? "border-accent/50 bg-accent/10" : "border-white/[0.08] hover:border-white/20 bg-white/[0.02]"
                    )}
                    style={active ? {
                      borderColor: `#${preset.bg}60`,
                      backgroundColor: `#${preset.bg}20`,
                      boxShadow: `0 0 12px #${preset.bg}40`,
                    } : undefined}
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `#${preset.bg}` }}
                    >
                      {preset.icon}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: active ? `#${preset.bg}` : "#64748b" }}>
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

        {/* Tab: Upload photo */}
        {tab === "photo" && (
          <div className="text-center space-y-3">
            {profile.avatar_url && !profile.avatar_url.startsWith("preset:") ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt="Your photo"
                className="h-32 w-32 mx-auto rounded-full ring-4 ring-white/10 object-cover" />
            ) : (
              <div className="h-32 w-32 mx-auto rounded-full bg-white/[0.06] border-2 border-dashed border-white/20 flex items-center justify-center">
                <Camera size={28} className="text-pitch-500" />
              </div>
            )}
            <p className="text-sm text-pitch-400">Upload a photo. Max 2MB, JPG or PNG.</p>
            <Button
              onClick={() => fileRef.current?.click()}
              loading={uploading}
              variant="outline" size="sm"
              leftIcon={<Upload size={14} />}
            >
              {uploading ? "Uploading..." : "Choose photo"}
            </Button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handlePhotoUpload} />
          </div>
        )}
      </Card>

      {/* Name */}
      <Card variant="glass" className="p-5">
        <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-2">Display name</label>
        <input type="text" value={profile.name}
          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          placeholder="How your friends will see you"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-slate-900 transition-all" />
        <p className="text-[11px] text-pitch-500 mt-2">Your auto avatar updates live as you type.</p>
      </Card>

      {/* Country */}
      <Card variant="glass" className="p-5">
        <div className="label-caps mb-3">Your team</div>
        <CountrySelector value={profile.country} onChange={(code) => setProfile(p => ({ ...p, country: code }))} />
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-danger">
          <AlertCircle size={15} />{error}
        </div>
      )}

      <Button onClick={handleSave} loading={saving} size="lg" className="w-full"
        leftIcon={saved ? <Check size={16} /> : undefined}>
        {saved ? "Profile saved!" : "Save changes"}
      </Button>
    </div>
  );
}
