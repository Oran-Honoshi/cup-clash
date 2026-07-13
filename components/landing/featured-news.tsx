"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PHOTOS } from "@/lib/assets";

// Three pre-tournament articles. Designed for 3 today, scales to ~5–6 by
// appending rows under the feature card without changing the topology.
const NEWS = [
  {
    tag:      "Strategy",
    headline: "48 teams changes everything. Here's how to predict the chaos.",
    body:     "The new Round of 32 means more upsets, more 3rd-place drama, and more points on the table. Your scoring strategy needs to adapt.",
    readTime: "5 min read",
    href:     "/articles/48-teams-strategy",
    photo:    PHOTOS.stadiumAbove,
  },
  {
    tag:      "Venue",
    headline: "MetLife Stadium: why the Final venue gives the home crowd an edge.",
    body:     "East Rutherford, New Jersey. 82,500 fans. The largest World Cup Final ever. Here's what the host advantage actually means for the chances.",
    readTime: "4 min read",
    href:     "/articles/metlife-stadium-advantage",
    photo:    PHOTOS.trophyPost,
  },
  {
    tag:      "Dark horses",
    headline: "5 teams your group hasn't picked to win, but probably should.",
    body:     "Morocco proved Africa can go deep. Japan is built for knockouts. USA are hosting. The 2026 winner might be in your group chat's blind spot.",
    readTime: "6 min read",
    href:     "/articles/dark-horses-2026",
    photo:    PHOTOS.fansCheering,
  },
] as const;

type Article = (typeof NEWS)[number];

// Glass surface vocabulary (matches Hero/Features after the quieter pass).
const GLASS_SURFACE: React.CSSProperties = {
  background:     "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  border:         "1px solid rgba(255,255,255,0.14)",
  boxShadow:      "0 12px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
};

export function FeaturedNews() {
  const [feature, ...supporting] = NEWS;

  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12 flex-wrap gap-4"
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">
              Intel
            </div>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase text-white leading-[1.05]">
              Know more.<br />
              <span className="text-ac">Win more.</span>
            </h2>
          </div>
          <Link
            href="/schedule"
            className="group flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-white/50
                       hover:text-cyan transition-colors duration-200 rounded-md
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60
                       focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C16]"
          >
            Full 2026 schedule
            <ArrowUpRight size={15} className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        {/* Asymmetric grid: feature 7/12 + supporting list 5/12 */}
        <div className="grid lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="lg:col-span-7"
          >
            <FeatureCard article={feature} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5"
          >
            <SupportingList articles={supporting} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function FeatureCard({ article }: { article: Article }) {
  return (
    <Link
      href={article.href}
      aria-label={`${article.tag}: ${article.headline}`}
      className="group block rounded-2xl overflow-hidden h-full
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60
                 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080C16]"
      style={GLASS_SURFACE}
    >
      <div className="relative h-72 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.photo}
          alt=""
          className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-[500ms] motion-safe:[transition-timing-function:cubic-bezier(.16,1,.3,1)] motion-safe:group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(8,12,22,0) 35%, rgba(18,14,38,0.55) 75%, rgba(18,14,38,0.85) 100%)" }}
        />
        <div className="absolute top-4 left-4">
          <TagChip>{article.tag}</TagChip>
        </div>
      </div>
      <div className="p-6 sm:p-7">
        <h3 className="font-display font-black uppercase text-white leading-tight text-[22px] sm:text-2xl line-clamp-2 mb-3">
          {article.headline}
        </h3>
        <p className="text-[15px] leading-relaxed text-white/65 line-clamp-3 mb-5">
          {article.body}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 font-mono">
            {article.readTime}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan">
            Read
            <ArrowUpRight size={14} className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function SupportingList({ articles }: { articles: Article[] }) {
  return (
    // One glass slab containing N rows. No nested glass; rows are separated by
    // a hairline and a small gap, not by per-row cards.
    <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={GLASS_SURFACE}>
      {articles.map((article, i) => (
        <SupportingRow key={article.href} article={article} isLast={i === articles.length - 1} />
      ))}
    </div>
  );
}

function SupportingRow({ article, isLast }: { article: Article; isLast: boolean }) {
  return (
    <Link
      href={article.href}
      aria-label={`${article.tag}: ${article.headline}`}
      className="group relative flex gap-4 p-5 flex-1
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan/60
                 motion-safe:transition-colors motion-safe:duration-200 hover:bg-white/[0.02]"
      style={!isLast ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : undefined}
    >
      <div className="relative shrink-0 w-[108px] h-[72px] rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.photo}
          alt=""
          className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-[500ms] motion-safe:[transition-timing-function:cubic-bezier(.16,1,.3,1)] motion-safe:group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <TagChip>{article.tag}</TagChip>
          <h3 className="mt-2 font-display font-black uppercase text-white leading-tight text-[15px] line-clamp-2">
            {article.headline}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 font-mono">
            {article.readTime}
          </span>
          <ArrowUpRight
            size={13}
            className="text-cyan motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-full text-cyan"
      style={{
        background: "rgba(0,212,255,0.10)",
        border: "1px solid rgba(0,212,255,0.25)",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </span>
  );
}
