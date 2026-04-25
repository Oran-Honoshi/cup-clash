"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { CountdownCard } from "@/components/landing/countdown-card";

interface HeroProps {
  matchLabel: string;
  target: Date;
}

export function Hero({ matchLabel, target }: HeroProps) {
  return (
    <section className="blob-bg relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge tone="brand" className="mb-6">
                <Sparkles size={11} />
                Built for the 2026 World Cup
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-display text-[clamp(36px,6vw,64px)] text-ink-900"
            >
              Predict every match.
              <br />
              <span className="gradient-text">Beat your friends.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-ink-500 max-w-xl leading-relaxed"
            >
              Private prediction leagues for your group chat, office, or family.
              Score guesses, top scorers, knockout brackets — all tracked,
              all settled. No spreadsheets. No arguments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                Start a group — free
              </Button>
              <Button size="lg" variant="outline">
                See how it works
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-400"
            >
              <span className="flex items-center gap-1.5">
                <Trophy size={13} className="text-success" />
                Free for groups under 4
              </span>
              <span className="hidden sm:inline">·</span>
              <span>No credit card required</span>
              <span className="hidden sm:inline">·</span>
              <span>Up to 60 players per group</span>
            </motion.div>
          </div>

          {/* Right: countdown card (stadium jewel) */}
          <div className="lg:col-span-5">
            <CountdownCard target={target} matchLabel={matchLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
