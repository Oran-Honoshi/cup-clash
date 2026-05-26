"use client";

import { motion } from "framer-motion";

function BracketPhone() {
  return (
    <div
      style={{
        background: "rgba(8,5,18,0.95)",
        borderRadius: 34,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        width: 240,
        height: 480,
        overflow: "hidden",
        padding: "0 0 16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 28, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
        <div style={{ width: 80, height: 6, background: "#050810", borderRadius: 4 }} />
      </div>
      <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Cup Clash</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Road to the Final</div>
      </div>
      <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { code: "ar", name: "Argentina", pts: "QF" },
          { code: "fr", name: "France",    pts: "QF" },
          { code: "br", name: "Brazil",    pts: "R16" },
          { code: "de", name: "Germany",   pts: "R16" },
        ].map((t) => (
          <div
            key={t.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/flags/${t.code}.svg`} alt={t.name} width={18} height={12}
              style={{ borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)", flex: 1 }}>{t.name}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#00D4FF", background: "rgba(0,212,255,0.1)", padding: "2px 6px", borderRadius: 6 }}>{t.pts}</span>
          </div>
        ))}
        <div style={{ marginTop: 4, padding: "10px", borderRadius: 12, background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Pick: Argentina</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>+100 pts if correct</div>
        </div>
      </div>
    </div>
  );
}

function DashboardPhone() {
  return (
    <div
      style={{
        background: "rgba(8,5,18,0.95)",
        borderRadius: 34,
        border: "1.5px solid rgba(255,255,255,0.25)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,136,0.1)",
        width: 260,
        height: 520,
        overflow: "hidden",
        padding: "0 0 16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 28, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
        <div style={{ width: 80, height: 6, background: "#050810", borderRadius: 4 }} />
      </div>
      <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Cup Clash</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Tech Titans</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, color: "#00FF88" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88" }} />
            Live
          </div>
        </div>
      </div>
      <div style={{ margin: "12px 14px 0", padding: "10px 12px", borderRadius: 14, background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#00FF88", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Now</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "white", background: "rgba(255,0,0,0.8)", padding: "1px 6px", borderRadius: 4 }}>LIVE</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flags/ar.svg" alt="ARG" width={16} height={11} style={{ borderRadius: 2 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>ARG</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(0,255,136,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#00FF88" }}>2</div>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>–</div>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(0,255,136,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#00FF88" }}>1</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>FRA</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/flags/fr.svg" alt="FRA" width={16} height={11} style={{ borderRadius: 2 }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, margin: "10px 14px 0", padding: "10px 12px", borderRadius: 14, background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", overflow: "hidden" }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Leaderboard</div>
        {[
          { rank: 1, name: "Amit",  pts: 145, gold: true,  me: false },
          { rank: 2, name: "Sarah", pts: 130, gold: false, me: false },
          { rank: 3, name: "You",   pts: 110, gold: false, me: true  },
        ].map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 7px",
              borderRadius: 8,
              marginBottom: 4,
              background: p.me ? "rgba(0,255,136,0.08)" : "transparent",
              border: p.me ? "1px solid rgba(0,255,136,0.18)" : "1px solid transparent",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, width: 14, color: p.gold ? "#fbbf24" : p.me ? "#00FF88" : "rgba(255,255,255,0.35)" }}>{p.rank}</span>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#00D4FF,#00FF88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#050e08" }}>{p.name[0]}</div>
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
    { color: "#00FF88", bg: "rgba(0,255,136,0.12)", icon: "⚡", title: "+25 pts earned", sub: "Exact score: ARG 2–1 FRA" },
    { color: "#00D4FF", bg: "rgba(0,212,255,0.12)", icon: "↑", title: "You moved to #3", sub: "Sarah dropped 2 spots" },
    { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", icon: "★", title: "Achievement unlocked", sub: "5 exact scores in a row" },
  ];

  return (
    <div
      style={{
        background: "rgba(8,5,18,0.95)",
        borderRadius: 34,
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        width: 240,
        height: 480,
        overflow: "hidden",
        padding: "0 0 16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 28, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
        <div style={{ width: 80, height: 6, background: "#050810", borderRadius: 4 }} />
      </div>
      <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Cup Clash</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Notifications</div>
      </div>
      <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {notifs.map((n) => (
          <div
            key={n.title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, color: n.color }}>
              {n.icon}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "white", marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{n.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppShowcase() {
  return (
    <section className="py-24 px-5 sm:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4"
            style={{ color: "#00D4FF" }}
          >
            The Whole Experience
          </div>
          <h2
            className="font-display font-black leading-tight"
            style={{ fontSize: "clamp(40px,5vw,64px)", color: "white" }}
          >
            Every match. Every moment.
            <br />
            <span style={{ color: "#00FF88" }}>In your pocket.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
          style={{ position: "relative", minHeight: 520 }}
        >
          <div
            className="hidden md:block"
            style={{ transform: "rotate(-8deg) translateX(-60px) scale(0.85)", zIndex: 1, position: "relative" }}
          >
            <BracketPhone />
          </div>
          <div
            style={{ transform: "rotate(0deg)", zIndex: 3, position: "relative", filter: "drop-shadow(0 0 32px rgba(0,255,136,0.2))" }}
          >
            <DashboardPhone />
          </div>
          <div
            className="hidden md:block"
            style={{ transform: "rotate(8deg) translateX(60px) scale(0.85)", zIndex: 2, position: "relative" }}
          >
            <NotifPhone />
          </div>
        </motion.div>
      </div>
    </section>
  );
}