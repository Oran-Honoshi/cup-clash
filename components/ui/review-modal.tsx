"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Copy, Check, ExternalLink } from "lucide-react";

const TRUSTPILOT_URL = "https://www.trustpilot.com/evaluate/cupclash.live";

interface ReviewModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  context?:  "post-group" | "post-prediction" | "post-payment" | "general";
  groupName?: string;
}

const CONTEXT_TITLES: Record<string, string> = {
  "post-group":      "Group created! 🏆 Enjoying Cup Clash?",
  "post-prediction": "Predictions locked! 🎯 How are we doing?",
  "post-payment":    "Welcome to the group! 🎉 Love the app so far?",
  "general":         "How would you rate Cup Clash?",
};

export function ReviewModal({ isOpen, onClose, context = "general", groupName }: ReviewModalProps) {
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [review,   setReview]   = useState("");
  const [copied,   setCopied]   = useState(false);
  const [step,     setStep]     = useState<"rate" | "positive" | "negative" | "done">("rate");

  const isPositive = rating >= 4;

  const handleRating = (r: number) => {
    setRating(r);
    setTimeout(() => setStep(r >= 4 ? "positive" : "negative"), 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDone = () => {
    setStep("done");
    setTimeout(() => { onClose(); setStep("rate"); setRating(0); setReview(""); }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{   scale: 0.9, opacity: 0, y: 20  }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

            <div className="h-1" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />

            <div className="p-6">
              <button onClick={onClose} className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center"
                style={{ background: "#f1f5f9", color: "#64748b" }}>
                <X size={15} />
              </button>

              <AnimatePresence mode="wait">

                {/* Step 1: Star rating */}
                {step === "rate" && (
                  <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center space-y-5">
                    <div className="text-2xl mb-1">⭐</div>
                    <h2 className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>
                      {CONTEXT_TITLES[context]}
                    </h2>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      Tap a star to rate your experience
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {[1,2,3,4,5].map(s => (
                        <button key={s}
                          onMouseEnter={() => setHovered(s)}
                          onMouseLeave={() => setHovered(0)}
                          onClick={() => handleRating(s)}
                          className="transition-transform hover:scale-125">
                          <Star size={36}
                            fill={(hovered || rating) >= s ? "#d97706" : "none"}
                            style={{ color: (hovered || rating) >= s ? "#d97706" : "#e2e8f0" }}
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {rating === 0 ? "Tap to rate" : rating <= 2 ? "We're sorry to hear that" : rating === 3 ? "Thanks for the feedback" : "Awesome! 🎉"}
                    </p>
                  </motion.div>
                )}

                {/* Step 2a: Positive — push to Trustpilot */}
                {step === "positive" && (
                  <motion.div key="positive" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎉</div>
                      <h2 className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>
                        You're amazing!
                      </h2>
                      <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                        Write a quick Trustpilot review — it helps others find Cup Clash. Write it below, then copy & paste.
                      </p>
                    </div>

                    <textarea
                      value={review}
                      onChange={e => setReview(e.target.value)}
                      placeholder={`e.g. "Set up our office World Cup group in minutes. The leaderboard updates are addictive. $2 for the whole tournament is a steal."`}
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border resize-none focus:outline-none"
                      style={{ borderColor: "#e2e8f0", color: "#0F172A" }}
                      onFocus={e => e.target.style.borderColor = "#00D4FF"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />

                    <div className="flex gap-2">
                      <button onClick={handleCopy} disabled={!review.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40"
                        style={{ background: "#f1f5f9", color: "#0F172A" }}>
                        {copied ? <><Check size={14} style={{ color: "#059669" }} /> Copied!</> : <><Copy size={14} /> Copy review</>}
                      </button>
                      <a href={TRUSTPILOT_URL} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm"
                        style={{ background: "#00B67A", color: "white" }}
                        onClick={handleDone}>
                        <ExternalLink size={14} /> Trustpilot
                      </a>
                    </div>
                    <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
                      Copy your review → Open Trustpilot → Paste &amp; submit
                    </p>
                  </motion.div>
                )}

                {/* Step 2b: Negative — collect feedback privately */}
                {step === "negative" && (
                  <motion.div key="negative" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2">💬</div>
                      <h2 className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>
                        Help us improve
                      </h2>
                      <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                        What could we do better? We read every message.
                      </p>
                    </div>
                    <textarea
                      value={review}
                      onChange={e => setReview(e.target.value)}
                      placeholder="Tell us what's not working or what you'd like to see..."
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-xl text-sm border resize-none focus:outline-none"
                      style={{ borderColor: "#e2e8f0", color: "#0F172A" }}
                      onFocus={e => e.target.style.borderColor = "#00D4FF"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                    <button onClick={handleDone}
                      className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider"
                      style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                      Send feedback
                    </button>
                  </motion.div>
                )}

                {/* Done */}
                {step === "done" && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4 space-y-2">
                    <div className="text-4xl">🙏</div>
                    <h2 className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>Thank you!</h2>
                    <p className="text-sm" style={{ color: "#64748b" }}>Your feedback means a lot.</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Trigger button — drop anywhere
export function ReviewTrigger({ context = "general", label = "Rate us ⭐" }: {
  context?: ReviewModalProps["context"]; label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
        style={{ background: "rgba(217,119,6,0.1)", color: "#d97706", border: "1px solid rgba(217,119,6,0.2)" }}>
        <Star size={12} fill="#d97706" />
        {label}
      </button>
      <ReviewModal isOpen={open} onClose={() => setOpen(false)} context={context} />
    </>
  );
}