"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const PROBLEMS = [
  "Someone always argues about who guessed what",
  "Predictions on WhatsApp get buried in chat",
  "No one can agree on the scoring rules",
  "Tracking who paid is a nightmare spreadsheet",
  "The 'winner' is decided by memory, not proof",
  "Scores updated manually — someone always cheats",
];

const SOLUTIONS = [
  "All predictions locked before kickoff — no disputes",
  "Private group dashboard everyone can see in real time",
  "Admin sets the rules once — everyone plays by them",
  "Built-in buy-in tracker with paid/unpaid status per member",
  "Leaderboard with full point history per player, per match",
  "Live score sync triggers automatic leaderboard updates",
];

export function ProblemSolution() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="label-caps mb-4">The problem</div>
          <h2 className="font-display text-4xl sm:text-6xl uppercase text-white leading-[0.95] tracking-tight">
            Running a pool on WhatsApp
            <br />
            <span className="gradient-text">is a nightmare.</span>
          </h2>
          <p className="mt-5 text-lg text-pitch-300">
            You&apos;ve been there. Here&apos;s the Cup Clash way.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {/* Pain column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border border-danger/20 bg-danger/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-danger/15 flex items-center gap-2">
                <X size={16} className="text-danger" />
                <span className="font-display text-xl uppercase text-danger tracking-tight">
                  The WhatsApp Way
                </span>
              </div>
              <ul className="divide-y divide-danger/10">
                {PROBLEMS.map((p, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 px-6 py-3.5 text-sm text-pitch-300"
                  >
                    <X size={14} className="text-danger shrink-0 mt-0.5" />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Solution column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: "rgb(var(--accent) / 0.25)",
                background: "rgb(var(--accent) / 0.05)",
              }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-2"
                style={{ borderColor: "rgb(var(--accent) / 0.15)" }}
              >
                <Check size={16} style={{ color: "rgb(var(--accent-glow))" }} />
                <span
                  className="font-display text-xl uppercase tracking-tight"
                  style={{ color: "rgb(var(--accent-glow))" }}
                >
                  The Cup Clash Way
                </span>
              </div>
              <ul
                className="divide-y"
                style={{ borderColor: "rgb(var(--accent) / 0.08)" }}
              >
                {SOLUTIONS.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                    className="flex items-start gap-3 px-6 py-3.5 text-sm text-pitch-200"
                  >
                    <Check
                      size={14}
                      className="shrink-0 mt-0.5"
                      style={{ color: "rgb(var(--accent-glow))" }}
                    />
                    {s}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
