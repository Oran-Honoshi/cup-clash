"use client";

import { motion } from "framer-motion";
import { BarChart2, Brain, Globe, Target, Trophy, Users } from "lucide-react";

// Two-channel palette only (DESIGN.md Three-Channel Rule):
//   mint = the user's actions / wins / picks
//   cyan = live, info, tournament-wide
const MINT = { accentColor: "#00FF88", bg: "rgba(0,255,136,0.10)", border: "rgba(0,255,136,0.25)" };
const CYAN = { accentColor: "#00D4FF", bg: "rgba(0,212,255,0.10)", border: "rgba(0,212,255,0.25)" };

const FEATURES = [
  { icon: Target,    ...MINT, title: "Score Predictions", body: "Lock in your exact score guesses for all 104 matches with automated deadline enforcement 5 min before kickoff." },
  { icon: Trophy,    ...CYAN, title: "Live Leaderboard",  body: "Ranks shift in real-time as goals hit the net from Vancouver to Miami." },
  { icon: BarChart2, ...MINT, title: "Tournament Picks",  body: "Predict Champion, Golden Boot and Golden Ball before the opening whistle in Mexico City." },
  { icon: Globe,     ...CYAN, title: "Full Bracket",      body: "Dynamic Round of 16 → Final knockout tree, updated live as games conclude." },
  { icon: Users,     ...MINT, title: "Multiple Groups",   body: "Dominate the office, family and bar squad simultaneously from one unified dashboard." },
  { icon: Brain,     ...CYAN, title: "Trivia Challenge",  body: "Tie-breaker bonus points via a 7-second pressure-cooker round on World Cup history." },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">Everything you need</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase text-white">
            Built for the stadium.<br />
            <span className="text-ac">Designed for winners.</span>
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-white/60">
            Manage the chaos of a 48-team tournament without breaking a sweat.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-1"
              style={{
                background: "rgba(18,14,38,0.32)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
              <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                <f.icon size={20} style={{ color: f.accentColor }} />
              </div>
              <h3 className="font-display text-lg uppercase mb-2 text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-white/62">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}