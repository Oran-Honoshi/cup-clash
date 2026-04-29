"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const NEWS = [
  {
    tag: "Strategy",
    headline: "48 teams changes everything — here's how to predict the chaos",
    body: "The new Round of 32 means more upsets, more 3rd-place drama, and more points on the table. Your scoring strategy needs to adapt.",
    emoji: "🧩",
    color: "#10b981",
    href: "/schedule",
  },
  {
    tag: "Venue",
    headline: "MetLife Stadium: why the Final venue gives the home crowd an edge",
    body: "East Rutherford, New Jersey. 82,500 fans. The largest World Cup Final ever. Here's what the host advantage actually means for the odds.",
    emoji: "🏟️",
    color: "#3b82f6",
    href: "/schedule",
  },
  {
    tag: "Dark horses",
    headline: "5 teams your group hasn't picked to win — but probably should",
    body: "Morocco proved Africa can go deep. Japan is built for knockouts. USA are hosting. The 2026 winner might be in your group chat's blind spot.",
    emoji: "🐎",
    color: "#f59e0b",
    href: "/schedule",
  },
];

export function FeaturedNews() {
  return (
    <section className="py-24 px-5 sm:px-8"
      style={{ background: "rgba(17,29,39,0.3)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12 flex-wrap gap-4"
        >
          <div>
            <div className="label-caps mb-3">Intel</div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase text-white">
              Know more.<br />
              <span style={{ color: "#10b981" }}>Win more.</span>
            </h2>
          </div>
          <a href="/schedule"
            className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-colors hover:text-white"
            style={{ color: "#64748b" }}>
            Full 2026 schedule <ArrowUpRight size={15} />
          </a>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {NEWS.map((item, i) => (
            <motion.a key={item.headline}
              href={item.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col rounded-2xl overflow-hidden border transition-all"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "#111d27",
              }}
            >
              {/* Image placeholder — fan/stadium atmosphere */}
              <div className="h-44 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${item.color}15, rgba(17,29,39,1))` }}>
                <span className="text-7xl opacity-60">{item.emoji}</span>
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 40%, #111d27 100%)" }} />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                {/* Tag */}
                <div className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 self-start"
                  style={{ background: `${item.color}15`, color: item.color }}>
                  {item.tag}
                </div>

                <h3 className="font-display text-lg uppercase text-white leading-tight mb-2 group-hover:text-opacity-90 transition-colors">
                  {item.headline}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#64748b" }}>
                  {item.body}
                </p>

                <div className="flex items-center gap-1 mt-4 text-xs font-bold uppercase tracking-widest transition-colors"
                  style={{ color: item.color }}>
                  Read more <ArrowUpRight size={12} />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
