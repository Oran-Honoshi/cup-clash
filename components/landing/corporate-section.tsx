"use client";

import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
const BULLETS = [
  {
    title: "Zero friction for employees",
    body: "One link, one tap. No payment, no app downloads.",
  },
  {
    title: "Branded for your company",
    body: "Group name, custom rewards. Made to feel like yours.",
  },
  {
    title: "Admin tools that don't suck",
    body: "Member tracking, nudge reminders, payout management.",
  },
  {
    title: "IT-friendly invoicing",
    body: "PayPal Business invoices. SSO available on Enterprise.",
  },
];

const PHONE_STYLE = {
  width: 200,
  height: 400,
  borderRadius: 34,
  border: "8px solid rgba(255,255,255,0.15)",
  background: "#0a0810",
  overflow: "hidden",
  boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
} as const;

const NOTCH_STYLE = {
  width: 80,
  height: 6,
  background: "rgba(255,255,255,0.15)",
  borderRadius: 3,
  margin: "12px auto",
} as const;

function LeaderboardPhone() {
  return (
    <div style={PHONE_STYLE}>
      <div style={NOTCH_STYLE} />
      <div style={{ padding: "0 14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.12em" }}>Cup Clash</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>Tech Titans</div>
        <div style={{ fontSize: 8, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Leaderboard</div>
        {[
          { rank: 1, name: "Amit",  pts: 145, gold: true,  me: false },
          { rank: 2, name: "Sarah", pts: 130, gold: false, me: false },
          { rank: 3, name: "You",   pts: 110, gold: false, me: true  },
        ].map((p) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 7px", borderRadius: 8, background: p.me ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.03)", border: p.me ? "1px solid rgba(0,255,136,0.18)" : "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, width: 14, color: p.gold ? "#fbbf24" : p.me ? "#00FF88" : "rgba(255,255,255,0.35)" }}>{p.rank}</span>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#00D4FF,#00FF88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#050e08" }}>{p.name[0]}</div>
            <span style={{ fontSize: 10, fontWeight: 600, flex: 1, color: "white" }}>{p.name}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: p.gold ? "#fbbf24" : p.me ? "#00FF88" : "rgba(255,255,255,0.5)" }}>{p.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotifPhone() {
  const notifs = [
    { color: "#00FF88", bg: "rgba(0,255,136,0.12)", icon: "⚡", title: "Nailed it",       sub: "Exact score: ARG 2–1 FRA" },
    { color: "#00D4FF", bg: "rgba(0,212,255,0.12)", icon: "↑", title: "You moved to #3", sub: "Sarah dropped 2 spots" },
    { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", icon: "★", title: "Achievement", sub: "5 exact scores in a row" },
  ];

  return (
    <div style={PHONE_STYLE}>
      <div style={NOTCH_STYLE} />
      <div style={{ padding: "0 14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.12em" }}>Cup Clash</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>Notifications</div>
        {notifs.map((n) => (
          <div key={n.title} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 9px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: n.color }}>{n.icon}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "white", marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{n.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CorporateSection() {
  return (
    <section
      id="for-companies"
      className="py-24 px-5 sm:px-8"
      style={{ background: "#050810" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Label */}
            <div className="flex items-center gap-2 mb-5">
              <Building2 size={13} style={{ color: "#00D4FF" }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#00D4FF",
                }}
              >
                For HR, People Ops &amp; Office Managers
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-display font-black text-white mb-5"
              style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.1 }}
            >
              Sponsor your whole company team.{" "}
              <span style={{ color: "#00FF88" }}>From $75.</span>
            </h2>

            {/* Body */}
            <p className="mb-8 leading-relaxed" style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
              Replace the awkward Slack thread with something everyone actually shows up for.
              One flat fee covers your entire team. Employees join free, no checkout friction, no IT tickets.
            </p>

            {/* Bullets */}
            <div className="flex flex-col gap-4 mb-10">
              {BULLETS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}
                  >
                    ✓
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{b.title}</div>
                    <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{b.body}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/dashboard?action=corporate">
              <button
                className="flex items-center gap-2 font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B",
                  borderRadius: 12,
                  padding: "16px 32px",
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: "0 8px 30px rgba(0,255,136,0.3)",
                }}
              >
                Sponsor your office · from $75
                <ArrowRight size={16} />
              </button>
            </Link>
          </motion.div>

          {/* RIGHT COLUMN: Phone mockups */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center"
            style={{ position: "relative", minHeight: 500 }}
          >
            {/* Back phone (leaderboard) */}
            <div style={{ position: "absolute", right: 0, top: 0, transform: "rotate(-6deg) translateX(30px) translateY(-20px)", zIndex: 1 }}>
              <LeaderboardPhone />
            </div>

            {/* Front phone (notifications) */}
            <div style={{ position: "relative", transform: "rotate(4deg) translateX(-20px)", zIndex: 2 }}>
              <NotifPhone />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}