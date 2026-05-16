"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function WelcomeModal() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show only on first visit — check localStorage
    const seen = localStorage.getItem("cupclash_welcome_seen");
    if (!seen) {
      // Small delay so the dashboard loads first
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const dismiss = (path?: string) => {
    localStorage.setItem("cupclash_welcome_seen", "true");
    setShow(false);
    if (path) setTimeout(() => router.push(path), 200);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.85, opacity: 0, y: 30  }}
            transition={{ type: "spring", damping: 20, stiffness: 280 }}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>

            {/* Top gradient bar */}
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />

            {/* Dismiss */}
            <button onClick={() => dismiss()}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center z-10"
              style={{ background: "#f1f5f9", color: "#64748b" }}>
              <X size={15} />
            </button>

            <div className="p-8 text-center">
              {/* Celebration */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, damping: 12 }}
                className="text-6xl mb-4">
                🎉
              </motion.div>

              <h2 className="font-display text-3xl uppercase font-black mb-2"
                style={{ color: "#0F172A" }}>
                Welcome to Cup Clash!
              </h2>
              <p className="text-sm mb-8" style={{ color: "#64748b" }}>
                You're all set for the FIFA World Cup 2026.
                What would you like to do first?
              </p>

              {/* Two options */}
              <div className="space-y-3">

                {/* Join a group */}
                <button onClick={() => dismiss("/join/enter")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))",
                    border: "1px solid rgba(0,212,255,0.2)",
                  }}>
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)" }}>
                    <Users size={22} style={{ color: "#0B141B" }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-base" style={{ color: "#0F172A" }}>
                      Join a group
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      Enter a passkey from your admin
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: "#0891B2" }} />
                </button>

                {/* Create a group */}
                <button onClick={() => dismiss("/create-group")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                  }}>
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <Plus size={22} style={{ color: "#0891B2" }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-base" style={{ color: "#0F172A" }}>
                      Create a group
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      Be the admin · Invite your friends
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: "#94a3b8" }} />
                </button>

                {/* Just predict alone */}
                <button onClick={() => dismiss("/predictions")}
                  className="w-full text-sm py-2 transition-colors"
                  style={{ color: "#94a3b8" }}>
                  I'll just predict on my own for now →
                </button>
              </div>
            </div>

            {/* PWA install hint */}
            <div className="px-8 pb-6 text-center">
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                📱 Tip: Add Cup Clash to your home screen for the full app experience
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}