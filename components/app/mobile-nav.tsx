"use client";

import { useRef, useEffect } from "react";
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
  const navRef   = useRef<HTMLElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // When the soft keyboard opens, the visual viewport shrinks.
    // Translate the nav up by exactly the gap between the layout
    // viewport bottom and the visual viewport bottom so it stays
    // pinned to the visible bottom edge (just above the keyboard).
    const reposition = () => {
      const el = navRef.current;
      if (!el) return;
      const offsetFromBottom =
        window.innerHeight - vv.height - (vv.offsetTop ?? 0);
      el.style.transform = `translateY(-${Math.max(0, offsetFromBottom)}px)`;
    };

    vv.addEventListener("resize", reposition);
    vv.addEventListener("scroll", reposition);
    reposition();

    return () => {
      vv.removeEventListener("resize", reposition);
      vv.removeEventListener("scroll", reposition);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t"
      style={{
        background: "rgba(8, 12, 22, 0.9)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.07)",
        // Disable the browser's own keyboard-avoidance animation.
        willChange: "transform",
      }}
    >
      <div
        className="flex items-center justify-around px-2 py-2"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0"
              style={active ? { background: "rgba(0,255,136,0.1)" } : undefined}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.75}
                style={{ color: active ? "#00FF88" : "rgba(255,255,255,0.4)" }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: active ? "#00FF88" : "rgba(255,255,255,0.4)" }}
              >
                {label}
              </span>
              {active && (
                <div className="w-4 h-0.5 rounded-full" style={{ background: "#00FF88" }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
