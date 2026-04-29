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
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"       },
  { href: "/groups",         icon: Users,           label: "My Groups"       },
  { href: "/leaderboard",    icon: Trophy,          label: "Leaderboard"     },
  { href: "/predictions",    icon: Target,          label: "My Predictions"  },
  { href: "/standings",      icon: BarChart2,       label: "Standings"       },
  { href: "/bracket",        icon: GitBranch,       label: "Bracket"         },
  { href: "/trivia",         icon: Brain,           label: "Trivia"          },
  { href: "/notifications",  icon: Bell,            label: "Notifications"   },
  { href: "/admin",          icon: ShieldCheck,     label: "Admin"           },
  { href: "/testing",        icon: FlaskConical,    label: "Testing"         },
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
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col z-40 border-r border-white/[0.08] glass-strong">
      <div className="px-4 py-5 border-b border-white/[0.08]">
        <Logo size="sm" />
        <p className="mt-1 text-[10px] text-pitch-400 uppercase tracking-widest pl-0.5">World Cup 2026</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-150",
                active ? "text-white" : "text-pitch-400 hover:text-pitch-200 hover:bg-white/[0.04]"
              )}
              style={active ? {
                backgroundColor: "rgb(var(--accent) / 0.15)",
                color: "rgb(var(--accent-glow))",
                boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)",
              } : undefined}
            >
              <item.icon size={16} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/[0.08] space-y-1">
        <Link href="/profile"
          className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.04]",
            pathname === "/profile" && "bg-white/[0.06]")}>
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={displayName}
              className="h-7 w-7 rounded-full object-cover shrink-0 ring-2 ring-white/20" />
          ) : (
            <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-pitch-200 truncate">{displayName}</div>
            <div className="text-[10px] text-pitch-400 uppercase tracking-wider truncate">{profile?.country ?? ""}</div>
          </div>
          <UserCircle size={13} className="text-pitch-600 shrink-0" />
        </Link>

        <button onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-pitch-500 hover:text-danger hover:bg-danger/10 transition-all text-xs font-bold uppercase tracking-widest">
          <LogOut size={14} />Sign out
        </button>
      </div>
    </aside>
  );
}