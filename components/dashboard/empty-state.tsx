"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Users, Building2, KeyRound, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FOCUS_RING } from "@/lib/a11y";

interface DashboardEmptyStateProps {
  highlight?: string;
}

export function DashboardEmptyState({ highlight }: DashboardEmptyStateProps = {}) {
  const friendRef = useRef<HTMLDivElement>(null);
  const corpRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target =
      highlight === "create-group" ? friendRef.current
      : highlight === "corporate"  ? corpRef.current
      : null;
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    }
  }, [highlight]);

  const friendHighlight = highlight === "create-group";
  const corpHighlight   = highlight === "corporate";

  return (
    <div className="space-y-5">
      {(friendHighlight || corpHighlight) && (
        <style>{`
          @keyframes neonPulse {
            0%,100% { box-shadow: 0 0 0 2px #00FF88, 0 0 16px rgba(0,255,136,0.25); }
            50%      { box-shadow: 0 0 0 2px #00FF88, 0 0 36px rgba(0,255,136,0.55); }
          }
          @keyframes neonPulseCyan {
            0%,100% { box-shadow: 0 0 0 2px #00D4FF, 0 0 16px rgba(0,212,255,0.25); }
            50%      { box-shadow: 0 0 0 2px #00D4FF, 0 0 36px rgba(0,212,255,0.55); }
          }
        `}</style>
      )}

      <div>
        <div className="label-caps mb-1" style={{ color: "#00D4FF" }}>Welcome to Cup Clash</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
          How would you like to play?
        </h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
          Pick your path. You can always change later.
        </p>
      </div>

      {/* Primary tiles */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Friend Circle */}
        <div ref={friendRef}>
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,255,136,0.2)" }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/create-group?model=pay_per_member"
              className={`block rounded-3xl overflow-hidden h-full ${FOCUS_RING}`}
              style={{
                background: "rgba(10, 18, 30, 0.75)",
                border: "1px solid rgba(0,255,136,0.25)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                animation: friendHighlight ? "neonPulse 1.4s ease-in-out 4" : undefined,
              }}
            >
              <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #00FF88, #00D4FF)" }} />
              <div className="p-7">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)" }}
                >
                  <Users size={26} style={{ color: "#00FF88" }} />
                </div>
                <div className="font-display text-2xl uppercase font-black mb-2 text-white">
                  Friend Circle
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Free for everyone. Predict, compete, and climb the leaderboard. Want an ad-free experience? Upgrade for just{" "}
                  <strong style={{ color: "#00FF88" }}>$2</strong>.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Fantasy leagues", "Friend groups", "Family", "Bar buddies"].map(t => (
                    <span
                      key={t}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(0,255,136,0.1)",
                        color: "#00FF88",
                        border: "1px solid rgba(0,255,136,0.2)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "#00FF88" }}>
                  Create a Friend Group <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Corporate Sponsor */}
        <div ref={corpRef}>
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,212,255,0.2)" }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/create-group?model=corporate_sponsored"
              className={`block rounded-3xl overflow-hidden h-full ${FOCUS_RING}`}
              style={{
                background: "rgba(10, 18, 30, 0.75)",
                border: "1px solid rgba(0,212,255,0.25)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                animation: corpHighlight ? "neonPulseCyan 1.4s ease-in-out 4" : undefined,
              }}
            >
              <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
              <div className="p-7">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}
                >
                  <Building2 size={26} style={{ color: "#00D4FF" }} />
                </div>
                <div className="font-display text-2xl uppercase font-black mb-2 text-white">
                  Corporate Sponsor
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Cover the whole team with a{" "}
                  <strong style={{ color: "#00D4FF" }}>single flat rate</strong>.
                  Everyone you invite joins for{" "}
                  <strong style={{ color: "#00FF88" }}>$0, zero friction</strong>.
                </p>
                <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "#00D4FF" }}>
                  Set Up Corporate Group <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Link
            href="/join/enter"
            className={`block rounded-2xl p-5 flex items-center gap-4 ${FOCUS_RING}`}
            style={{
              background: "rgba(10, 18, 30, 0.65)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              <KeyRound size={20} style={{ color: "#00D4FF" }} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Join a Group</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Enter a passkey from your admin</div>
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Link
            href="/predictions"
            className={`block rounded-2xl p-5 flex items-center gap-4 ${FOCUS_RING}`}
            style={{
              background: "rgba(10, 18, 30, 0.65)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}
            >
              <Trophy size={20} style={{ color: "#00FF88" }} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Solo Predictions</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Play on your own, no group needed</div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}