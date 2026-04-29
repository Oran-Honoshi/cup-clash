"use client";

import { motion } from "framer-motion";
import { Trophy, Brain, BarChart2, Target, Users, Zap, Globe, Download, Ban } from "lucide-react";

const FEATURES = [
  { icon: Target,    title: "Score Predictions",  body: "Lock in your exact score guesses for all 104 matches with automated deadline enforcement.",                             accentColor: "#00FF88", bg: "rgba(0,255,136,0.07)",  border: "rgba(0,255,136,0.2)"  },
  { icon: Trophy,    title: "Live Leaderboard",    body: "Watch the ranks shift in real-time as goals hit the net from Vancouver to Miami.",                                       accentColor: "#d97706", bg: "rgba(217,119,6,0.07)",  border: "rgba(217,119,6,0.2)"  },
  { icon: Brain,     title: "Trivia Challenge",    body: "Earn bonus tie-breaker points with a 7-second pressure-cooker round on World Cup history.",                             accentColor: "#8b5cf6", bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.2)" },
  { icon: BarChart2, title: "Tournament Picks",    body: "Predict the Champion, Golden Boot, and Golden Glove before the opening whistle in Mexico City.",                        accentColor: "#00D4FF", bg: "rgba(0,212,255,0.07)",  border: "rgba(0,212,255,0.2)"  },
  { icon: Globe,     title: "Full Bracket",        body: "Visualize the road to MetLife with a dynamic Round of 32-to-Final knockout bracket.",                                   accentColor: "#ec4899", bg: "rgba(236,72,153,0.07)", border: "rgba(236,72,153,0.2)" },
  { icon: Users,     title: "Multiple Groups",     body: "Dominate the office, the family, and the bar squad simultaneously from one unified dashboard.",                          accentColor: "#00FF88", bg: "rgba(0,255,136,0.07)",  border: "rgba(0,255,136,0.2)"  },
  { icon: Zap,       title: "Single Match Bets",   body: "Want to go all-in on USA vs. England? Create micro-groups for the tournament's biggest individual clashes.",            accentColor: "#d97706", bg: "rgba(217,119,6,0.07)",  border: "rgba(217,119,6,0.2)"  },
  { icon: Download,  title: "Winner Poster",       body: "Generate a branded, high-res victory card to humiliate your friends on social media once you've claimed the crown.",    accentColor: "#00D4FF", bg: "rgba(0,212,255,0.07)",  border: "rgba(0,212,255,0.2)"  },
  { icon: Ban,       title: "Ad-Free",             body: "No banners, no pop-ups, no trackers — just the beautiful game and your beautiful lead.",                               accentColor: "#475569", bg: "rgba(71,85,105,0.05)",  border: "rgba(71,85,105,0.15)" },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8"
      style={{ background: "linear-gradient(180deg, #F8FAFC 0%, rgba(0,212,255,0.03) 100%)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="label-caps mb-3">Everything you need</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase" style={{ color: "#0B141B" }}>
            Built for the Stadium.<br />
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Designed for the Winner.
            </span>
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "#64748b" }}>
            Everything you need to manage the chaos of a 48-team tournament without breaking a sweat.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl p-5 transition-all hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.80)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${f.border}`,
                boxShadow: `0 4px 20px ${f.bg}`,
              }}
            >
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                <f.icon size={20} style={{ color: f.accentColor }} />
              </div>
              <h3 className="font-display text-lg uppercase mb-2" style={{ color: "#0B141B" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Ad-free banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 rounded-2xl p-6 flex items-center justify-between gap-6 flex-wrap"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,212,255,0.2)",
            boxShadow: "0 4px 24px rgba(0,212,255,0.06)",
          }}>
          <div className="flex items-center gap-4">
            <Ban size={28} style={{ color: "#00D4FF" }} />
            <div>
              <div className="font-display text-xl uppercase" style={{ color: "#0B141B" }}>100% Ad-Free</div>
              <div className="text-sm" style={{ color: "#64748b" }}>
                Cup Clash is a space to compete, not a place for advertisers. No ads. No pop-ups. No trackers.
              </div>
            </div>
          </div>
          <div className="text-sm font-bold" style={{ color: "#00D4FF" }}>Always. Forever. ✓</div>
        </motion.div>
      </div>
    </section>
  );
}
