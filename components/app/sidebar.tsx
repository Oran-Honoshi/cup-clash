"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Trophy, Target, BarChart2,
  GitBranch, Brain, Bell, Shield, LogOut, Settings, MessageCircle, Trash2, CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import type { CountryCode } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { ReviewTrigger } from "@/components/ui/review-modal";
import { SOCCER_PRESETS } from "@/components/ui/member-avatar";

function SidebarPresetAvatar({ presetId }: { presetId: string }) {
  const preset = SOCCER_PRESETS.find(p => p.id === presetId);
  return (
    <div className="h-full w-full flex items-center justify-center text-base"
      style={{ background: preset ? `#${preset.bg}30` : "rgba(0,212,255,0.15)" }}>
      {preset?.icon ?? "⚽"}
    </div>
  );
}

interface UserProfile {
  name:       string;
  country:    string | null;
  avatar_url: string | null;
}

const NAV_ITEMS = [
  { href: "/dashboard",    key: "nav_dashboard"     as const, icon: LayoutDashboard },
  { href: "/groups",       key: "nav_groups"        as const, icon: Users           },
  { href: "/leaderboard",  key: "nav_leaderboard"   as const, icon: Trophy          },
  { href: "/predictions",  key: "nav_predictions"   as const, icon: Target          },
  { href: "/standings",    key: "nav_standings"     as const, icon: BarChart2       },
  { href: "/bracket",      key: "nav_bracket"       as const, icon: GitBranch       },
  { href: "/trivia",       key: "nav_trivia"        as const, icon: Brain           },
  { href: "/notifications",key: "nav_notifications" as const, icon: Bell            },
  { href: "/admin",        key: "common_admin"      as const, icon: Shield          },
];

const CHAT_HREF = "/chat";

export function AppSidebar() {
  const pathname  = usePathname();
  const { setCountry } = useTheme();
  const { t } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteTool, setShowDeleteTool] = useState(false);
  const [delEmail, setDelEmail] = useState("");
  const [delReason, setDelReason] = useState("");
  const [delPreview, setDelPreview] = useState<{ userId: string; name: string; groups: string[] } | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [delMsg, setDelMsg] = useState("");

  const ADMIN_EMAILS = ["lipinksy19@gmail.com", "oransch@gmail.com", "oran@honoshi.co.il"];

  const [authLoaded, setAuthLoaded] = useState(false);

  const loadProfile = useCallback(async () => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setAuthLoaded(true); return; }
    if (ADMIN_EMAILS.includes(user.email ?? "")) setIsAdmin(true);
    const { data } = await sb
      .from("profiles")
      .select("name, country, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) {
      setProfile(data as UserProfile);
      if ((data as UserProfile).country) setCountry((data as UserProfile).country as CountryCode);
    }
    setAuthLoaded(true);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSignOut = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    window.location.replace("/signin");
  };

  const handleFindUser = async () => {
    if (!delEmail.trim()) return;
    setDelLoading(true);
    setDelMsg("");
    setDelPreview(null);
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token ?? "";
    const res = await fetch(`/api/admin/delete-user?email=${encodeURIComponent(delEmail.trim())}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { userId?: string; name?: string; groups?: string[]; error?: string };
    setDelLoading(false);
    if (!res.ok) { setDelMsg(data.error ?? "User not found"); return; }
    setDelPreview({ userId: data.userId!, name: data.name!, groups: data.groups ?? [] });
  };

  const handleDeleteUser = async () => {
    if (!delPreview) return;
    setDelLoading(true);
    setDelMsg("");
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token ?? "";
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: delPreview.userId, reason: delReason || undefined }),
    });
    const data = await res.json() as { success?: boolean; name?: string; error?: string };
    setDelLoading(false);
    if (!res.ok) { setDelMsg(data.error ?? "Failed to delete"); return; }
    setDelMsg(`Deleted: ${data.name}`);
    setDelPreview(null);
    setDelEmail("");
    setDelReason("");
  };

  const displayName = profile?.name ?? "You";
  const flagCode    = profile?.country ? flagUrl(profile.country.toLowerCase().replace(/ /g, "-"), 20) : null;

  return (
    <aside
      className="hidden lg:flex fixed ltr:left-0 rtl:right-0 top-0 bottom-0 w-60 flex-col z-40 ltr:border-r rtl:border-l"
      style={{
        background: "rgba(8, 12, 22, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255, 255, 255, 0.07)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="Cup Clash" className="h-8 w-8 rounded-xl object-cover" />
          <div>
            <div className="font-display text-lg font-black uppercase leading-none text-white">
              Cup<span style={{ background: "linear-gradient(135deg,#00FF88,#00D4FF)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Clash</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
              World Cup 2026
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
              )}
              style={active ? {
                background: "rgba(0, 255, 136, 0.12)",
                color: "#00FF88",
                border: "1px solid rgba(0, 255, 136, 0.25)",
                boxShadow: "0 0 12px rgba(0,255,136,0.08)",
              } : {
                color: "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.75} />
              {t(key)}
            </Link>
          );
        })}

        {/* Schedule */}
        <Link href="/schedule"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={pathname === "/schedule" ? {
            background: "rgba(0, 255, 136, 0.12)",
            color: "#00FF88",
            border: "1px solid rgba(0, 255, 136, 0.25)",
            boxShadow: "0 0 12px rgba(0,255,136,0.08)",
          } : { color: "rgba(255,255,255,0.55)" }}
          onMouseEnter={e => { if (pathname !== "/schedule") { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; } }}
          onMouseLeave={e => { if (pathname !== "/schedule") { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
        >
          <CalendarDays size={17} strokeWidth={pathname === "/schedule" ? 2.5 : 1.75} />
          Schedule
        </Link>

        {/* Chat */}
        <Link href={CHAT_HREF}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ color: "rgba(255,255,255,0.55)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <MessageCircle size={17} strokeWidth={1.75} />
          {t("nav_chat")}
        </Link>

        {/* Testing — admin only */}
        {isAdmin && (
          <Link href="/testing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={pathname === "/testing" ? {
              background: "rgba(0,255,136,0.12)",
              color: "#00FF88",
              border: "1px solid rgba(0,255,136,0.25)",
            } : { color: "rgba(255,255,255,0.35)" }}>
            <Shield size={17} strokeWidth={1.75} />
            Testing
          </Link>
        )}

        {/* Delete User — super-admin only */}
        {isAdmin && (
          <div>
            <button
              onClick={() => { setShowDeleteTool(v => !v); setDelMsg(""); setDelPreview(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ color: showDeleteTool ? "#f87171" : "rgba(255,255,255,0.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Trash2 size={17} strokeWidth={1.75} />
              Delete User
            </button>

            {showDeleteTool && (
              <div className="mx-1 mt-1 p-3 rounded-xl space-y-2"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <input
                  type="email"
                  placeholder="user@email.com"
                  value={delEmail}
                  onChange={e => { setDelEmail(e.target.value); setDelPreview(null); setDelMsg(""); }}
                  onKeyDown={e => e.key === "Enter" && handleFindUser()}
                  className="w-full rounded-lg px-3 py-2 text-xs placeholder:text-[rgba(255,255,255,0.3)]"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    outline: "none",
                  }}
                />

                {!delPreview ? (
                  <button
                    onClick={handleFindUser}
                    disabled={delLoading || !delEmail.trim()}
                    className="w-full rounded-lg py-1.5 text-xs font-bold"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                      opacity: (!delEmail.trim() || delLoading) ? 0.4 : 1,
                    }}
                  >
                    {delLoading ? "Looking up…" : "Find User"}
                  </button>
                ) : (
                  <>
                    <div className="rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="text-xs font-bold text-white truncate">{delPreview.name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {delPreview.groups.length > 0
                          ? delPreview.groups.join(", ")
                          : "No groups"}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      value={delReason}
                      onChange={e => setDelReason(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-xs placeholder:text-[rgba(255,255,255,0.3)]"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#fff",
                        outline: "none",
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteUser}
                        disabled={delLoading}
                        className="flex-1 rounded-lg py-1.5 text-xs font-bold"
                        style={{ background: "rgba(239,68,68,0.3)", color: "#fca5a5", opacity: delLoading ? 0.5 : 1 }}
                      >
                        {delLoading ? "Deleting…" : "Delete"}
                      </button>
                      <button
                        onClick={() => { setDelPreview(null); setDelReason(""); }}
                        className="flex-1 rounded-lg py-1.5 text-xs font-bold"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {delMsg && (
                  <div className="text-[10px] text-center font-bold"
                    style={{ color: delMsg.startsWith("Deleted") ? "#4ade80" : "#f87171" }}>
                    {delMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <LanguageSelector />
      </div>

      <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>

        {authLoaded && !profile ? (
          /* Guest card */
          <div
            style={{
              background: "rgba(0,255,136,0.06)",
              border: "1px solid rgba(0,255,136,0.15)",
              borderRadius: 16,
              padding: "14px 16px",
              margin: "0 0 4px",
            }}
          >
            <div className="font-display text-white uppercase font-black mb-1" style={{ fontSize: 15 }}>
              Ready to compete?
            </div>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
              Save picks, join groups, and climb the leaderboard.
            </p>
            <Link href="/signup" className="block">
              <button
                className="w-full font-bold text-sm rounded-xl py-2 mb-2"
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B",
                }}>
                Get started →
              </button>
            </Link>
            <Link href="/signin" className="block text-center text-xs font-bold"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Sign in
            </Link>
          </div>
        ) : profile ? (
          <>
            <div className="px-3 py-2">
              <ReviewTrigger context="general" label="Rate Cup Clash ⭐" />
            </div>

            <Link href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{ color: "rgba(255,255,255,0.75)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                style={{ border: "2px solid rgba(0,255,136,0.3)" }}>
                {profile?.avatar_url?.startsWith("preset:") ? (
                  <SidebarPresetAvatar presetId={profile.avatar_url.slice(7)} />
                ) : profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={displayName} width={32} height={32} className="object-cover w-full h-full"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : flagCode ? (
                  <Image src={flagCode} alt={profile?.country ?? ""} width={32} height={32} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-black"
                    style={{ background: "linear-gradient(135deg,#00FF88,#00D4FF)", color: "#0B141B" }}>
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate text-white">{displayName}</div>
              </div>
              <Settings size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
            </Link>

            <button onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ color: "#f87171" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <LogOut size={16} />
              {t("nav_signout")}
            </button>
          </>
        ) : null}
      </div>
    </aside>
  );
}