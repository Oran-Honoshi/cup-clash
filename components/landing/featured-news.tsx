"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PHOTOS } from "@/lib/assets";

const NEWS = [
  {
    tag: "Strategy",
    headline: "48 teams changes everything — here's how to predict the chaos",
    body: "The new Round of 32 means more upsets, more 3rd-place drama, and more points on the table. Your scoring strategy needs to adapt.",
    color: "#00FF88",
    href: "/schedule",
    photo: PHOTOS.stadiumAbove,
  },
  {
    tag: "Venue",
    headline: "MetLife Stadium: why the Final venue gives the home crowd an edge",
    body: "East Rutherford, New Jersey. 82,500 fans. The largest World Cup Final ever. Here's what the host advantage actually means for the odds.",
    color: "#00D4FF",
    href: "/schedule",
    photo: PHOTOS.trophyPost,
  },
  {
    tag: "Dark horses",
    headline: "5 teams your group hasn't picked to win — but probably should",
    body: "Morocco proved Africa can go deep. Japan is built for knockouts. USA are hosting. The 2026 winner might be in your group chat's blind spot.",
    color: "#d97706",
    href: "/schedule",
    photo: PHOTOS.fansCheering,
  },
];

export function FeaturedNews() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ background:"rgba(0,212,255,0.02)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="label-caps mb-3">Intel</div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase" style={{ color:"#0F172A" }}>
              Know more.<br />
              <span style={{ background:"linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Win more.
              </span>
            </h2>
          </div>
          <a href="/schedule" className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-colors"
            style={{ color:"#94a3b8" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00D4FF")}
            onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
            Full 2026 schedule <ArrowUpRight size={15} />
          </a>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {NEWS.map((item, i) => (
            <motion.a key={item.headline} href={item.href}
              initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
              whileHover={{ y:-4 }}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all"
              style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(16px)", border:"1px solid rgba(0,212,255,0.12)", boxShadow:"0 4px 16px rgba(0,212,255,0.06)" }}>

              {/* Real photo with white fade */}
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.photo} alt={item.headline}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {/* White fade from bottom */}
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.95) 100%)",
                }} />
                {/* Tag badge */}
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                    style={{ background:`${item.color}18`, color:item.color, border:`1px solid ${item.color}30`, backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", backgroundColor:"rgba(255,255,255,0.8)" }}>
                    {item.tag}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col -mt-2">
                <h3 className="font-display text-lg uppercase mb-2 leading-tight" style={{ color:"#0F172A" }}>
                  {item.headline}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color:"#64748b" }}>{item.body}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-bold uppercase tracking-widest transition-colors"
                  style={{ color:item.color }}>
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
