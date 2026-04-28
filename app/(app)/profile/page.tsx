"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Check, AlertCircle, Upload, User } from "lucide-react";
import Image from "next/image";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CountrySelector } from "@/components/auth/country-selector";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { CountryCode } from "@/lib/types";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Soccer-themed preset avatars (emoji-based, rendered as styled cards)
const PRESET_AVATARS = [
  { id: "keeper",   emoji: "🧤", label: "Keeper"    },
  { id: "striker",  emoji: "⚽", label: "Striker"   },
  { id: "captain",  emoji: "🏆", label: "Captain"   },
  { id: "coach",    emoji: "📋", label: "Coach"     },
  { id: "fan",      emoji: "🎉", label: "Fan"       },
  { id: "analyst",  emoji: "📊", label: "Analyst"   },
  { id: "wildcard", emoji: "🃏", label: "Wild Card" },
  { id: "legend",   emoji: "⭐", label: "Legend"    },
  { id: "referee",  emoji: "🟨", label: "Ref"       },
  { id: "pundit",   emoji: "🎙️", label: "Pundit"   },
  { id: "trophy",   emoji: "🥇", label: "Champion"  },
  { id: "boot",     emoji: "👟", label: "Speedster" },
];

interface ProfileData {
  name: string;
  country: CountryCode | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({ name: "", country: null, avatar_url: null });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { setCountry } = useTheme();

  useEffect(() => {
    async function load() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { setLoading(false); return; }
      const sb = getClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await sb.from("profiles").select("name, country, avatar_url").eq("id", user.id).single();
      if (data) {
        setProfile({
          name: (data as any).name ?? "",
          country: (data as any).country ?? null,
          avatar_url: (data as any).avatar_url ?? null,
        });
        if ((data as any).country) setCountry((data as any).country);
        // Check if current avatar is a preset
        const preset = PRESET_AVATARS.find(p => (data as any).avatar_url === `preset:${p.id}`);
        if (preset) setSelectedPreset(preset.id);
      }
      setLoading(false);
    }
    load();
  }, [setCountry]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    setUploading(true);
    setError(null);

    const sb = getClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await sb.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = sb.storage.from("avatars").getPublicUrl(path);
    setProfile(p => ({ ...p, avatar_url: publicUrl }));
    setSelectedPreset(null);
    setUploading(false);
  };

  const selectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    setProfile(p => ({ ...p, avatar_url: `preset:${presetId}` }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await new Promise(r => setTimeout(r, 600));
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); return;
    }

    const sb = getClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Not signed in"); setSaving(false); return; }

    const { error: updateError } = await sb.from("profiles").update({
      name: profile.name,
      country: profile.country,
      avatar_url: profile.avatar_url,
    } as any).eq("id", user.id);

    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    if (profile.country) setCountry(profile.country);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const avatarPreview = (() => {
    if (!profile.avatar_url) return null;
    if (profile.avatar_url.startsWith("preset:")) {
      const preset = PRESET_AVATARS.find(p => profile.avatar_url === `preset:${p.id}`);
      return preset ? { type: "preset" as const, emoji: preset.emoji, label: preset.label } : null;
    }
    return { type: "photo" as const, url: profile.avatar_url };
  })();

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-pitch-500">Loading profile...</div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="label-caps mb-1">Account</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">My Profile</h1>
      </div>

      {/* Avatar section */}
      <Card variant="glass" className="p-6">
        <div className="label-caps mb-4">Avatar</div>

        {/* Current avatar preview */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative h-20 w-20 shrink-0">
            {avatarPreview?.type === "photo" ? (
              <img src={avatarPreview.url} alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/10" />
            ) : avatarPreview?.type === "preset" ? (
              <div className="h-20 w-20 rounded-full flex items-center justify-center text-4xl ring-4 ring-white/10"
                style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}>
                {avatarPreview.emoji}
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full flex items-center justify-center ring-4 ring-white/10 bg-white/[0.06]">
                <User size={32} className="text-pitch-500" />
              </div>
            )}
            {/* Upload overlay */}
            <button onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div>
            <div className="font-bold text-white text-lg">{profile.name || "Your name"}</div>
            <div className="text-pitch-400 text-sm">{profile.country || "No country set"}</div>
            <button onClick={() => fileRef.current?.click()}
              className="mt-2 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors hover:text-white"
              style={{ color: "rgb(var(--accent-glow))" }}>
              <Upload size={12} /> {uploading ? "Uploading..." : "Upload photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
        </div>

        {/* Preset avatars */}
        <div className="label-caps mb-3">Or choose a soccer avatar</div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {PRESET_AVATARS.map((preset) => {
            const active = selectedPreset === preset.id;
            return (
              <button key={preset.id} onClick={() => selectPreset(preset.id)}
                title={preset.label}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                  active ? "border-accent/50 -translate-y-0.5" : "border-white/[0.06] hover:border-white/20 bg-white/[0.02]"
                )}
                style={active ? { borderColor: "rgb(var(--accent)/0.5)", backgroundColor: "rgb(var(--accent)/0.1)", boxShadow: "0 0 12px rgb(var(--accent)/0.3)" } : undefined}
              >
                <span className="text-2xl leading-none">{preset.emoji}</span>
                <span className="text-[9px] font-bold text-pitch-500 truncate w-full text-center">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Name */}
      <Card variant="glass" className="p-5">
        <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-2">Display name</label>
        <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          placeholder="How your friends will see you"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/[0.06] border border-white/[0.12] placeholder:text-pitch-500 focus:outline-none focus:border-accent transition-all" />
      </Card>

      {/* Country */}
      <Card variant="glass" className="p-5">
        <div className="label-caps mb-3">Your team</div>
        <CountrySelector
          value={profile.country}
          onChange={(code) => setProfile(p => ({ ...p, country: code }))}
        />
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
