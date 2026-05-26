"use client";

import { motion } from "framer-motion";

const STATS = [
  { number: "48",   label: "Teams",         color: "#00FF88" },
  { number: "104",  label: "Matches",       color: "#00D4FF" },
  { number: "16",   label: "Host Cities",   color: "#8B5CF6" },
  { number: "$0",   label: "For Employees", color: "#fbbf24" },
];

export function StatsStrip() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "40px 0",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center justify-center py-6 lg:py-0 relative"
            >
              {i > 0 && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block"
                  style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)" }}
                />
              )}
              {i > 0 && i % 2 === 0 && (
                <div
                  className="absolute left-0 top-0 lg:hidden"
                  style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.1)" }}
                />
              )}
              <div
                style={{
                  fontFamily: "var(--font-display, 'Anton', sans-serif)",
                  fontSize: "clamp(40px, 5vw, 64px)",
                  fontWeight: 800,
                  color: stat.color,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.number}
              </div>
              <div
                className="mt-2 text-center"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}