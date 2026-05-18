"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Users, Building2, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";

const FREE_FEATURES = [
  "Predict all 104 World Cup matches",
  "Live automated leaderboard",
  "Knockout bracket predictions",
  "Tournament picks (winner, top scorer, etc.)",
  "Group chat with GIFs",
  "Buy-in & prize pool tracker",
  "World Cup trivia",
  "Push notifications",
  "Mobile app (install to home screen)",
];

const CORPORATE_FEATURES = [
  "Everything in the free tier",
  "Up to 50 members — employees join free",
  "Single flat payment — no individual checkouts",
  "Custom corporate prize configuration",
  "Sponsored access splash screen for employees",
  "Priority support",
];

const CORPORATE_100_FEATURES = [
  "Everything in Team Starter",
  "Up to 100 members",
  "Maximum value for large departments",
  "Ideal for multi-team competitions",
];

export function Pricing() {
  const [showEnterprise, setShowEnterprise] = useState(false);

  return (
    <>
      <section id="pricing" className="py-16 px-5 sm:px-8" style={{ background: "#F8FAFC" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="label-caps mb-3">Pricing</div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase" style={{ color: "#0F172A" }}>
              Simple,{" "}
              <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                honest pricing
              </span>
            </h2>
            <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: "#64748b" }}>
              Free for the 2026 World Cup beta. Corporate packs available for teams and companies.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Free / Individual */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", border: "2px solid rgba(0,212,255,0.2)", boxShadow: "0 4px 24px rgba(0,212,255,0.08)" }}>
              <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <Zap size={20} style={{ color: "#0891B2" }} />
                  </div>
                  <div>
                    <div className="font-display text-lg uppercase font-black" style={{ color: "#0F172A" }}>Individual</div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>For friend groups</div>
                  </div>
                </div>
                <div className="mb-5">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="font-display text-5xl font-black" style={{ color: "#0F172A" }}>$0</span>
                    <span className="text-lg mb-2" style={{ color: "#94a3b8" }}>beta</span>
                  </div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Free for the entire FIFA World Cup 2026.
                  </p>
                </div>
                <Link href="/signup" className="block mb-7">
                  <button className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
                    Start Free <ArrowRight size={16} />
                  </button>
                </Link>
                <div className="space-y-2.5">
                  {FREE_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(0,255,136,0.1)" }}>
                        <Check size={10} style={{ color: "#059669" }} />
                      </div>
                      <span className="text-xs" style={{ color: "#475569" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: "#f1f5f9" }}>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    After beta: $2 per member · Whole tournament
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Team Starter — $75 */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #0B141B, #0B1F14)", border: "2px solid rgba(0,212,255,0.4)", boxShadow: "0 8px 40px rgba(0,212,255,0.2)" }}>
              {/* Popular badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                Most Popular
              </div>
              <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
                    <Users size={20} style={{ color: "#00D4FF" }} />
                  </div>
                  <div>
                    <div className="font-display text-lg uppercase font-black" style={{ color: "white" }}>Team Starter</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Up to 50 members</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="font-display text-5xl font-black" style={{ color: "white" }}>$75</span>
                    <span className="text-lg mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>one-time</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                    style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#00FF88" }}>
                      $1.50/member — 25% savings
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Employees join free. One payment for the whole team.
                  </p>
                </div>
                <button className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 mb-7 transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 20px rgba(0,255,136,0.3)" }}>
                  Get Team Starter <ArrowRight size={16} />
                </button>
                <div className="space-y-2.5">
                  {CORPORATE_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)" }}>
                        <Check size={10} style={{ color: "#00FF88" }} />
                      </div>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Corporate Pack — $130 */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", border: "2px solid rgba(217,119,6,0.3)", boxShadow: "0 4px 24px rgba(217,119,6,0.08)" }}>
              <div className="h-1.5" style={{ background: "linear-gradient(90deg, #d97706, #f59e0b)" }} />
              <div className="p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                    <Building2 size={20} style={{ color: "#d97706" }} />
                  </div>
                  <div>
                    <div className="font-display text-lg uppercase font-black" style={{ color: "#0F172A" }}>Corporate Pack</div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>Up to 100 members</div>
                  </div>
                </div>
                <div className="mb-5">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="font-display text-5xl font-black" style={{ color: "#0F172A" }}>$130</span>
                    <span className="text-lg mb-2" style={{ color: "#94a3b8" }}>one-time</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                    style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#d97706" }}>
                      $1.30/member — maximum value
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    For large departments and multi-team competitions.
                  </p>
                </div>
                <button className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 mb-7 transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "white", boxShadow: "0 4px 16px rgba(217,119,6,0.25)" }}>
                  Get Corporate Pack <ArrowRight size={16} />
                </button>
                <div className="space-y-2.5">
                  {[...CORPORATE_FEATURES, ...CORPORATE_100_FEATURES].map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(217,119,6,0.1)" }}>
                        <Check size={10} style={{ color: "#d97706" }} />
                      </div>
                      <span className="text-xs" style={{ color: "#475569" }}>{f}</span>
                    </div>
                  ))}
                </div>
                {/* Enterprise CTA */}
                <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "#f1f5f9" }}>
                  <p className="text-xs mb-2" style={{ color: "#64748b" }}>Need more than 100 members?</p>
                  <button
                    onClick={() => setShowEnterprise(true)}
                    className="text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70"
                    style={{ color: "#0891B2" }}>
                    Contact us for Enterprise →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <EnterpriseModal isOpen={showEnterprise} onClose={() => setShowEnterprise(false)} />
    </>
  );
}