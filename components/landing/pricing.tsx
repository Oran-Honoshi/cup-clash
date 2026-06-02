"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Users, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";

const FREE_FEATURES = [
  "Join any private or corporate group at no cost",
  "Full predictions — all 104 matches & knockout bracket",
  "Live leaderboard and group chat",
  "All scoring rules and tournament picks",
  "Ads shown to support the platform",
];

const UPGRADE_FEATURES = [
  "Everything in Free",
  "Ad-free experience for the whole tournament",
  "One-time per group, per tournament",
  "Upgrade at any time after joining",
];

export function Pricing() {
  const [showEnterprise, setShowEnterprise] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">Simple, honest pricing</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl uppercase text-white">
              Free to play.{" "}
              <span style={{ color: "#00FF88" }}>Always.</span>
            </h2>
            <p className="text-lg mt-4 max-w-xl mx-auto text-white/60">
              Every feature is free. The optional $2 upgrade removes ads for the tournament — nothing more.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 items-stretch mb-6">

            {/* FREE */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: "rgba(18,14,38,0.5)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF)" }} />
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)" }}>
                    <Users size={18} style={{ color: "#00FF88" }} />
                  </div>
                  <div>
                    <div className="font-display text-xl uppercase font-black text-white">Free</div>
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5"
                      style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.25)" }}>
                      Always free
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="font-display font-black" style={{ fontSize: 64, color: "#00FF88", lineHeight: 1 }}>$0</span>
                  <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>forever, no card required</div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {FREE_FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.2)" }}>
                        <Check size={10} style={{ color: "#00FF88" }} />
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup" className="block mt-auto">
                  <button
                    className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#050e08", boxShadow: "0 4px 20px rgba(0,255,136,0.25)" }}>
                    Join Free <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* REMOVE ADS */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: "rgba(18,14,38,0.5)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(0,212,255,0.2)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #8B5CF6)" }} />
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
                    <Sparkles size={18} style={{ color: "#00D4FF" }} />
                  </div>
                  <div>
                    <div className="font-display text-xl uppercase font-black text-white">Remove Ads</div>
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5"
                      style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}>
                      Optional upgrade
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="font-display font-black" style={{ fontSize: 64, color: "#00D4FF", lineHeight: 1 }}>$2</span>
                  <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>per person · one-time · this tournament</div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {UPGRADE_FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                        <Check size={10} style={{ color: "#00D4FF" }} />
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Join free first — upgrade from within your group any time
                </p>
                <Link href="/signup" className="block mt-auto">
                  <button
                    className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ border: "1px solid rgba(0,212,255,0.35)", color: "#00D4FF", background: "rgba(0,212,255,0.06)" }}>
                    Get Started Free <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Corporate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(18,14,38,0.7)",
              backdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div className="h-1" style={{ background: "linear-gradient(90deg, #8B5CF6, #00D4FF)" }} />
            <div className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                  <Shield size={18} style={{ color: "#8B5CF6" }} />
                </div>
                <div className="flex-1">
                  <div className="font-display text-xl uppercase font-black text-white">Corporate Ad-Free</div>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Admin pays once. Every employee joins free with no ads — no payment screen ever.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div>
                    <div className="text-sm font-bold text-white">Team Starter</div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Up to 50 employees · all join free, no ads</div>
                  </div>
                  <div className="font-display font-black text-white shrink-0" style={{ fontSize: 32 }}>$75</div>
                </div>
                <div className="rounded-2xl p-5 flex items-center justify-between gap-4 relative"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  <div className="absolute top-3 right-14 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                    Popular
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Corporate Pack</div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Up to 100 employees · all join free, no ads</div>
                  </div>
                  <div className="font-display font-black shrink-0" style={{ fontSize: 32, color: "#8B5CF6" }}>$130</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/dashboard?action=corporate" className="w-full sm:w-auto">
                  <button
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ border: "1px solid rgba(139,92,246,0.4)", color: "#8B5CF6", background: "rgba(139,92,246,0.08)" }}>
                    Sponsor your team <ArrowRight size={14} />
                  </button>
                </Link>
                <button onClick={() => setShowEnterprise(true)}
                  className="text-sm font-bold underline transition-colors hover:opacity-70"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  Need more than 100? Contact us
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <EnterpriseModal isOpen={showEnterprise} onClose={() => setShowEnterprise(false)} />
    </>
  );
}
