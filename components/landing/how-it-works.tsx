"use client";

import { motion } from "framer-motion";

function GroupCreationMockup() {
  return (
    <div style={{ background: "rgba(18,14,38,0.8)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", height: 200, overflow: "hidden", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#00FF88", textTransform: "uppercase", letterSpacing: "0.12em" }}>Create Group</div>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, padding: "7px 10px" }}>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Group Name</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "white" }}>Tech Titans ⚽</div>
      </div>
      <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Scoring Rules</div>
      {[
        { label: "Exact Score", pts: "25 pts", on: true },
        { label: "Correct Result", pts: "10 pts", on: true },
        { label: "Tournament Pick", pts: "100 pts", on: true },
      ].map((r) => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>{r.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{r.pts}</span>
            <div style={{ width: 24, height: 13, borderRadius: 7, background: r.on ? "rgba(0,255,136,0.7)" : "rgba(255,255,255,0.1)", position: "relative" }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: r.on ? 13 : 2 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InviteMockup() {
  return (
    <div style={{ background: "rgba(18,14,38,0.8)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", height: 200, overflow: "hidden", padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.12em" }}>Group Passkey</div>
      <div style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 12, padding: "10px 20px", fontFamily: "monospace", fontSize: 28, fontWeight: 800, color: "white", letterSpacing: "0.25em" }}>
        TITANS
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Share with your squad</div>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "WhatsApp", color: "#25D366", bg: "rgba(37,211,102,0.12)" },
          { label: "Slack",    color: "#E01E5A", bg: "rgba(224,30,90,0.12)" },
          { label: "Email",    color: "#00D4FF", bg: "rgba(0,212,255,0.12)" },
        ].map((s) => (
          <div key={s.label} style={{ fontSize: 8, fontWeight: 700, color: s.color, background: s.bg, padding: "4px 8px", borderRadius: 6, border: `1px solid ${s.color}33` }}>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardMockup() {
  return (
    <div style={{ background: "rgba(18,14,38,0.8)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", height: 200, overflow: "hidden", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.12em" }}>Leaderboard</span>
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "#00FF88", fontWeight: 700 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FF88" }} />
          Live
        </div>
      </div>
      {[
        { rank: 1, name: "Amit",  pts: 145, gold: true,  me: false },
        { rank: 2, name: "Sarah", pts: 130, gold: false, me: false },
        { rank: 3, name: "You",   pts: 110, gold: false, me: true  },
      ].map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: p.me ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.03)", border: p.me ? "1px solid rgba(0,255,136,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 10, fontWeight: 800, width: 14, color: p.gold ? "#fbbf24" : p.me ? "#00FF88" : "rgba(255,255,255,0.35)" }}>{p.rank}</span>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#00D4FF,#00FF88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#050e08" }}>{p.name[0]}</div>
          <span style={{ fontSize: 10, fontWeight: 600, flex: 1, color: "white" }}>{p.name}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: p.gold ? "#fbbf24" : p.me ? "#00FF88" : "rgba(255,255,255,0.5)" }}>{p.pts}</span>
        </div>
      ))}
      <div style={{ marginTop: 2, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.3)" }}>104 matches · 38 days · One champion</div>
    </div>
  );
}

const STEPS = [
  {
    number: "01", color: "#00FF88", bgColor: "rgba(0,255,136,0.08)", borderColor: "rgba(0,255,136,0.25)",
    title: "Create Your Group · Free",
    body: "Sign up, name your group, and set scoring rules in under 60 seconds. No credit card. No commitment.",
    detail: "✓ Free to create. No card required.",
    mockup: <GroupCreationMockup />,
  },
  {
    number: "02", color: "#00D4FF", bgColor: "rgba(0,212,255,0.08)", borderColor: "rgba(0,212,255,0.25)",
    title: "Invite Your Squad",
    body: "Share your unique passkey via WhatsApp, Telegram, email or SMS. Everyone joins free and starts predicting immediately. No subscription, no hidden fees.",
    detail: "Free to join. Optional $2 to remove ads.",
    mockup: <InviteMockup />,
  },
  {
    number: "03", color: "#fbbf24", bgColor: "rgba(217,119,6,0.08)", borderColor: "rgba(251,191,36,0.25)",
    title: "Predict & Conquer",
    body: "Enter scores, track the live bracket, and climb the leaderboard in real-time. Every goal changes the standings until the trophy is raised in Jersey.",
    detail: "104 matches. 38 days. One champion.",
    mockup: <LeaderboardMockup />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan mb-3">Simple by design</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase text-white">
            Up and running in{" "}
            <span className="text-ac">60 seconds.</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[120px] left-[16.67%] right-[16.67%] h-px"
            style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF, #fbbf24)" }} />
          <div className="grid lg:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={step.number}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-2xl overflow-hidden"
                style={{ background: "rgba(18,14,38,0.32)", backdropFilter: "blur(40px) saturate(180%)", border: `1px solid ${step.borderColor}`, boxShadow: `0 4px 24px ${step.bgColor}, 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)` }}>
                <div className="absolute -top-5 -right-5 w-28 h-28 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${step.color}20, transparent 70%)`, filter: "blur(30px)" }} />
                <div className="relative overflow-hidden p-4" style={{ background: "rgba(8,5,18,0.5)" }}>
                  <div className="absolute top-4 left-4 h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs z-10"
                    style={{ background: "rgba(18,14,38,0.9)", backdropFilter: "blur(8px)", color: step.color, border: `1px solid ${step.color}40` }}>
                    {step.number}
                  </div>
                  {step.mockup}
                </div>
                <div className="px-6 pt-4 pb-6">
                  <h3 className="font-display text-2xl uppercase mb-3 text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed mb-3 text-white/62">{step.body}</p>
                  <p className="text-sm font-bold" style={{ color: step.color }}>{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}