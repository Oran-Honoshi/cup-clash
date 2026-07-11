"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Check, AlertCircle, Upload, RefreshCw, X, Zap, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CountrySelector } from "@/components/auth/country-selector";
import { SOCCER_PRESETS, dicebearUrl } from "@/components/ui/member-avatar";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BallLoader } from "@/components/ui/BallLoader";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { FollowButton } from "@/components/leagues/follow-button";
import { getTeamColor } from "@/lib/countries";
import { useTheme } from "@/components/theme-provider";
import { ThemePicker } from "@/components/ui/theme-picker";
import { DeleteAccountSection } from "@/components/account/delete-account";
import type { CountryCode } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";
import { Volume2, VolumeX } from "lucide-react";
import { getSoundEnabled, setSoundEnabled } from "@/lib/sound-preference";

export const dynamic = "force-dynamic";

interface ProfileData {
  name:              string;
  country:           CountryCode | null;
  avatar_url:        string | null;
  auto_fill_enabled: boolean;
  auto_fill_home:    number;
  auto_fill_away:    number;
}

interface FollowedTeam {
  id:       string;
  name:     string;
  badgeUrl: string | null;
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
  const { t } = useLocale();
  const [profile, setProfile]     = useState<ProfileData>({ name: "", country: null, avatar_url: null, auto_fill_enabled: false, auto_fill_home: 1, auto_fill_away: 0 });
  const [saving, setSaving]       = useState(false);
  const [saved,  setSaved]        = useState(false);
  const [error,  setError]        = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGoogle,  setIsGoogle]  = useState(false);
  const [tab, setTab]             = useState<"auto" | "preset" | "photo">("auto");
  const [soundOn, setSoundOn]     = useState(true);
  const [followedTeams, setFollowedTeams] = useState<FollowedTeam[]>([]);
  const [userId, setUserId]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { setCountry, setAppTheme } = useTheme();

  useEffect(() => { setSoundOn(getSoundEnabled()); }, []);

  function handleToggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  }

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserEmail(user.email ?? null);
      setUserId(user.id);

      sb.from("user_follows").select("followed_id").eq("user_id", user.id).eq("followed_type", "team")
        .then(async ({ data: follows }) => {
          const teamIds = (follows ?? []).map(f => (f as { followed_id: string }).followed_id);
          if (!teamIds.length) return;
          const { data: teams } = await sb.from("teams").select("id, name, badge_url").in("id", teamIds);
          setFollowedTeams(
            ((teams ?? []) as Array<{ id: string; name: string; badge_url: string | null }>)
              .map(t => ({ id: t.id, name: t.name, badgeUrl: t.badge_url }))
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        });

      setIsGoogle(
        user.app_metadata?.provider === "google" ||
        (user.identities ?? []).some((i: { provider: string }) => i.provider === "google")
      );
      const { data } = await sb.from("profiles")
        .select("name, country, avatar_url, auto_fill_enabled, auto_fill_home, auto_fill_away, theme_preference").eq("id", user.id).single();
      if (data) {
        const d = data as ProfileData & { theme_preference?: string | null };
        setProfile({
          name:              d.name              ?? "",
          country:           d.country           ?? null,
          avatar_url:        d.avatar_url        ?? null,
          auto_fill_enabled: d.auto_fill_enabled ?? false,
          auto_fill_home:    d.auto_fill_home    ?? 1,
          auto_fill_away:    d.auto_fill_away    ?? 0,
        });
        if (d.country) setCountry(d.country);
        if (d.theme_preference && ["a", "b", "c", "d"].includes(d.theme_preference)) {
          setAppTheme(d.theme_preference as "a" | "b" | "c" | "d");
        }
        if (d.avatar_url?.startsWith("preset:")) setTab("preset");
        else if (d.avatar_url && !d.avatar_url.startsWith("dicebear:")) setTab("photo");
        else setTab("auto");
      }
      setLoading(false);
    }
    load();
  }, [setCountry, setAppTheme]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError(t("prof_err_size")); return; }
    setUploading(true); setError(null);

    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await sb.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }

    const { data: { publicUrl } } = sb.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the browser fetches the new image instead of serving a stale one
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;

    // Persist to the database immediately — don't wait for the Save button
    const { error: updateError } = await sb.from("profiles").update({ avatar_url: urlWithBust }).eq("id", user.id);
    if (updateError) { setError(updateError.message); setUploading(false); return; }

    setProfile(p => ({ ...p, avatar_url: urlWithBust }));
    setTab("photo");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError(t("prof_err_auth")); setSaving(false); return; }

    const { error: updateError } = await sb.from("profiles")
      .update({
        name:              profile.name,
        country:           profile.country,
        avatar_url:        profile.avatar_url,
        auto_fill_enabled: profile.auto_fill_enabled,
        auto_fill_home:    profile.auto_fill_home,
        auto_fill_away:    profile.auto_fill_away,
      } as Record<string, unknown>)
      .eq("id", user.id);

    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    if (profile.country) setCountry(profile.country);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <BallLoader size="lg" label={t("prof_loading")} />
      </div>
    );
  }

  const autoAvatarUrl = dicebearUrl(profile.name || "player", 160);
  const teamColor = getTeamColor(profile.country);
  const TABS = [
    { id: "auto",   label: t("prof_autoAvatar"), mobileLabel: t("prof_autoAvatar") },
    { id: "preset", label: t("prof_soccerRole"), mobileLabel: t("prof_soccerRole") },
    { id: "photo",  label: t("prof_photo"),      mobileLabel: t("prof_photo")      },
  ] as const;

  return (
    <div className="space-y-6 max-w-xl pb-32">
      <div>
        <div className="label-caps mb-1">Account</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">{t("prof_my_profile")}</h1>
      </div>

      {/* Signed in as — read-only account info */}
      {userEmail && (
        <div style={{ ...glassCard, padding: "12px 16px" }}>
          <div className="flex items-center gap-3">
            <Mail size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-ui)", marginBottom: 2 }}>
                Signed in as
              </div>
              <div className="truncate" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-ui)" }}>
                {userEmail}
              </div>
            </div>
            {isGoogle && (
              <span className="flex items-center gap-1.5 shrink-0"
                style={{
                  padding: "3px 9px", borderRadius: 20,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 10, fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "var(--font-ui)",
                }}>
                <span style={{ color: "#4285F4", fontWeight: 900, fontSize: 12, lineHeight: 1 }}>G</span>
                Google
              </span>
            )}
          </div>
        </div>
      )}

      {/* Avatar section */}
      <div
        style={{
          ...glassCard,
          padding: 24,
          position: "relative",
          overflow: "hidden",
          ...(teamColor && {
            backgroundImage: `radial-gradient(120% 100% at 15% 0%, rgb(${teamColor.accent} / 0.16), transparent 60%)`,
          }),
        }}
      >
        <div className="flex items-center gap-4 mb-5" style={{ position: "relative" }}>
          <div className="relative shrink-0">
            <UserAvatar
              name={profile.name || "Player"}
              avatarUrl={profile.avatar_url}
              size="xl"
              ringColor={teamColor ? undefined : "rgba(0,212,255,0.25)"}
              teamCountry={profile.country}
            />
            {tab === "auto" && (
              <button
                onClick={() => setProfile(p => ({ ...p, name: p.name + " " }))}
                title={t("prof_regenerate")}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style={{ background: "rgba(18,14,38,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <RefreshCw size={12} style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl uppercase text-white truncate">{profile.name || "Your name"}</div>
            <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{profile.country ?? t("prof_no_country")}</div>
            <div className="mt-1.5" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {tab === "auto"   && t("prof_auto_desc")}
              {tab === "preset" && t("prof_preset_desc")}
              {tab === "photo"  && t("prof_photo_desc")}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 mb-5" style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
        }}>
          {TABS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className="flex-1 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all"
              style={{
                borderRadius: 10,
                background: tab === item.id ? "rgba(0,212,255,0.15)" : "transparent",
                border: tab === item.id ? "1px solid rgba(0,212,255,0.4)" : "1px solid transparent",
                color: tab === item.id ? "#00D4FF" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
              }}>
              <span className="sm:hidden">{item.mobileLabel}</span>
              <span className="hidden sm:inline">{item.label}</span>
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
              {t("prof_auto_exp")}
            </p>
            <button onClick={() => setProfile(p => ({ ...p, avatar_url: null }))} style={btnOutline}>
              {t("prof_use_auto")}
            </button>
          </div>
        )}

        {/* Soccer role presets */}
        {tab === "preset" && (
          <div>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{t("prof_pick_role")}</p>
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
                  <X size={14} />{t("prof_remove")}
                </button>
              </>
            ) : (
              <div className="h-32 w-32 mx-auto rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "2px dashed rgba(255,255,255,0.2)" }}>
                <Camera size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            )}
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{t("prof_upload_info")}</p>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ ...btnOutline, opacity: uploading ? 0.6 : 1 }}>
              <Upload size={14} />{uploading ? t("prof_uploading") : t("prof_choose")}
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
          {t("auth_displayName")}
        </label>
        <input type="text" value={profile.name}
          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          placeholder={t("auth_ph_name")}
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
          {t("prof_name_hint")}
        </p>
      </div>

      {/* Country */}
      <div style={{ ...glassCard, padding: 20 }}>
        <div className="label-caps mb-3">{t("prof_yourTeam")}</div>
        <CountrySelector value={profile.country} onChange={code => setProfile(p => ({ ...p, country: code }))} />
      </div>

      {/* My Followed Teams */}
      <div style={{ ...glassCard, padding: 20 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="label-caps">My Followed Teams</div>
          <Link href="/leagues?tab=teams" style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF", textDecoration: "none" }}>
            {followedTeams.length > 0 ? "Edit" : "Add teams"}
          </Link>
        </div>
        {followedTeams.length === 0 ? (
          <div className="flex items-center gap-3 py-2">
            <Shield size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              You&apos;re not following any teams yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {followedTeams.map(team => (
              <div key={team.id} className="flex items-center gap-3">
                <FlagBadge code={team.badgeUrl} size="sm" label={team.name} />
                <span className="flex-1 truncate" style={{ fontSize: 13, color: "white", fontFamily: "var(--font-ui)" }}>
                  {team.name}
                </span>
                {userId && (
                  <FollowButton type="team" id={team.id} userId={userId} initialFollowing={true} compact />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Theme */}
      <div style={{ ...glassCard, padding: 20 }}>
        <div className="label-caps mb-3">App Theme</div>
        <ThemePicker />
      </div>

      {/* Sound effects */}
      <div style={{ ...glassCard, padding: 20 }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {soundOn ? (
              <Volume2 size={15} style={{ color: "#00D4FF", flexShrink: 0 }} />
            ) : (
              <VolumeX size={15} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            )}
            <div className="min-w-0">
              <div className="text-sm font-bold" style={{ color: "white" }}>Sound effects</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                Plays a short cue when you lock in a prediction
              </div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundOn}
            aria-label="Toggle sound effects"
            onClick={handleToggleSound}
            className="relative h-6 w-11 rounded-full shrink-0 transition-all"
            style={{ background: soundOn ? "#00D4FF" : "rgba(255,255,255,0.12)" }}>
            <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
              style={{ left: soundOn ? "22px" : "2px" }} />
          </button>
        </div>
      </div>

      {/* Auto-fill safety net */}
      <div style={{ ...glassCard, padding: 20 }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={15} style={{ color: "#00D4FF" }} />
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)" }}>
            {t("prof_af_title")}
          </span>
        </div>
        <p className="mb-4" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
          {profile.auto_fill_enabled
            ? `If you haven't predicted 6 minutes before kickoff, we'll automatically submit ${profile.auto_fill_home}–${profile.auto_fill_away} for you so you still earn points.`
            : "If you haven't predicted 6 minutes before kickoff, your prediction will be skipped. Enable auto-fill to always earn points."}
        </p>

        {/* Toggle row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm font-bold" style={{ color: "white" }}>{t("prof_af_label")}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              {t("prof_af_desc")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setProfile(p => ({ ...p, auto_fill_enabled: !p.auto_fill_enabled }))}
            className="relative h-6 w-11 rounded-full shrink-0 transition-all"
            style={{ background: profile.auto_fill_enabled ? "#00D4FF" : "rgba(255,255,255,0.12)" }}>
            <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
              style={{ left: profile.auto_fill_enabled ? "22px" : "2px" }} />
          </button>
        </div>

        {/* Score inputs — only shown when enabled */}
        {profile.auto_fill_enabled && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", marginBottom: 6 }}>
                  {t("prof_af_home")}
                </label>
                <input
                  type="number" min={0} max={5}
                  value={profile.auto_fill_home}
                  onChange={e => setProfile(p => ({ ...p, auto_fill_home: Math.min(5, Math.max(0, Number(e.target.value))) }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                    color: "#00D4FF", fontSize: 18, fontWeight: 700,
                    fontFamily: "var(--font-display)", outline: "none", textAlign: "center",
                  }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", marginBottom: 6 }}>
                  {t("prof_af_away")}
                </label>
                <input
                  type="number" min={0} max={5}
                  value={profile.auto_fill_away}
                  onChange={e => setProfile(p => ({ ...p, auto_fill_away: Math.min(5, Math.max(0, Number(e.target.value))) }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                    color: "#00D4FF", fontSize: 18, fontWeight: 700,
                    fontFamily: "var(--font-display)", outline: "none", textAlign: "center",
                  }} />
              </div>
            </div>
            <div className="rounded-lg px-3 py-2.5 flex items-center gap-2"
              style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <Zap size={12} style={{ color: "#00D4FF", flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                Scores are capped at 5. Auto-fill fires 6 minutes before kickoff and won&apos;t overwrite a prediction you already submitted.
              </p>
            </div>
          </div>
        )}
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
        {saving ? t("prof_saving") : saved ? t("prof_saved") : t("prof_saveChanges")}
      </button>

      <DeleteAccountSection />
    </div>
  );
}
