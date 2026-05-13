"use client";

import { motion } from "framer-motion";
import { Check, X, Ban, CreditCard, Shield, Zap, Users } from "lucide-react";
import Link from "next/link";

const SOLO_FREE = [
  { text: "Predict all 104 World Cup matches",   yes: true  },
  { text: "Compete vs The Expert (global avg)",  yes: true  },
  { text: "Full scoring rules customization",    yes: true  },
  { text: "Live match schedule & standings",     yes: true  },
  { text: "Mobile PWA — no download needed",     yes: true  },
  { text: "Group chat",                          yes: false },
  { text: "Trivia challenge",                    yes: false },
  { text: "Invite friends & group leaderboard",  yes: false },
  { text: "Prize pot & buy-in tracker",          yes: false },
];

const GROUP_PAID = [
  { text: "Everything in free, plus:",           yes: true,  highlight: true },
  { text: "Invite friends via passkey",          yes: true  },
  { text: "Private group leaderboard",           yes: true  },
  { text: "Group chat with GIFs",                yes: true  },
  { text: "Trivia challenge",                    yes: true  },
  { text: "Prize pot & buy-in tracker",          yes: true  },
  { text: "Push notifications for goals",        yes: true  },
  { text: "Tournament picks (winner, scorer…)",  yes: true  },
  { text: "Admin panel & pick overrides",        yes: true  },
];

const FOOTNOTES = [
  { Icon: Ban,        text: "No ads. No subscriptions. Ever."                },
  { Icon: CreditCard, text: "One $2 payment. Whole tournament. No surprises." },
  { Icon: Shield,     text: "7-day refund if your group doesn't go ahead."   },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 sm:px-8" style={{ background: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <div className="label-caps mb-3">Pricing</div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase" style={{ color: "#0F172A" }}>
            Start solo, free.<br />
            <span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Go group for $2.
            </span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Play alone against the global average for free, or invite your squad for $2 each.
            Admins are <strong style={{ color: "#0F172A" }}>always free</strong> — you run the show, your friends pay to play.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">

          {/* Solo — Free */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 flex flex-col"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid #e2e8f0" }}>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 self-start"
              style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2", border: "1px solid rgba(0,212,255,0.2)" }}>
              <Zap size={11} /> Solo Player
            </div>
            <div className="font-display text-5xl font-black mb-1" style={{ color: "#0F172A" }}>Free</div>
            <div className="text-sm mb-5" style={{ color: "#64748b" }}>Play solo. Beat the global average. Forever free.</div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {SOLO_FREE.map(f => (
                <li key={f.text} className="flex items-center gap-2.5 text-sm">
                  {f.yes
                    ? <Check size={14} style={{ color: "#0891B2" }} className="shrink-0" />
                    : <X size={14} style={{ color: "#cbd5e1" }} className="shrink-0" />}
                  <span style={{
                    color: f.yes ? "#475569" : "#cbd5e1",
                    textDecoration: f.yes ? "none" : "line-through",
                  }}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{ border: "1px solid rgba(0,212,255,0.25)", color: "#0891B2", background: "rgba(0,212,255,0.05)" }}>
                Start predicting free
              </button>
            </Link>
            <p className="text-center text-xs mt-2" style={{ color: "#94a3b8" }}>
              No credit card. No friends required.
            </p>
          </motion.div>

          {/* Group — $2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="relative rounded-2xl p-6 overflow-hidden flex flex-col"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.3)", boxShadow: "0 8px 32px rgba(0,212,255,0.10)" }}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
            <div className="absolute top-0 right-6 px-3 py-1 rounded-b-xl text-[10px] font-black uppercase tracking-widest"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              Most popular
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 self-start"
              style={{ background: "rgba(0,255,136,0.08)", color: "#059669", border: "1px solid rgba(0,255,136,0.2)" }}>
              <Users size={11} /> Group Play
            </div>
            <div className="flex items-end gap-2 mb-1">
              <div className="font-display text-5xl font-black" style={{ color: "#0F172A" }}>$2</div>
              <div className="text-sm pb-1.5" style={{ color: "#94a3b8" }}>per member · one-time</div>
            </div>
            <div className="text-sm mb-5" style={{ color: "#64748b" }}>Full access. June 11 – July 19. All 104 matches.</div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {GROUP_PAID.map(f => (
                <li key={f.text} className="flex items-center gap-2.5 text-sm">
                  {"highlight" in f && f.highlight
                    ? <span className="w-3.5 shrink-0" />
                    : <Check size={14} style={{ color: "#00c46a" }} className="shrink-0" />}
                  <span style={{
                    color: "highlight" in f && f.highlight ? "#059669" : "#475569",
                    fontWeight: "highlight" in f && f.highlight ? "700" : "400",
                    fontStyle: "highlight" in f && f.highlight ? "italic" : "normal",
                  }}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link href="/join/enter">
              <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                Join a group — $2
              </button>
            </Link>
            <div className="text-xs text-center mt-2 py-1.5 rounded-lg"
              style={{ background: "rgba(0,255,136,0.06)", color: "#059669" }}>
              Paid when joining via invite link or passkey
            </div>
          </motion.div>
        </div>

        {/* Admin callout */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl p-5 mb-8 flex items-center gap-4 max-w-3xl mx-auto"
          style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <Zap size={18} style={{ color: "#0891B2" }} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm" style={{ color: "#0F172A" }}>
              Group admins are always free — no exceptions
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              Create your group, set the rules, manage members and track the prize pot. You pay $0.
              Your friends pay $2 each. You run the show.
            </div>
          </div>
          <Link href="/signup" className="shrink-0">
            <button className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              Create free →
            </button>
          </Link>
        </motion.div>

        {/* Flow */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl p-5 mb-8 max-w-3xl mx-auto"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,212,255,0.12)" }}>
          <div className="flex items-center justify-center gap-2 flex-wrap text-sm font-bold" style={{ color: "#0F172A" }}>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2" }}>1. Admin creates group free</span>
            <span style={{ color: "#cbd5e1" }}>→</span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,212,255,0.08)", color: "#0891B2" }}>2. Shares passkey</span>
            <span style={{ color: "#cbd5e1" }}>→</span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,255,136,0.08)", color: "#059669" }}>3. Members pay $2</span>
            <span style={{ color: "#cbd5e1" }}>→</span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "rgba(0,255,136,0.08)", color: "#059669" }}>4. Everyone predicts</span>
          </div>
        </motion.div>

        {/* Math example */}
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <p className="text-sm font-bold" style={{ color: "#0F172A" }}>
            10 friends × $2 = $20 pot. Winner takes $12. Runner-up gets $6. Third gets $2 back.
          </p>
          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
            Cup Clash keeps $0 from the prize pot. The $2 is platform access only. Money stays between friends.
          </p>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-4 text-center text-sm max-w-3xl mx-auto" style={{ color: "#64748b" }}>
          {FOOTNOTES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2">
              <Icon size={15} style={{ color: "#0891B2" }} />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}