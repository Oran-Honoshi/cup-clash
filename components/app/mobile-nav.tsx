"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Target, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",   label: "Home",    icon: LayoutDashboard },
  { href: "/groups",      label: "Groups",  icon: Users           },
  { href: "/predictions", label: "My Bets", icon: Target          },
  { href: "/leaderboard", label: "Table",   icon: Trophy          },
  { href: "/profile",     label: "Profile", icon: User            },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(0,212,255,0.12)",
      }}>
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0"
              style={active ? {
                background: "rgba(0,212,255,0.08)",
              } : undefined}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75}
                style={{ color: active ? "#0891B2" : "#94a3b8" }} />
              <span className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: active ? "#0891B2" : "#94a3b8" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}