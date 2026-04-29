"use client";

import { motion } from "framer-motion";
import { Trophy, Brain, BarChart2, Target, Users, Zap, Globe, Download, Ban } from "lucide-react";

// Gemini copy — exact descriptions
const FEATURES = [
  { icon: Target,    title: "Score Predictions",  body: "Lock in your exact score guesses for all 104 matches with automated deadline enforcement.",                                                          color: "#10b981", badge: "Core"           },
  { icon: Trophy,    title: "Live Leaderboard",    body: "Watch the ranks shift in real-time as goals hit the net from Vancouver to Miami.",                                                                   color: "#f59e0b", badge: "Live"           },
  { icon: Brain,     title: "Trivia Challenge",    body: "Earn bonus tie-breaker points with a 7-second pressure-cooker round on World Cup history.",                                                          color: "#8b5cf6", badge: "Bonus"          },
  { icon: BarChart2, title: "Tournament Picks",    body: "Predict the Champion, Golden Boot, and Golden Glove before the opening whistle in Mexico City.",                                                     color: "#3b82f6", badge: "Pre-tournament" },
  { icon: Globe,     title: "Full Bracket",        body: "Visualize the road to MetLife with a dynamic Round of 32-to-Final knockout bracket.",                                                                color: "#ec4899", badge: "Visual"         },
  { icon: Users,     title: "Multiple Groups",     body: "Dominate the office, the family, and the bar squad simultaneously from one unified dashboard.",                                                      color: "#10b981", badge: "Multi-group"   },
  { icon: Zap,       title: "Single Match Bets",   body: "Want to go all-in on USA vs. England? Create micro-groups for the tournament's biggest individual clashes.",                                         color: "#f59e0b", badge: "Flexible"       },
  { icon: Download,  title: "Winner Poster",       body: "Generate a branded, high-res victory card to humiliate your friends on social media once you've claimed the crown.",                                  color: "#E61D25", badge: "End game"       },
  { icon: Ban,       title: "Ad-Free",             body: "No banners, no pop-ups, no trackers — just the beautiful game and your beautiful lead.",                                                              color: "#64748b", badge: "Always"        },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8" style={{ background: "rgba(17,29,39,0.3)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="label-caps mb-3">Everything you need</div>
          {/* Gemini header + sub-header */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase text-white">
            Built for the Stadium.<br />
            <span style={{ color: "#10b981" }}>Designed for the Winner.</span>
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            Everything you need to manage the chaos of a 48-team tournament without breaking a sweat.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl p-5 transition-all hover:-translate-y-1 cursor-default"
              style={{ background: "#111d27", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `0 0 30px ${f.color}20`, border: `1px solid ${f.color}25` }} />
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4"
                style={{ background: `${f.color}15`, color: f.color }}>{f.badge}</div>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}15` }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="font-display text-lg uppercase text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
