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
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="label-caps mb-4">How it works</div>
          <h2 className="font-display text-4xl sm:text-6xl uppercase text-white leading-[0.95] tracking-tight">
            From group chat to <span className="gradient-text">grand final</span>.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 relative">
          {/* Connector line */}
          <div
            aria-hidden
            className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgb(var(--accent) / 0.3), transparent)",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass relative rounded-2xl p-7"
            >
              {/* Numbered circle */}
              <div className="relative inline-flex">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-white font-display font-bold text-3xl"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--brand-2)))",
                    boxShadow:
                      "0 0 0 1px rgb(var(--accent) / 0.5), 0 12px 32px rgb(var(--accent) / 0.4)",
                  }}
                >
                  {step.n}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "rgb(15 23 42)",
                    border: "1px solid rgb(var(--accent) / 0.4)",
                    color: "rgb(var(--accent-glow))",
                  }}
                >
                  <step.icon size={14} />
                </div>
              </div>

              <h3 className="font-display text-2xl uppercase tracking-tight mt-6 text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] text-pitch-300 leading-relaxed">
                {step.body}
              </p>

              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-pitch-200 text-[10px] font-bold uppercase tracking-widest">
                {step.badge}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
