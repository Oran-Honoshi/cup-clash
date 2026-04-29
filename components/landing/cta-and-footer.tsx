"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

const LINKS = {
  product: [
    { label: "Features",     href: "#features"     },
    { label: "Pricing",      href: "#pricing"       },
    { label: "How It Works", href: "#how-it-works"  },
    { label: "Schedule",     href: "/schedule"      },
  ],
  legal: [
    { label: "Privacy",      href: "/privacy"       },
    { label: "Terms",        href: "/terms"         },
    { label: "Unsubscribe",  href: "/unsubscribe"   },
  ],
};

export function CtaAndFooter() {
  return (
    <>
      {/* Final CTA */}
      <section className="py-28 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.08) 100%)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }} />

            <div className="text-4xl mb-6">🏆</div>
            <h2 className="font-display text-5xl sm:text-6xl uppercase text-white mb-4 leading-tight">
              Are you the<br />
              <span style={{ color: "#10b981" }}>World Cup Oracle?</span>
            </h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
              June 11 is coming fast. Your group is waiting.
              Create your league in 30 seconds — free.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 30px rgba(16,185,129,0.5)" }}>
                  Create a group — it's free <ArrowRight size={20} />
                </button>
              </Link>
              <Link href="/schedule">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-colors hover:text-white"
                  style={{ color: "#64748b", border: "1px solid rgba(255,255,255,0.1)" }}>
                  View the full schedule
                </button>
              </Link>
            </div>

            <p className="mt-6 text-sm" style={{ color: "#64748b" }}>
              No credit card required · 3 members free forever · Upgrade anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-5 sm:px-8 py-12" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2">
              <div className="font-display text-2xl uppercase text-white mb-2">Cup Clash</div>
              <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                The private World Cup 2026 prediction league.<br />
                Ad-free. Fan-first. Built for your group.
              </p>
              <div className="text-xs" style={{ color: "#475569" }}>
                © 2026 Cup Clash. All rights reserved.
              </div>
            </div>
            {/* Links */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Product</div>
              <ul className="space-y-2">
                {LINKS.product.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: "#64748b" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Legal</div>
              <ul className="space-y-2">
                {LINKS.legal.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: "#64748b" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="text-xs" style={{ color: "#475569" }}>
              🚫 Cup Clash products are always ad-free. We don't show ads or let advertisers promote products to our users.
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: "#475569" }}>
              <span>Made with ⚽ for the beautiful game</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
