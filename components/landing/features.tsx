"use client";

import { motion } from "framer-motion";
import {
  Target,
  Users,
  Trophy,
  Lock,
  Wallet,
  LineChart,
} from "lucide-react";
import { Card, IconBox } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Target,
    title: "Hybrid scoring",
    body: "10 points for outcome, 25 for exact score, bonuses for top scorer and knockout picks. Tuned for 60-person groups where ties get ugly.",
  },
  {
    icon: Lock,
    title: "Auto-locking bets",
    body: "Match guesses freeze 5 minutes before kickoff. Tournament bets lock at the opening match. No late edits, no disputes.",
  },
  {
    icon: Users,
    title: "Private groups",
    body: "Generate an invite link, share it in your group chat, and you're done. No public leaderboards, no strangers.",
  },
  {
    icon: Wallet,
    title: "Buy-in tracker",
    body: "Set your group's entry fee. The admin marks who paid, the app calculates the pot, you split it however you want.",
  },
  {
    icon: LineChart,
    title: "Live leaderboards",
    body: "Watch yourself climb (or crash) as results roll in. Tap any player to see exactly how they got their points.",
  },
  {
    icon: Trophy,
    title: "Tournament-aware",
    body: "Group stage, Round of 16, quarters, semis, final — each phase opens new prediction slots when teams are confirmed.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="label-caps mb-4">Why Cup Clash</div>
          <h2 className="font-display text-4xl sm:text-6xl uppercase text-white leading-[0.95] tracking-tight">
            Built for the way friends
            <br />
            <span className="gradient-text-accent">actually bet on football.</span>
          </h2>
          <p className="mt-6 text-lg text-pitch-300">
            Not a sportsbook. Not a spreadsheet. A simple, social way to make
            every match feel like the final.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card variant="glass" interactive className="p-6 h-full">
                <IconBox icon={<f.icon size={22} />} tone="accent" size="lg" />
                <h3 className="font-display text-2xl uppercase tracking-tight mt-5 text-white">
                  {f.title}
                </h3>
                <p className="mt-3 text-[14px] text-pitch-300 leading-relaxed">
                  {f.body}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
