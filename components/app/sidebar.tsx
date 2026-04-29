"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Trophy, Target, ShieldCheck, LogOut,
  FlaskConical, GitBranch, BarChart2, UserCircle, Brain,
  Users, Bell,
} from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"      },
  { href: "/groups",         icon: Users,           label: "My Groups"      },
  { href: "/leaderboard",    icon: Trophy,          label: "Leaderboard"    },
  { href: "/predictions",    icon: Target,          label: "My Predictions" },
  { href: "/standings",      icon: BarChart2,       label: "Standings"      },
  { href: "/bracket",        icon: GitBranch,       label: "Bracket"        },
  { href: "/trivia",         icon: Brain,           label: "Trivia"         },
  { href: "/notifications",  icon: Bell,            label: "Notifications"  },
  { href: "/admin",          icon: ShieldCheck,     label: "Admin"          },
  { href: "/testing",        icon: FlaskConical,    label: "Testing"        },
];

interface UserProfile { name: string; country: string; avatar_url: string | null; }

export function AppSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
      const sb = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from("profiles").select("name, country, avatar_url").eq("id", user.id).single();
      if (data) setProfile(data as UserProfile);
    }
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { router.push("/signin"); return; }
    const sb = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await sb.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  const displayName = profile?.name ?? "You";

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col z-40 border-r"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(0,212,255,0.15)",
        boxShadow: "4px 0 24px rgba(0,212,255,0.06)",
      }}>

      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: "rgba(0,212,255,0.12)" }}>
        <Logo size="sm" />
        <p className="mt-1 text-[10px] uppercase tracking-widest pl-0.5 font-bold" style={{ color: "#00D4FF" }}>
          World Cup 2026
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-150",
              )}
              style={active ? {
                background: "linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,212,255,0.08))",
                color: "#0B141B",
                borderLeft: "3px solid #00FF88",
                paddingLeft: "calc(0.75rem - 3px)",
                boxShadow: "0 2px 12px rgba(0,255,136,0.15)",
              } : {
                color: "#64748b",
              }}
            >
              <item.icon size={16} className="shrink-0"
                style={{ color: active ? "#00D4FF" : "#94a3b8" }} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-3 border-t space-y-1" style={{ borderColor: "rgba(0,212,255,0.12)" }}>
        <Link href="/profile"
          className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all",
            pathname === "/profile" && "bg-white/60")}
          style={{ border: pathname === "/profile" ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent" }}
        >
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={displayName}
              className="h-7 w-7 rounded-full object-cover shrink-0"
              style={{ border: "2px solid rgba(0,212,255,0.3)" }} />
          ) : (
            <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate" style={{ color: "#0B141B" }}>{displayName}</div>
            <div className="text-[10px] uppercase tracking-wider truncate" style={{ color: "#94a3b8" }}>
              {profile?.country ?? ""}
            </div>
          </div>
          <UserCircle size={13} style={{ color: "#cbd5e1" }} className="shrink-0" />
        </Link>

        <button onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:bg-red-50"
          style={{ color: "#94a3b8" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
          onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
        >
          <LogOut size={14} />Sign out
        </button>
      </div>
    </aside>
  );
}
