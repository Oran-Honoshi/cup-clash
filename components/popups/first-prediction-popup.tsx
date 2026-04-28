"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FirstPredictionPopupProps {
  visible: boolean;
  onDismiss: () => void;
  matchLabel: string;
  prediction: string;
}

export function FirstPredictionPopup({
  visible,
  onDismiss,
  matchLabel,
  prediction,
}: FirstPredictionPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onDismiss}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center pointer-events-auto relative overflow-hidden">
              {/* Animated glow bg */}
              <div className="absolute inset-0 opacity-20"
                style={{ background: "radial-gradient(circle at 50% 0%, rgb(var(--accent)), transparent 70%)" }} />

              <button onClick={onDismiss}
                className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-pitch-400 hover:text-white hover:bg-white/10 transition-colors">
                <X size={16} />
              </button>

              {/* Icon */}
              <div className="relative mx-auto mb-5">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-20 w-20 rounded-full mx-auto flex items-center justify-center"
                  style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))", boxShadow: "0 0 40px rgb(var(--brand)/0.5)" }}
                >
                  <Target size={36} className="text-white" />
                </motion.div>
                {/* Sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i / 6) * Math.PI * 2) * 50,
                      y: Math.sin((i / 6) * Math.PI * 2) * 50,
                    }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: "rgb(var(--accent-glow))" }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <div className="font-display text-4xl uppercase text-white">
                  First bet locked!
                </div>

                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-pitch-400 uppercase tracking-widest mb-1">{matchLabel}</div>
                  <div className="font-display text-3xl text-white">{prediction}</div>
                </div>

                <p className="text-pitch-300 text-sm">
                  Your prediction is locked in. Now wait for the match — every goal counts!
                </p>

                <div className="flex items-center justify-center gap-2 text-xs text-pitch-400">
                  <Zap size={12} className="text-success" />
                  <span>+25 pts if exact · +10 pts if correct outcome</span>
                </div>

                <Button onClick={onDismiss} size="md" className="w-full">
                  Let&apos;s go! 🎯
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
