"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Trophy, Target, BarChart2, UserCircle, LogOut } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Home"    },
  { href: "/leaderboard", icon: Trophy,          label: "Table"   },
  { href: "/predictions", icon: Target,          label: "Bets"    },
  { href: "/standings",   icon: BarChart2,       label: "Groups"  },
  { href: "/profile",     icon: UserCircle,      label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router   = useRouter();

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

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(0,212,255,0.15)",
        boxShadow: "0 -4px 24px rgba(0,212,255,0.08)",
      }}>
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
              style={{ color: active ? "#00D4FF" : "#94a3b8" }}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF)" }} />
              )}
              <item.icon size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={handleSignOut}
          className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
          style={{ color: "#cbd5e1" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
          onMouseLeave={e => (e.currentTarget.style.color = "#cbd5e1")}
        >
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Out</span>
        </button>
      </div>
    </nav>
  );
}
