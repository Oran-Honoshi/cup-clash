"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Trophy, Target, BarChart2,
  GitBranch, Brain, Bell, Shield, FlaskConical, LogOut, Settings,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface UserProfile {
  name:       string;
  country:    string | null;
  avatar_url: string | null;
}

const NAV = [
  { href: "/dashboard",    label: "Dashboard",      icon: LayoutDashboard },
  { href: "/groups",       label: "My Groups",      icon: Users           },
  { href: "/leaderboard",  label: "Leaderboard",    icon: Trophy          },
  { href: "/predictions",  label: "My Predictions", icon: Target          },
  { href: "/standings",    label: "Standings",      icon: BarChart2       },
  { href: "/bracket",      label: "Bracket",        icon: GitBranch       },
  { href: "/trivia",       label: "Trivia",         icon: Brain           },
  { href: "/notifications",label: "Notifications",  icon: Bell            },
  { href: "/admin",        label: "Admin",          icon: Shield          },
  { href: "/testing",      label: "Testing",        icon: FlaskConical    },
];

export function AppSidebar() {
  const pathname  = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadProfile = useCallback(async () => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb
      .from("profiles")
      .select("name, country, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data as UserProfile);
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
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col z-40 border-r"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(0,212,255,0.12)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="Cup Clash" className="h-8 w-8 rounded-xl object-cover" />
          <div>
            <div className="font-display text-lg font-black uppercase leading-none" style={{ color: "#0F172A" }}>
              Cup<span style={{ background: "linear-gradient(135deg,#00D4FF,#00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Clash</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>
              World Cup 2026
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                active ? "" : "hover:bg-slate-50"
              )}
              style={active ? {
                background: "linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,212,255,0.08))",
                color: "#0891B2",
                border: "1px solid rgba(0,212,255,0.2)",
              } : { color: "#64748b" }}>
              <Icon size={17} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <Link href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0"
            style={{ border: "2px solid rgba(0,212,255,0.2)" }}>
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={displayName} width={32} height={32} className="object-cover" />
            ) : flagCode ? (
              <Image src={flagCode} alt={profile?.country ?? ""} width={32} height={32} className="object-cover w-full h-full" unoptimized />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-black"
                style={{ background: "linear-gradient(135deg,#00D4FF,#00FF88)", color: "#0B141B" }}>
                {displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>{displayName}</div>
          </div>
          <Settings size={14} style={{ color: "#94a3b8" }} />
        </Link>

        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-colors hover:bg-red-50"
          style={{ color: "#ef4444" }}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}