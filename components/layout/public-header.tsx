"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

// Lightweight header for genuinely public, anonymous-visitor pages
// (/news, /leagues). Deliberately smaller than the authenticated app
// shell (components/app/sidebar.tsx, app-header.tsx) — no group
// switcher, no admin/profile menu — just enough to orient a first-time
// visitor and get them signed in.
const PUBLIC_NAV = [
  { href: "/news",      label: "News"      },
  { href: "/scores",    label: "Scores"    },
  { href: "/standings", label: "Standings" },
  { href: "/leagues",   label: "Leagues"   },
];

interface PublicHeaderUser {
  name:      string;
  avatarUrl: string | null;
}

export function PublicHeader({ active, user }: { active?: string; user?: PublicHeaderUser | null }) {
  const router = useRouter();

  return (
    <header
      style={{
        background: "var(--nv)",
        borderBottom: "1px solid var(--br)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-1 min-w-0">
          {/* Signed-in visitors land here from within the app shell (e.g. the
              "More" menu), which has no sidebar/bottom-nav of its own — give
              them an explicit way back instead of relying on the OS back
              gesture. */}
          {user && (
            <button
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/dashboard");
              }}
              aria-label="Back"
              className="flex items-center justify-center shrink-0 transition-colors"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                color: "var(--t2)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 shrink-0" style={{ textDecoration: "none" }}>
            <img src="/icons/icon-192.png" width={30} height={30} alt="" style={{ borderRadius: 8, display: "block" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--tx)" }}>
              Cup<span style={{ color: "var(--ac)" }}>Clash</span>
            </span>
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-1 min-w-0">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 12px",
                borderRadius: 8,
                color: active === item.href ? "var(--ac)" : "var(--t2)",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0" style={{ textDecoration: "none" }}>
            <span className="hidden sm:inline" style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, color: "var(--t2)" }}>
              {user.name}
            </span>
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
          </Link>
        ) : (
          <Link href="/signin" className="shrink-0" style={{ textDecoration: "none" }}>
            <button
              className="flex items-center gap-1.5 transition-all"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                padding: "9px 16px",
                borderRadius: 100,
                background: "var(--ac)",
                color: "var(--at)",
                border: "none",
              }}
            >
              Sign in <ArrowRight size={13} />
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
