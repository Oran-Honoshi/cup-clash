"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";
import { ReviewTrigger } from "@/components/ui/review-modal";

export function CtaAndFooter() {
  return (
    <>
      {/* CTA section */}
      <section className="py-24 px-5 sm:px-8"
        style={{ background: "linear-gradient(135deg, #0B141B, #0B1F14)" }}>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="label-caps mb-3" style={{ color: "rgba(0,212,255,0.6)" }}>
            World Cup 2026
          </div>
          <h2 className="font-display text-4xl sm:text-6xl uppercase font-black leading-tight" style={{ color: "white" }}>
            Your group is{" "}
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              one passkey away.
            </span>
          </h2>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            Admin creates free. Members pay $2. Everyone predicts 104 matches.
            June 11 is coming — don't be the one still using a spreadsheet.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup">
              <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 20px 50px rgba(0,255,136,0.3)" }}>
                Start My Group — Free <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/join/enter">
              <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "white", background: "rgba(255,255,255,0.06)" }}>
                Join a Group <Users size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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

            {/* Links */}
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
            <div className="flex items-center gap-4">
              <span>No ads · No subscriptions · Admin always free</span>
              <span style={{ color: "#e2e8f0" }}>·</span>
              <span>$2 per member · Whole tournament</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}