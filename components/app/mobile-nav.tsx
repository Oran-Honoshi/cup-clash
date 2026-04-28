"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, Target, GitBranch, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Home"    },
  { href: "/leaderboard", icon: Trophy,           label: "Table"   },
  { href: "/predictions", icon: Target,           label: "Bets"    },
  { href: "/bracket",     icon: GitBranch,        label: "Bracket" },
  { href: "/testing",     icon: FlaskConical,     label: "Test"    },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.08] glass-strong">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors",
                active ? "text-white" : "text-pitch-500 hover:text-pitch-200")}
              style={active ? { color: "rgb(var(--accent-glow))" } : undefined}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: "rgb(var(--accent))" }} />
              )}
              <item.icon size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
