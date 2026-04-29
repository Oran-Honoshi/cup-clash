"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features",     label: "Features"     },
  { href: "#how-it-works", label: "How It Works" },
  { href: "/schedule",     label: "2026 Schedule" },
  { href: "#pricing",      label: "Pricing"       },
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
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled
        ? "backdrop-blur-xl border-b"
        : "bg-transparent"
    )}
    style={scrolled ? {
      background: "rgba(5,10,15,0.9)",
      borderColor: "rgba(255,255,255,0.08)",
    } : undefined}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}
                className="text-sm font-bold uppercase tracking-wider transition-colors hover:text-white"
                style={{ color: "#64748b" }}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/signin">
              <button className="text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors hover:text-white"
                style={{ color: "#64748b" }}>
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 2px 12px rgba(16,185,129,0.4)",
                }}>
                Start free <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-white/5 transition-colors"
            style={{ color: "#94a3b8" }}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden pb-5">
            <div className="flex flex-col gap-1 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition-colors"
                  style={{ color: "#94a3b8" }}>
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 pt-3">
                <Link href="/signin" className="flex-1">
                  <button className="w-full py-2.5 rounded-full text-sm font-bold uppercase tracking-wider border transition-colors hover:text-white"
                    style={{ color: "#64748b", borderColor: "rgba(255,255,255,0.12)" }}>
                    Sign in
                  </button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <button className="w-full py-2.5 rounded-full text-sm font-bold uppercase tracking-wider text-white"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    Start free
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
