"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface WelcomePopupProps {
  visible:    boolean;
  onDismiss:  () => void;
  memberName: string;
  groupName:  string;
}

export function WelcomePopup({ visible, onDismiss, memberName, groupName }: WelcomePopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
            onClick={onDismiss}
          />

          {/* Modal wrapper — inset-0 for positioning only, flex on inner div */}
          <div className="fixed inset-0 z-50 pointer-events-none select-none">
            <div className="flex items-center justify-center w-full h-full p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 40 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center pointer-events-auto overflow-hidden relative"
              >
                {/* Brand top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                  style={{ backgroundImage: "linear-gradient(90deg, rgb(var(--brand)), rgb(var(--brand-2)))" }}
                />

                {/* Close button */}
                <button
                  onClick={onDismiss}
                  type="button"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  aria-label="Close welcome popup"
                >
                  <X size={16} />
                </button>

                {/* Header image */}
                <div className="relative h-48 mb-4 -mx-8 -mt-2">
                  <Image
                    src="/trophy-stadium.jpg"
                    alt="World Cup Trophy"
                    fill
                    className="object-cover object-top"
                    style={{
                      maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                    }}
                    unoptimized
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.95) 100%)" }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-3 select-text">
                  <div
                    className="font-display text-4xl uppercase leading-tight tracking-wide font-black"
                    style={{
                      backgroundImage: "linear-gradient(135deg, rgb(var(--brand-2)), rgb(var(--accent-glow)))",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Been waiting for you.
                  </div>
                  <p className="text-pitch-300 text-base">
                    Welcome to <strong className="text-white">{groupName}</strong>,{" "}
                    <strong className="text-white">{memberName}</strong>!
                  </p>
                  <p className="text-pitch-400 text-sm leading-relaxed">
                    Predictions are open. Make your picks before kickoff — every match counts.
                  </p>
                  <Button onClick={onDismiss} size="lg" className="w-full mt-2 font-semibold">
                    Let the games begin! 🏆
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}