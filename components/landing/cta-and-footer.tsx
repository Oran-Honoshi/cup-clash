"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { ReviewTrigger } from "@/components/ui/review-modal";

const FOOTER_COLS = [
  {
    heading: "Play",
    links: [
      { label: "How it Works", href: "/how-it-works"  },
      { label: "Pricing",      href: "/#pricing"      },
      { label: "Schedule",     href: "/schedule"      },
      { label: "For Teams",    href: "/#for-companies"},
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",    href: "/about"   },
      { label: "Contact",  href: "/contact" },
      { label: "Sign in",  href: "/signin"  },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy",      href: "/privacy"  },
      { label: "Terms",        href: "/terms"    },
      { label: "Refunds",      href: "/refund"   },
      { label: "Install App",  href: "/install"  },
    ],
  },
];

export function CtaAndFooter() {
  return (
    <>
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto text-center rounded-3xl px-8 py-16 relative overflow-hidden"
          style={{ background: "rgba(18,14,38,0.5)", backdropFilter: "blur(40px) saturate(180%)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,255,136,0.18), transparent 70%)" }} />

          <div className="relative z-10 space-y-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan">The Clock Is Ticking</div>
            <h2 className="font-display font-black text-4xl sm:text-6xl uppercase leading-tight text-white">
              Tournament starts<br />
              <span style={{ color: "#00FF88" }}>June 11, 2026.</span>
            </h2>
            <p className="text-lg text-white/60 max-w-md mx-auto">
              Set up your group in under a minute. Free to join, free to play.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link href="/signup">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-0.5 text-[#050e08]"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", boxShadow: "0 8px 30px rgba(0,255,136,0.4)" }}>
                  Get Started · Free <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/#pricing">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all hover:-translate-y-0.5 text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)" }}>
                  See Pricing
                </button>
              </Link>
            </div>
            <p className="text-xs text-white/30">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="underline hover:opacity-70 text-white/50">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:opacity-70 text-white/50">Privacy Policy</Link>.
              We store your email and predictions only. No selling, no trackers.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-5 sm:px-8 pt-16 pb-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(5,8,16,0.8)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
                  <Trophy size={16} className="text-[#050e08]" />
                </div>
                <div className="font-display text-lg uppercase font-black text-white">
                  Cup<span style={{ color: "#00D4FF" }}>Clash</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                The free social prediction game for World Cup 2026. Compete with friends and colleagues.
              </p>
              <div className="mt-4">
                <ReviewTrigger context="general" label="Rate us ⭐" />
              </div>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.heading}>
                <div className="text-xs font-black uppercase tracking-[0.16em] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {col.heading}
                </div>
                <div className="flex flex-col gap-2.5">
                  {col.links.map(({ label, href }) => (
                    <Link key={label} href={href} className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              © 2026 Cup Clash. World Cup 2026 is a trademark of FIFA. Not affiliated.
            </div>
            <div className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>
              🟢 Free to join · No subscriptions
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}