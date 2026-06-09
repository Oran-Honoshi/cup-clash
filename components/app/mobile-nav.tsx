"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Target, Trophy,
  GitBranch, Brain, BarChart2, User, Bell, MoreHorizontal, X, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import { createPortal } from "react-dom";

const NAV_ITEMS = [
  { href: "/dashboard",   key: "nav_home"    as const, icon: LayoutDashboard },
  { href: "/groups",      key: "nav_groups"  as const, icon: Users           },
  { href: "/predictions", key: "nav_mybets"  as const, icon: Target          },
  { href: "/leaderboard", key: "nav_table"   as const, icon: Trophy          },
];

const MORE_ITEMS = [
  { href: "/chat",          label: "Chat",           icon: MessageCircle },
  { href: "/bracket",       label: "Bracket",        icon: GitBranch     },
  { href: "/trivia",        label: "Trivia",          icon: Brain         },
  { href: "/standings",     label: "Standings",       icon: BarChart2     },
  { href: "/profile",       label: "Profile",         icon: User          },
  { href: "/notifications", label: "Notifications",   icon: Bell          },
];

function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex: 9998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl"
        style={{
          background: "rgba(8,12,22,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <span className="font-display text-base uppercase font-black text-white tracking-wide">More</span>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Items */}
        <div className="px-3 py-2">
          {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors"
                style={active
                  ? { background: "rgba(0,255,136,0.1)", color: "#00FF88" }
                  : { color: "rgba(255,255,255,0.75)" }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                <span className="font-bold text-sm">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Safe area */}
        <div style={{ height: "env(safe-area-inset-bottom, 12px)", minHeight: 12 }} />
      </div>
    </div>,
    document.body
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const navRef   = useRef<HTMLElement>(null);
  const { t } = useLocale();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close More drawer on route change
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

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

  // Check if current path is a "More" item so we highlight the More button
  const isMoreActive = MORE_ITEMS.some(item =>
    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  return (
    <>
      <nav
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t"
        style={{
          background: "rgba(8, 12, 22, 0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: "rgba(255,255,255,0.07)",
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

          {/* More button */}
          <button
            onClick={() => setMoreOpen(o => !o)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0"
            style={(moreOpen || isMoreActive) ? { background: "rgba(0,212,255,0.1)" } : undefined}
          >
            <MoreHorizontal
              size={20}
              strokeWidth={(moreOpen || isMoreActive) ? 2.5 : 1.75}
              style={{ color: (moreOpen || isMoreActive) ? "#00D4FF" : "rgba(255,255,255,0.4)" }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: (moreOpen || isMoreActive) ? "#00D4FF" : "rgba(255,255,255,0.4)" }}
            >
              More
            </span>
            {isMoreActive && !moreOpen && (
              <div className="w-4 h-0.5 rounded-full" style={{ background: "#00D4FF" }} />
            )}
          </button>
        </div>
      </nav>

      <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
