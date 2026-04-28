"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface WelcomePopupProps {
  memberName: string;
  groupName: string;
}

const STORAGE_KEY = "cupclash_welcomed";

export function WelcomePopup({ memberName, groupName }: WelcomePopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only once per member (stored in localStorage)
    const welcomed = localStorage.getItem(STORAGE_KEY);
    if (!welcomed) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={dismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center pointer-events-auto overflow-hidden relative">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                style={{ backgroundImage: "linear-gradient(90deg, rgb(var(--brand)), rgb(var(--brand-2)))" }} />

              {/* Close */}
              <button onClick={dismiss}
                className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-pitch-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>

              {/* Trophy image */}
              <div className="relative h-48 mb-4 -mx-8 -mt-2">
                <Image
                  src="/trophy-stadium.jpg"
                  alt="World Cup Trophy"
                  fill
                  className="object-cover object-top"
                  style={{ maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}
                  unoptimized
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.95) 100%)" }} />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div
                  className="font-display text-4xl uppercase leading-tight"
                  style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand-2)), rgb(var(--accent-glow)))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  Been waiting for you.
                </div>

                <p className="text-pitch-300 text-base">
                  Welcome to <strong className="text-white">{groupName}</strong>,{" "}
                  <strong className="text-white">{memberName}</strong>!
                </p>

                <p className="text-pitch-400 text-sm">
                  The bets are open. Make your predictions before kickoff — every match counts.
                </p>

                <Button onClick={dismiss} size="lg" className="w-full mt-2">
                  Let the bets begin! 🏆
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
