"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Home, Users, Trophy, Target, BarChart2,
  GitBranch, Brain, Shield, LogOut, Settings, MessageCircle, Trash2, CalendarDays, LayoutGrid, Newspaper, Gamepad2, ListChecks, Goal, LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Translations } from "@/lib/i18n";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import type { CountryCode } from "@/lib/types";
import { useLocale } from "@/components/i18n/locale-provider";
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

function SidebarNavLink({ href, label, icon: Icon, active, faint }: {
  href: string; label: string; icon: LucideIcon; active: boolean; faint?: boolean;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
      style={active ? {
        background: "color-mix(in srgb, var(--ac) 12%, transparent)",
        color: "var(--ac)",
        border: "1px solid color-mix(in srgb, var(--ac) 25%, transparent)",
        boxShadow: "0 0 12px color-mix(in srgb, var(--ac) 8%, transparent)",
      } : {
        color: faint ? "var(--ft)" : "var(--t2)",
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = "var(--tx)"; (e.currentTarget as HTMLElement).style.background = "var(--ip)"; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = faint ? "var(--ft)" : "var(--t2)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
    >
      <Icon size={17} strokeWidth={active ? 2.5 : 1.75} />
      {label}
    </Link>
  );
}

function SidebarSectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ft)" }}>
      {label}
    </div>
  );
}

interface NavItem {
  href: string;
  key: keyof Translations;
  icon: LucideIcon;
}

interface NavSection {
  headerKey?: keyof Translations;
  items: NavItem[];
}

// Zones-aligned but denser — a desktop sidebar doesn't need to mirror the
// mobile 5-zone bottom nav 1:1, it just needs every real destination
// reachable without dead ends. See zone_design/README.md for the mobile side.
const NAV_SECTIONS: NavSection[] = [
  { items: [
    { href: "/home", key: "nav_home", icon: Home },
  ] },
  { headerKey: "nav_section_social", items: [
    { href: "/groups", key: "nav_groups", icon: Users },
    { href: "/chat",   key: "nav_chat",   icon: MessageCircle },
  ] },
  { headerKey: "nav_section_game", items: [
    { href: "/game",            key: "nav_game",            icon: Gamepad2 },
    { href: "/daily-challenge", key: "nav_daily_challenge", icon: ListChecks },
    { href: "/trivia",          key: "nav_trivia",          icon: Brain },
  ] },
  { headerKey: "nav_section_predictions", items: [
    { href: "/predictions",         key: "nav_predictions", icon: Target },
    { href: "/predictions/summary", key: "nav_summary",     icon: LayoutGrid },
  ] },
  { headerKey: "nav_section_tournament", items: [
    { href: "/schedule",  key: "sch_title",     icon: CalendarDays },
    { href: "/scores",    key: "nav_scores",    icon: Goal },
    { href: "/standings", key: "nav_standings", icon: BarChart2 },
    { href: "/bracket",   key: "nav_bracket",   icon: GitBranch },
    { href: "/stats",     key: "nav_stats",     icon: LineChart },
    { href: "/leaderboard", key: "nav_leaderboard", icon: Trophy },
  ] },
  { items: [
    { href: "/news", key: "nav_news", icon: Newspaper },
  ] },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin",   key: "common_admin", icon: Shield },
  { href: "/testing", key: "nav_testing",  icon: Shield },
];

const ALL_NAV_HREFS = NAV_SECTIONS.flatMap(s => s.items.map(i => i.href));

// Longest-prefix-wins so `/predictions` doesn't also light up on
// `/predictions/summary` (they're siblings in the same section).
function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  return !ALL_NAV_HREFS.some(other =>
    other.length > href.length && (pathname === other || pathname.startsWith(`${other}/`))
  );
}

export function AppSidebar() {
  const pathname  = usePathname();
  const { setCountry, setAppTheme } = useTheme();
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
      .select("name, country, avatar_url, theme_preference")
      .eq("id", user.id)
      .single();
    if (data) {
      const row = data as UserProfile & { theme_preference?: string | null };
      setProfile(row);
      if (row.country) setCountry(row.country as CountryCode);
      if (row.theme_preference && ["a", "b", "c", "d"].includes(row.theme_preference)) {
        setAppTheme(row.theme_preference as "a" | "b" | "c" | "d");
      }
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
        background: "var(--nv)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "var(--br)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--br)" }}>
        <Link href="/home" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="Cup Clash" className="h-8 w-8 rounded-xl object-cover" />
          <div>
            <div className="font-display text-lg font-black uppercase leading-none" style={{ color: "var(--tx)" }}>
              Cup<span style={{ background: "linear-gradient(135deg,#00FF88,#00D4FF)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Clash</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
              {t("sidebar_tagline")}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i} className={cn(i > 0 && "pt-1", "space-y-0.5")}>
            {section.items.length > 1 && section.headerKey && (
              <SidebarSectionLabel label={t(section.headerKey)} />
            )}
            {section.items.map(({ href, key, icon }) => (
              <SidebarNavLink
                key={href}
                href={href}
                label={t(key)}
                icon={icon}
                active={isNavActive(pathname, href)}
              />
            ))}
          </div>
        ))}

        {/* Admin-only tools */}
        {isAdmin && (
          <div className="pt-1 space-y-0.5">
            {ADMIN_ITEMS.map(({ href, key, icon }) => (
              <SidebarNavLink
                key={href}
                href={href}
                label={t(key)}
                icon={icon}
                active={isNavActive(pathname, href)}
                faint
              />
            ))}

            <button
              onClick={() => { setShowDeleteTool(v => !v); setDelMsg(""); setDelPreview(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ color: showDeleteTool ? "#f87171" : "rgba(255,255,255,0.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Trash2 size={17} strokeWidth={1.75} />
              {t("nav_delete_user")}
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

      {/* User footer — language picker now lives in Settings (Preferences tab) */}
      <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: "var(--br)" }}>

        {authLoaded && !profile ? (
          /* Guest card */
          <div
            style={{
              background: "color-mix(in srgb, var(--ac) 6%, transparent)",
              border: "1px solid color-mix(in srgb, var(--ac) 15%, transparent)",
              borderRadius: 16,
              padding: "14px 16px",
              margin: "0 0 4px",
            }}
          >
            <div className="font-display uppercase font-black mb-1" style={{ fontSize: 15, color: "var(--tx)" }}>
              {t("sidebar_guest_heading")}
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--mt)" }}>
              {t("sidebar_guest_body")}
            </p>
            <Link href="/signup" className="block">
              <button
                className="w-full font-bold text-sm rounded-xl py-2 mb-2"
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B",
                }}>
                {t("auth_getStarted")} →
              </button>
            </Link>
            <Link href="/signin" className="block text-center text-xs font-bold"
              style={{ color: "var(--mt)" }}>
              {t("auth_signin")}
            </Link>
          </div>
        ) : profile ? (
          <>
            <div className="px-3 py-2">
              <ReviewTrigger context="general" label="Rate Cup Clash ⭐" />
            </div>

            <Link href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{ color: "var(--t2)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ip)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                style={{ border: "2px solid color-mix(in srgb, var(--ac) 30%, transparent)" }}>
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
                <div className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{displayName}</div>
              </div>
              <Settings size={14} style={{ color: "var(--ft)" }} />
            </Link>

            {/* Superseded by /home (Zones IA), kept reachable but deliberately unobtrusive */}
            <Link href="/dashboard"
              className="flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold transition-all"
              style={{ color: "var(--ft)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--mt)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ft)"; }}
            >
              <LayoutDashboard size={12} />
              {t("nav_legacy_dashboard")}
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