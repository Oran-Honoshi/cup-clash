"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Trophy, Target, BarChart2,
  GitBranch, Brain, Bell, Shield, LogOut, Settings, MessageCircle,
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

const CHAT_HREF = "/groups";

export function AppSidebar() {
  const pathname  = usePathname();
  const { setCountry } = useTheme();
  const { t } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
          <img src="/icon-192.png" alt="Cup Clash" className="h-8 w-8 rounded-xl object-cover" />
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