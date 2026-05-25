"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Users } from "lucide-react";
import { ReviewTrigger } from "@/components/ui/review-modal";

export function CtaAndFooter() {
  return (
    <>
      {/* ── CTA section ── */}
      <section className="py-20 px-5 sm:px-8">
        <div
          className="max-w-3xl mx-auto text-center rounded-3xl px-8 py-16 relative overflow-hidden"
          style={{
            background: "rgba(18,14,38,0.5)",
            backdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,255,136,0.18), transparent 70%)" }} />

          <div className="relative z-10 space-y-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan">
              World Cup 2026
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl uppercase leading-tight text-white">
              Your prediction is{" "}
              <span className="bg-gradient-to-br from-cyan to-ac bg-clip-text text-transparent">
                one tap away.
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-md mx-auto">
              Set up your group in under a minute. Free for hosts. Players pay $2.
              June 11 is coming — don&apos;t be the one still using a spreadsheet.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link href="/signup">
                <button
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-0.5 text-[#050e08]"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", boxShadow: "0 8px 30px rgba(0,255,136,0.4)" }}>
                  Get Started — Free <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/join/enter">
                <button
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-0.5 text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)" }}>
                  Join a Group <Users size={18} />
                </button>
              </Link>
            </div>

            <p className="text-xs text-white/30">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="underline hover:opacity-70 text-white/50">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:opacity-70 text-white/50">Privacy Policy</Link>.
              We store your email and predictions only — no selling, no ads, ever.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-5 sm:px-8 py-12 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(5,8,16,0.8)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* Logo + tagline */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
                <Trophy size={16} className="text-[#050e08]" />
              </div>
              <div>
                <div className="font-display text-lg uppercase font-black text-white">
                  Cup<span className="text-cyan">Clash</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">
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
                  className="text-sm transition-colors text-white/65 hover:text-white">
                  {label}
                </Link>
              ))}
            </div>

            {/* Review trigger */}
            <ReviewTrigger context="general" label="Rate us ⭐" />
          </div>

          <div
            className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div>© 2026 Cup Clash · All rights reserved</div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span>No ads · No subscriptions · Admin always free</span>
              <span className="text-white/15">·</span>
              <span>$2 per member · Whole tournament</span>
              <span className="text-white/15">·</span>
              <span>
                We collect only what we need.{" "}
                <Link href="/privacy#data" className="underline hover:opacity-70 text-white/50">
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
