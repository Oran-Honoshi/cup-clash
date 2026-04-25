"use client";

import { motion } from "framer-motion";
import { UserPlus, Pencil, Trophy } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: UserPlus,
    title: "Create your group",
    body: "Set your buy-in, scoring rules, and payout splits. Get a private invite link to share.",
    badge: "1 minute",
  },
  {
    n: "02",
    icon: Pencil,
    title: "Predict every match",
    body: "Pick scores, top scorers, and tournament winners. Bets stay hidden until kickoff.",
    badge: "All tournament",
  },
  {
    n: "03",
    icon: Trophy,
    title: "Settle up at the final",
    body: "Live leaderboard tracks the climb. Export a payout report when it's all over.",
    badge: "One tap",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28"
      style={{
        background:
          "linear-gradient(180deg, #F9FAFB 0%, rgb(var(--brand) / 0.04) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="label-caps mb-3">How it works</div>
          <h2 className="h-display text-3xl sm:text-5xl text-ink-900">
            From group chat to <span className="gradient-text">grand final</span>.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 relative">
          {/* Connector line — only visible on md+ */}
          <div
            aria-hidden
            className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative bg-white border border-ink-100 rounded-[20px] p-7 shadow-card"
            >
              {/* Numbered circle */}
              <div className="relative inline-flex">
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-cta"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))",
                  }}
                >
                  {step.n}
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-700 shadow-card">
                  <step.icon size={14} />
                </div>
              </div>

              <h3 className="h-card mt-5 text-ink-900">{step.title}</h3>
              <p className="mt-2 text-[14px] text-ink-500 leading-relaxed">
                {step.body}
              </p>

              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-100 text-ink-700 text-[11px] font-bold">
                {step.badge}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
