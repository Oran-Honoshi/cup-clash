"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features",     label: "Features"      },
  { href: "#how-it-works", label: "How It Works"  },
  { href: "/schedule",     label: "2026 Schedule" },
  { href: "#pricing",      label: "Pricing"        },
];

// World Cup 2026 nation flag codes + display names for bunting
const BUNTING_FLAGS = [
  { code: "us", name: "USA"       },
  { code: "mx", name: "Mexico"    },
  { code: "ca", name: "Canada"    },
  { code: "ar", name: "Argentina" },
  { code: "br", name: "Brazil"    },
  { code: "fr", name: "France"    },
  { code: "de", name: "Germany"   },
  { code: "gb-eng", name: "England"  },
  { code: "es", name: "Spain"     },
  { code: "pt", name: "Portugal"  },
  { code: "nl", name: "Netherlands"},
  { code: "jp", name: "Japan"     },
  { code: "ma", name: "Morocco"   },
  { code: "ng", name: "Nigeria"   },
  { code: "kr", name: "South Korea"},
  { code: "au", name: "Australia" },
];

function BuntingStrip() {
  // Duplicate for seamless loop
  const flags = [...BUNTING_FLAGS, ...BUNTING_FLAGS, ...BUNTING_FLAGS];

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        height: 34,
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,212,255,0.12)",
      }}
    >
      {/* String line */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: 10,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.25) 10%, rgba(0,212,255,0.25) 90%, transparent)",
        }}
      />

      {/* Scrolling flag triangles */}
      <div
        className="flex items-start animate-bunting absolute top-0"
        style={{ gap: 0, willChange: "transform" }}
      >
        {flags.map((f, i) => (
          <BuntingFlag key={`${f.code}-${i}`} code={f.code} name={f.name} index={i} />
        ))}
      </div>

      <style>{`
        @keyframes buntingScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${BUNTING_FLAGS.length * 52}px); }
        }
        .animate-bunting {
          animation: buntingScroll ${BUNTING_FLAGS.length * 1.8}s linear infinite;
        }
      `}</style>
    </div>
  );
}

function BuntingFlag({ code, name, index }: { code: string; name: string; index: number }) {
  // Alternate slight drop angle for natural bunting look
  const tiltLeft  = index % 2 === 0;
  return (
    <div
      className="relative flex flex-col items-center shrink-0"
      style={{ width: 52, paddingTop: 0 }}
      title={name}
    >
      {/* String connector dot */}
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "rgba(0,212,255,0.4)",
          marginBottom: 2,
          marginTop: 8,
          boxShadow: "0 1px 3px rgba(0,212,255,0.3)",
        }}
      />
      {/* Triangle flag via clip-path */}
      <div
        style={{
          width: 32,
          height: 20,
          position: "relative",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          overflow: "hidden",
          transform: `rotate(${tiltLeft ? -3 : 3}deg)`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt={name}
          width={32}
          height={20}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.82,
          }}
        />
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300")}
      style={scrolled ? {
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(0,212,255,0.15)",
        boxShadow: "0 4px 24px rgba(0,212,255,0.06)",
      } : { background: "transparent" }}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/"><Logo /></Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-bold uppercase tracking-wider transition-colors"
                style={{ color: "#64748b" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00D4FF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/signin">
              <button
                className="text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors"
                style={{ color: "#64748b" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0B141B")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
              >
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button
                className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B",
                  boxShadow: "0 4px 16px rgba(0,255,136,0.3)",
                }}
              >
                Start Free <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl transition-colors hover:bg-slate-100"
            style={{ color: "#64748b" }}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="md:hidden pb-5 rounded-b-2xl"
            style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid rgba(0,212,255,0.15)" }}
          >
            <div className="flex flex-col gap-1 pt-3 border-t" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
                  style={{ color: "#64748b" }}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 pt-3 px-3">
                <Link href="/signin" className="flex-1">
                  <button
                    className="w-full py-2.5 rounded-full text-sm font-bold uppercase tracking-wider border transition-colors"
                    style={{ color: "#64748b", borderColor: "rgba(0,212,255,0.2)" }}
                  >
                    Sign in
                  </button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <button
                    className="w-full py-2.5 rounded-full text-sm font-bold uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}
                  >
                    Start Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bunting flags strip — always visible below the nav bar */}
      <BuntingStrip />
    </header>
  );
}