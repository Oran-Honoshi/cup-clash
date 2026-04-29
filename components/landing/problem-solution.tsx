"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const PAIN = [
  { icon: "😤", text: "\"Who's in? Who hasn't paid yet?\" — 47 WhatsApp messages" },
  { icon: "📊", text: "A shared Google Sheet that breaks every matchday" },
  { icon: "🤷", text: "No one knows the rules by Week 2" },
  { icon: "💸", text: "Settling up is always awkward" },
  { icon: "📭", text: "Updates buried in the group chat" },
  { icon: "😴", text: "Someone always forgets to predict before kickoff" },
];

const SOLUTIONS = [
  { icon: "⚡", text: "One link. Friends join in seconds. Buy-ins tracked automatically." },
  { icon: "🏆", text: "Live leaderboard that updates the second a goal goes in" },
  { icon: "📋", text: "Rules sent to every member, visible in every session" },
  { icon: "💰", text: "Prize pot calculated live. Everyone sees who's winning what." },
  { icon: "🔔", text: "Push notifications before kickoff so no one misses a prediction" },
  { icon: "🔒", text: "Predictions auto-lock 5 minutes before kickoff. No late changes." },
];

export function ProblemSolution() {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="label-caps mb-3">Sound familiar?</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase text-white leading-tight">
            Running a prediction pool<br />
            <span style={{
              background: "linear-gradient(135deg, #E61D25, #f59e0b)",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>shouldn't feel like a second job.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* The WhatsApp Way */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(239,68,68,0.15)" }}>📱</div>
                <div>
                  <div className="font-display text-xl uppercase text-white">The WhatsApp Way</div>
                  <div className="text-xs" style={{ color: "#ef4444" }}>0/10 — would not recommend</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {PAIN.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.06)" }}
                >
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(239,68,68,0.2)" }}>
                    <X size={11} style={{ color: "#ef4444" }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* The Cup Clash Way */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.04)" }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(16,185,129,0.15)" }}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(16,185,129,0.15)" }}>⚽</div>
                <div>
                  <div className="font-display text-xl uppercase text-white">The Cup Clash Way</div>
                  <div className="text-xs" style={{ color: "#10b981" }}>Pure football joy, zero admin pain</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {SOLUTIONS.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(16,185,129,0.06)" }}
                >
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(16,185,129,0.2)" }}>
                    <Check size={11} style={{ color: "#10b981" }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
