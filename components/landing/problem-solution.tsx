"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

// Gemini copy — exact pairs from the brief
const PAIRS = [
  { pain: "📉 Manual Math: Broken formulas and Excel errors.",                solution: "⚡ Instant Scoring: Automated, real-time points engine."              },
  { pain: "💸 The Debt Collector: Chasing friends for buy-ins.",              solution: "💰 Pot Tracker: Built-in \"Paid/Pending\" status bars."              },
  { pain: "💬 Lost Info: Predictions buried in 400 unread messages.",         solution: "🔒 Locked Timestamps: Digital proof of every guess."                  },
  { pain: "😴 Scale Shock: Managing 48 teams by hand is a job.",              solution: "🌍 104-Match Flow: Expansion-ready logic for 2026."                   },
  { pain: "🤷‍♂️ The \"Who Won?\" Debate: Constant tie-breaker fights.",      solution: "🏆 Speed Rules: Crystal clear, time-based tie-breakers."             },
  { pain: "🏴‍☠️ Ad-Trash: Shady sites filled with pop-up junk.",           solution: "💎 Pro-Tier UI: 100% Ad-free. Clean. Fast. Elite."                    },
];

export function ProblemSolution() {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="label-caps mb-3">Sound familiar?</div>
          {/* Gemini header */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase text-white leading-tight">
            The Group Chat Nightmare<br />
            <span style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              vs. The Cup Clash Way.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* ❌ WhatsApp Nightmare */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(239,68,68,0.15)" }}>📱</div>
                <div>
                  <div className="font-display text-xl uppercase text-white">The WhatsApp Nightmare</div>
                  <div className="text-xs" style={{ color: "#ef4444" }}>0/10 — do not recommend</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {PAIRS.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)" }}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.2)" }}>
                    <X size={11} style={{ color: "#ef4444" }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{p.pain}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ✅ Cup Clash Way */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.04)" }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(16,185,129,0.15)" }}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(16,185,129,0.15)" }}>⚽</div>
                <div>
                  <div className="font-display text-xl uppercase text-white">The Cup Clash Way</div>
                  <div className="text-xs" style={{ color: "#10b981" }}>Pure football joy. Zero admin pain.</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {PAIRS.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.06)" }}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(16,185,129,0.2)" }}>
                    <Check size={11} style={{ color: "#10b981" }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>{p.solution}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
