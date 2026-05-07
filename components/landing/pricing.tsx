"use client";

import { motion } from "framer-motion";
import { Check, Ban, CreditCard, Shield, Coffee } from "lucide-react";
import Link from "next/link";

const FEATURES_FREE = [
  "Create your group",
  "Set scoring rules",
  "Generate invite passkey",
  "Manage buy-in tracking",
  "Up to 100 members",
];

const FEATURES_MEMBER = [
  "Full predictions — all 104 matches",
  "Live leaderboard access",
  "Real-time group chat + GIFs",
  "Tournament picks (winner, boot, etc.)",
  "Knockout bracket predictions",
  "Trivia challenge — bonus points",
  "7-day refund guarantee",
];

const FOOTNOTES = [
  { Icon: Ban,        text: "No ads. No subscriptions. Ever."               },
  { Icon: CreditCard, text: "One $2 payment. Whole tournament. No surprises." },
  { Icon: Shield,     text: "7-day refund if your group doesn't go ahead."  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 sm:px-8" style={{ background: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <div className="label-caps mb-3">Pricing</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase" style={{ color: "#0F172A" }}>
            The excitement of the tournament<br />
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              for the price of a coffee.
            </span>
          </h2>
          <p className="mt-4 text-xl max-w-lg mx-auto font-bold" style={{ color: "#0F172A" }}>
            $2 per person. That's it.
          </p>
          <p className="mt-2 text-base max-w-lg mx-auto" style={{ color: "#64748b" }}>
            Admin creates the group for free. Every member — including the admin — pays $2 to join the leaderboard, unlock predictions, and access the group chat.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          {/* Admin — Free */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid #e2e8f0" }}>
            <div className="label-caps mb-2">Admin</div>
            <div className="font-display text-5xl font-black mb-1" style={{ color: "#0F172A" }}>Free</div>
            <div className="text-sm mb-5" style={{ color: "#64748b" }}>Create and manage your group at no cost.</div>
            <ul className="space-y-2.5 mb-6">
              {FEATURES_FREE.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "#475569" }}>
                  <Check size={14} style={{ color: "#0891B2" }} className="shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
                Create Group — Free
              </button>
            </Link>
          </motion.div>

          {/* Member — $2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="relative rounded-2xl p-6 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.3)", boxShadow: "0 8px 32px rgba(0,212,255,0.10)" }}>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
            <div className="flex items-center gap-2 mb-1">
              <Coffee size={16} style={{ color: "#d97706" }} />
              <div className="label-caps">Every Member</div>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <div className="font-display text-5xl font-black" style={{ color: "#0F172A" }}>$2</div>
              <div className="text-sm pb-1.5" style={{ color: "#94a3b8" }}>one-time</div>
            </div>
            <div className="text-sm mb-5" style={{ color: "#64748b" }}>
              Full access for the entire World Cup. June 11 – July 19.
            </div>
            <ul className="space-y-2.5 mb-6">
              {FEATURES_MEMBER.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "#475569" }}>
                  <Check size={14} style={{ color: "#00c46a" }} className="shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="text-xs text-center py-2 rounded-xl"
              style={{ background: "rgba(0,255,136,0.08)", color: "#059669", border: "1px solid rgba(0,255,136,0.2)" }}>
              Paid when joining a group via invite link or passkey
            </div>
          </motion.div>
        </div>

        {/* How it works summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl p-6 mb-10 text-center"
          style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
          <div className="flex items-center justify-center gap-3 flex-wrap text-sm font-bold" style={{ color: "#0F172A" }}>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,212,255,0.1)", color: "#0891B2" }}>
              1. Admin creates group free
            </span>
            <span style={{ color: "#cbd5e1" }}>→</span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,212,255,0.1)", color: "#0891B2" }}>
              2. Shares passkey
            </span>
            <span style={{ color: "#cbd5e1" }}>→</span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>
              3. Members pay $2
            </span>
            <span style={{ color: "#cbd5e1" }}>→</span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#059669" }}>
              4. Everyone predicts
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4 text-center text-sm" style={{ color: "#64748b" }}>
          {FOOTNOTES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2">
              <Icon size={15} style={{ color: "#0891B2" }} />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
