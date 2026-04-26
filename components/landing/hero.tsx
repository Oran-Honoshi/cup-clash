"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { CountdownCard } from "@/components/landing/countdown-card";
import { COUNTRIES, HOST_NATIONS, flagUrl } from "@/lib/countries";

interface HeroProps {
  matchLabel: string;
  target: Date;
}

export function Hero({ matchLabel, target }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Badge tone="accent" className="scanline">
                <Sparkles size={11} />
                Built for the 2026 World Cup
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display uppercase text-white text-[clamp(48px,8vw,96px)] leading-[0.85] tracking-tight"
            >
              Predict every match.
              <br />
              <span className="gradient-text">Beat your friends.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-pitch-300 max-w-xl leading-relaxed"
            >
              Private prediction leagues for your group chat, office, or family.
              Score guesses, top scorers, knockout brackets — all tracked,
              all settled. No spreadsheets. No arguments.
            </motion.p>

            {/* Host nations */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 flex items-center gap-3"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-pitch-400">
                Hosted by
              </span>
              <div className="flex items-center gap-2">
                {HOST_NATIONS.map((code) => {
                  const c = COUNTRIES[code];
                  return (
                    <div
                      key={code}
                      className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5"
                    >
                      <div className="relative w-6 h-4 rounded-sm overflow-hidden shadow-sm shrink-0">
                        <Image
                          src={flagUrl(c.flagCode, 40)}
                          alt={c.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-xs font-bold text-pitch-200 uppercase tracking-wider">
                        {c.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

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
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-pitch-400"
            >
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-success" />
                Free for groups under 4
              </span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>No credit card</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>48 teams · 104 matches</span>
            </motion.div>
          </div>

          {/* Right: countdown card */}
          <div className="lg:col-span-5">
            <CountdownCard target={target} matchLabel={matchLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
