"use client";

import { motion } from "framer-motion";
import { Trophy, Brain, BarChart2, Target, Users, Zap, Globe, Download } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Score Predictions",
    body: "Predict every match score before kickoff. 3 pts for exact, 2 for correct team + goals, 1 for correct outcome. Auto-locks 5 min before kickoff.",
    color: "#10b981",
    badge: "Core",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    body: "Real-time rankings that update the moment a goal goes in. Gold, silver, bronze medals. Point history drawer for every member.",
    color: "#f59e0b",
    badge: "Live",
  },
  {
    icon: Brain,
    title: "Trivia Challenge",
    body: "20 World Cup questions, 7 seconds each. One shot at 20 bonus points. Trivia Champion badge awarded to the fastest, smartest fan.",
    color: "#8b5cf6",
    badge: "Bonus",
  },
  {
    icon: BarChart2,
    title: "Tournament Picks",
    body: "Pick the winner, 2nd, 3rd, best 3rd-place qualifiers, top scorer, top assister, Golden Ball, Golden Glove — all before June 11.",
    color: "#3b82f6",
    badge: "Pre-tournament",
  },
  {
    icon: Globe,
    title: "48-Team Bracket",
    body: "Full knockout bracket from R32 to the Final. Follow every elimination in real-time as teams qualify from the group stage.",
    color: "#ec4899",
    badge: "Visual",
  },
  {
    icon: Users,
    title: "Multiple Groups",
    body: "Be in your office group AND your friends group AND a family group. All your rankings and winnings aggregated in one \"Show Me The Money\" dashboard.",
    color: "#10b981",
    badge: "Multi-group",
  },
  {
    icon: Zap,
    title: "Single Match Bets",
    body: "Just here for the Final? Create a group for one specific match. Add yellow cards, corners, extra time, and penalties as extra predictions.",
    color: "#f59e0b",
    badge: "Flexible",
  },
  {
    icon: Download,
    title: "Winner Poster",
    body: "When the tournament ends, download a branded Cup Clash poster with your winner's avatar and the full leaderboard. Print it. Frame it. Live the glory.",
    color: "#E61D25",
    badge: "End game",
  },
];

export function Features() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ background: "rgba(17,29,39,0.3)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="label-caps mb-3">Everything you need</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase text-white">
            Built for fans,<br />
            <span style={{ color: "#10b981" }}>by fans.</span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
            Every feature designed around the way real groups actually watch football together.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl p-5 transition-all hover:-translate-y-1 cursor-default"
              style={{ background: "#111d27", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `0 0 30px ${f.color}25`, border: `1px solid ${f.color}30` }} />

              {/* Badge */}
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4"
                style={{ background: `${f.color}15`, color: f.color }}>
                {f.badge}
              </div>

              {/* Icon */}
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}15` }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>

              <h3 className="font-display text-lg uppercase text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.body}</p>
            </motion.div>
          ))}
        </div>

        {/* No ads banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl p-6 flex items-center justify-between gap-6 flex-wrap"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🚫</span>
            <div>
              <div className="font-display text-xl uppercase text-white">100% Ad-Free</div>
              <div className="text-sm" style={{ color: "#94a3b8" }}>
                Cup Clash is a space to compete, not a place for advertisers.
                No ads. No promoted content. No distractions.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#10b981" }}>
            Always. Forever. ✓
          </div>
        </motion.div>
      </div>
    </section>
  );
}
