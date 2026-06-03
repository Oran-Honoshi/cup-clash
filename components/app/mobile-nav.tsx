"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Target, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

const NAV_ITEMS = [
  { href: "/dashboard",   key: "nav_home"        as const, icon: LayoutDashboard },
  { href: "/groups",      key: "nav_groups"      as const, icon: Users           },
  { href: "/predictions", key: "nav_mybets"      as const, icon: Target          },
  { href: "/leaderboard", key: "nav_table"       as const, icon: Trophy          },
  { href: "/profile",     key: "nav_profile"     as const, icon: User            },
];

export function MobileNav() {
  const pathname = usePathname();
  const navRef   = useRef<HTMLElement>(null);
  const { t } = useLocale();

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
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
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
                {t(key)}
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
