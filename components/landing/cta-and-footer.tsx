"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Users } from "lucide-react";
import { ReviewTrigger } from "@/components/ui/review-modal";

export function CtaAndFooter() {
  return (
    <>
      {/* ── CTA section ── */}
      <section className="py-24 px-5 sm:px-8"
        style={{ background: "linear-gradient(135deg, #0B141B, #0B1F14)" }}>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="label-caps mb-3" style={{ color: "rgba(0,212,255,0.6)" }}>
            World Cup 2026
          </div>
          <h2 className="font-display text-4xl sm:text-6xl uppercase font-black leading-tight" style={{ color: "white" }}>
            Your prediction is{" "}
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              one tap away.
            </span>
          </h2>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            No account needed to start. Fill in your picks, create a group, and invite your team.
            June 11 is coming — don&apos;t be the one still using a spreadsheet.
          </p>

          {/* Primary CTA — straight to predictions, no auth wall */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/predictions">
              <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 20px 50px rgba(0,255,136,0.3)" }}>
                Try It Now — No Sign Up <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/join/enter">
              <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "white", background: "rgba(255,255,255,0.06)" }}>
                Join a Group <Users size={18} />
              </button>
            </Link>
          </div>

          {/* Consent line — privacy-forward */}
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.5)" }}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.5)" }}>
              Privacy Policy
            </Link>
            . We store your email and predictions only — no selling, no ads, ever.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 sm:px-8 py-12 border-t" style={{ borderColor: "rgba(0,212,255,0.08)", background: "#F8FAFC" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* Logo + tagline */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
                <Trophy size={16} style={{ color: "#0B141B" }} />
              </div>
              <div>
                <div className="font-display text-lg uppercase font-black" style={{ color: "#0F172A" }}>
                  Cup<span style={{ color: "#00D4FF" }}>Clash</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                  World Cup 2026
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-6 flex-wrap justify-center">
              {[
                { label: "Features",    href: "/#features"    },
                { label: "Pricing",     href: "/#pricing"     },
                { label: "Schedule",    href: "/schedule"     },
                { label: "Articles",    href: "/articles/48-teams-strategy" },
                { label: "Sign in",     href: "/signin"       },
                { label: "Terms",       href: "/terms"        },
                { label: "Privacy",     href: "/privacy"      },
                { label: "Refunds",     href: "/refund"       },
                { label: "Cookies",     href: "/cookies"      },
              ].map(({ label, href }) => (
                <Link key={label} href={href}
                  className="text-sm transition-colors hover:opacity-70"
                  style={{ color: "#64748b" }}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Review trigger */}
            <ReviewTrigger context="general" label="Rate us ⭐" />
          </div>

          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderColor: "#e2e8f0", color: "#94a3b8" }}>
            <div>© 2026 Cup Clash · All rights reserved</div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span>No ads · No subscriptions · Admin always free</span>
              <span style={{ color: "#e2e8f0" }}>·</span>
              <span>$2 per member · Whole tournament</span>
              <span style={{ color: "#e2e8f0" }}>·</span>
              {/* Privacy-forward data note */}
              <span>
                We collect only what we need.{" "}
                <Link href="/privacy#data" className="underline hover:opacity-70" style={{ color: "#64748b" }}>
                  See what →
                </Link>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}