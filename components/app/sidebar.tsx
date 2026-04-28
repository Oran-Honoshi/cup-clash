"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, Target, ShieldCheck, LogOut, Users, FlaskConical, GitBranch } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"       },
  { href: "/leaderboard", icon: Trophy,           label: "Leaderboard"    },
  { href: "/predictions", icon: Target,           label: "My Predictions" },
  { href: "/bracket",     icon: GitBranch,        label: "Bracket"        },
  { href: "/admin",       icon: ShieldCheck,      label: "Admin"          },
  { href: "/testing",     icon: FlaskConical,     label: "Testing 🧪"     },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col z-40 border-r border-white/[0.08] glass-strong">
      <div className="px-4 py-5 border-b border-white/[0.08]">
        <Logo size="sm" />
        <p className="mt-1 text-[10px] text-pitch-400 uppercase tracking-widest pl-0.5">
          Tech Titans WC
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-150",
                active ? "text-white" : "text-pitch-400 hover:text-pitch-200 hover:bg-white/[0.04]"
              )}
              style={active ? {
                backgroundColor: "rgb(var(--accent) / 0.15)",
                color: "rgb(var(--accent-glow))",
                boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.2)",
              } : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03]">
          <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}>
            <Users size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-pitch-200 truncate">Amit</div>
            <div className="text-[10px] text-pitch-400 uppercase tracking-wider">🇦🇷 Argentina</div>
          </div>
          <button className="ml-auto text-pitch-500 hover:text-danger transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
