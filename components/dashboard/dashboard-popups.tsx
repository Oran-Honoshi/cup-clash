"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FirstPredictionPopupProps {
  groupId?: string;
  userId?:  string;
}

export function DashboardPopups({ groupId, userId }: FirstPredictionPopupProps) {
  const [popup,    setPopup]    = useState<"first_pred" | null>(null);
  const [matchInfo, setMatchInfo] = useState<{ home: string; away: string; homeScore: string; awayScore: string } | null>(null);

  useEffect(() => {
    // Listen for first prediction event from next-match-card
    const handler = async () => {
      const alreadySeen = localStorage.getItem("cupclash_first_pred");
      if (alreadySeen) return;

      // Load the actual prediction that was just saved
      if (groupId && userId) {
        const sb = createClient();
        const { data } = await sb
          .from("group_predictions")
          .select("match_id, home_score, away_score")
          .eq("group_id", groupId)
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          const row = data as { match_id: string; home_score: number; away_score: number };
          // Parse match_id to get team names — format is usually "m1", look up from schedule
          setMatchInfo({
            home:      "Mexico",        // Will be replaced with real data
            away:      "South Africa",  // Will be replaced with real data
            homeScore: String(row.home_score),
            awayScore: String(row.away_score),
          });
        }
      }

      setPopup("first_pred");
      localStorage.setItem("cupclash_first_pred", "true");
    };

    window.addEventListener("cupclash:first_prediction", handler);
    return () => window.removeEventListener("cupclash:first_prediction", handler);
  }, [groupId, userId]);

  const close = () => setPopup(null);

  return (
    <AnimatePresence>
      {popup === "first_pred" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{   scale: 0.9, opacity: 0, y: 20  }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="rounded-3xl p-8 max-w-sm w-full text-center relative"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,136,0.08))", border: "1px solid rgba(0,255,136,0.3)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

            <button onClick={close}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
              <X size={16} />
            </button>

            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
              <Target size={28} style={{ color: "#0B141B" }} />
            </div>

            <h2 className="font-display text-2xl uppercase font-black mb-2" style={{ color: "white" }}>
              First Bet Locked!
            </h2>

            {matchInfo && (
              <div className="rounded-2xl px-4 py-3 mb-4"
                style={{ background: "rgba(18,14,38,0.6)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {matchInfo.home} vs {matchInfo.away}
                </div>
                <div className="font-display text-3xl font-black" style={{ color: "white" }}>
                  {matchInfo.homeScore}–{matchInfo.awayScore}
                </div>
              </div>
            )}

            <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your prediction is locked in. Now wait for the match — every goal counts!
            </p>
            <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              ⚡ +25 pts if exact · +10 pts if correct outcome
            </p>

            <button onClick={close}
              className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
              Let&apos;s Go! 🎯
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}