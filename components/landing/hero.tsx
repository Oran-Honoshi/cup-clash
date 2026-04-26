"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { CountdownCard } from "@/components/landing/countdown-card";
import { WCTrophy } from "@/components/landing/trophy";
import { COUNTRIES, HOST_NATIONS, flagUrl } from "@/lib/countries";

interface HeroProps {
  matchLabel: string;
  target: Date;
}

export function Hero({ matchLabel, target }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Trophy watermark — decorative, behind content */}
      <div
        className="absolute right-0 top-0 bottom-0 pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        <div className="relative h-full flex items-center">
          <div style={{ opacity: 0.06, transform: "scale(1.4) translateX(20%)" }}>
            <WCTrophy size={420} />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8" style={{ zIndex: 1 }}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5"
            >
              <Badge tone="accent" className="scanline">
                <Sparkles size={11} />
                FIFA World Cup 2026
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display uppercase text-white leading-[0.85] tracking-tight"
              style={{ fontSize: "clamp(44px, 7vw, 88px)" }}
            >
              Predict every
              <br />
              match.
              <br />
              <span className="gradient-text">Beat your</span>
              <br />
              <span className="gradient-text">friends.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-pitch-300 max-w-lg leading-relaxed"
            >
              Private prediction leagues for your group chat, office, or family.
              Score guesses, knockout brackets, top scorers — all tracked and settled.
            </motion.p>

            {/* Host nations */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-5 flex items-center gap-3 flex-wrap"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-pitch-500">
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
                      <div className="relative w-5 h-3.5 rounded-sm overflow-hidden shadow-sm shrink-0">
                        <Image
                          src={flagUrl(c.flagCode, 40)}
                          alt={c.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-[11px] font-bold text-pitch-200 uppercase tracking-wider">
                        {c.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/signup">
                <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                  Start a group — free
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Preview the app
                </Button>
              </Link>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-widest text-pitch-500"
            >
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-success" />
                Free under 4 players
              </span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>No credit card</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>48 teams · 104 matches</span>
            </motion.div>
          </div>

          {/* ── MIDDLE: Trophy ── */}
          <div className="hidden lg:flex lg:col-span-2 justify-center items-center">
            <WCTrophy size={200} />
          </div>

          {/* ── RIGHT: Countdown card ── */}
          <div className="lg:col-span-4">
            <CountdownCard target={target} matchLabel={matchLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
