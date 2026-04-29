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
    <header className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300")}
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
              <a key={link.href} href={link.href}
                className="text-sm font-bold uppercase tracking-wider transition-colors"
                style={{ color: "#64748b" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00D4FF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/signin">
              <button className="text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors"
                style={{ color: "#64748b" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0B141B")}
                onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B",
                  boxShadow: "0 4px 16px rgba(0,255,136,0.3)",
                }}>
                Start Free <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl transition-colors hover:bg-slate-100"
            style={{ color: "#64748b" }}
            onClick={() => setOpen(v => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden pb-5 rounded-b-2xl"
            style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid rgba(0,212,255,0.15)" }}>
            <div className="flex flex-col gap-1 pt-3 border-t" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
                  style={{ color: "#64748b" }}>
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 pt-3 px-3">
                <Link href="/signin" className="flex-1">
                  <button className="w-full py-2.5 rounded-full text-sm font-bold uppercase tracking-wider border transition-colors"
                    style={{ color: "#64748b", borderColor: "rgba(0,212,255,0.2)" }}>
                    Sign in
                  </button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <button className="w-full py-2.5 rounded-full text-sm font-bold uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                    Start Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
