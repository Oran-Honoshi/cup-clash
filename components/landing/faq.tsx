"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does the tie-breaker work if two players have the same points?",
    a: "Three tiers. First: most exact scores (getting 2-1 right beats getting the winner right). Second: the 'Final Goal Minute' — before the tournament starts, everyone predicts the minute of the first goal in the Final. Closest guess wins. Third: whoever correctly predicted the tournament winner. If still tied, the admin can split the pot — the UI supports dual 1st place.",
  },
  {
    q: "You handle prize money?",
    a: "No — and that's intentional. Cup Clash tracks who has paid their buy-in and calculates exactly who gets what based on your payout splits. But the actual money stays between you and your group. This keeps us out of gambling regulation territory and keeps things simple. The admin marks payments as 'paid' manually, then settles up however your group prefers.",
  },
  {
    q: "When do predictions lock? Can I change my guess after submitting?",
    a: "Match predictions lock automatically 5 minutes before kickoff — no exceptions. Tournament-level picks (winner, top scorer, top assister, Golden Ball, etc.) lock before the very first match on June 11. Once locked, predictions are final. This prevents anyone from changing their guess after seeing the team lineups or injury news.",
  },
  {
    q: "What's the World Cup 2026 format and why does it matter for my group?",
    a: "2026 is the first 48-team World Cup — 12 groups of 4 teams, 104 matches total. The top 2 from each group plus the 8 best 3rd-place teams advance to a new Round of 32. This means more matches, more predictions, more drama, and a larger prize pot opportunity for your group. Cup Clash handles all 104 matches automatically.",
  },
  {
    q: "Can I be in multiple groups at the same time?",
    a: "Yes. You might be in your office group, your family group, and a single-match group for the Final — all simultaneously. Your 'My Groups' dashboard shows your rank and estimated winnings across all of them, with an aggregated 'Show Me The Money' total. Tournament picks (winner, scorer etc.) can be applied to all groups at once or set individually per group.",
  },
  {
    q: "What's a single-match group?",
    a: "A lightweight group for just one specific match — great for the Final, a Semi-Final, or your national team's opener. Same leaderboard and buy-in mechanics, but scoped to one game. You can also enable extra predictions: yellow cards, red cards, corners, whether it goes to extra time or penalties. Admin chooses which extras to include when creating the group.",
  },
  {
    q: "What is the trivia challenge and can I skip it?",
    a: "The trivia challenge is 20 World Cup questions with a 7-second timer per question. If your admin enables it as a bonus, correct answers earn up to 20 extra points — one shot only. After completing the points round, you can play the remaining questions for fun (pausable, no effect on scores). If your admin doesn't enable trivia, it's available as a standalone free-play mode.",
  },
  {
    q: "Is Cup Clash really ad-free?",
    a: "Completely. We don't show ads, we don't let advertisers promote products to our users, and we don't sell your data. Cup Clash is a paid product — your subscription is the business model. We built it this way deliberately so the experience feels like a product you paid for, not a free service you're paying for with your attention.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="label-caps mb-3">FAQ</div>
          <h2 className="font-display text-4xl sm:text-5xl uppercase text-white">
            Good questions.<br />
            <span style={{ color: "#10b981" }}>Straight answers.</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl overflow-hidden border transition-all"
              style={{
                borderColor: open === i ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)",
                background: open === i ? "rgba(16,185,129,0.04)" : "#111d27",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className={cn("text-sm font-bold leading-relaxed",
                  open === i ? "text-white" : "text-pitch-200")}>
                  {faq.q}
                </span>
                <ChevronDown size={18}
                  className={cn("shrink-0 transition-transform", open === i && "rotate-180")}
                  style={{ color: open === i ? "#10b981" : "#64748b" }}
                />
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 text-sm leading-relaxed border-t"
                      style={{ color: "#94a3b8", borderColor: "rgba(16,185,129,0.1)" }}>
                      <div className="pt-4">{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
