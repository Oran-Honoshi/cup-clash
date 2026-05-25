"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Users, Trophy, Save, Share2, BarChart2, Clock, RotateCcw } from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SignupTrigger =
  | "timer"          // 60-second idle on landing / predictions
  | "save_prediction"// tried to save a prediction
  | "create_group"   // hit create group without account
  | "join_group"     // arrived at join link without account
  | "leaderboard"    // clicked leaderboard entry
  | "share"          // tried to share predictions
  | "returning";     // returning guest with unsaved picks

interface TriggerConfig {
  icon: React.ReactNode;
  headline: string;
  sub: string;
  cta: string;
  accent: string;  // hex
}

const TRIGGER_CONFIG: Record<SignupTrigger, TriggerConfig> = {
  timer: {
    icon: <Clock size={28} />,
    headline: "Still exploring?",
    sub: "Save your spot before June 11 kickoff. It takes 20 seconds and your picks are preserved.",
    cta: "Save My Spot — Free",
    accent: "#00D4FF",
  },
  save_prediction: {
    icon: <Save size={28} />,
    headline: "Nice pick! Now save it.",
    sub: "Predictions lock 5 minutes before kickoff. Sign up to make it official — your pick is ready to go.",
    cta: "Save My Prediction — Free",
    accent: "#00FF88",
  },
  create_group: {
    icon: <Users size={28} />,
    headline: "Almost there.",
    sub: "Create a free account to generate your group passkey and invite your friends or team.",
    cta: "Create Account & Launch Group",
    accent: "#00FF88",
  },
  join_group: {
    icon: <Users size={28} />,
    headline: "Claim your spot.",
    sub: "You're one step away from joining. Create a free account to lock in your place.",
    cta: "Sign Up & Join",
    accent: "#00D4FF",
  },
  leaderboard: {
    icon: <BarChart2 size={28} />,
    headline: "Get on the board.",
    sub: "Sign up to appear on the live leaderboard. Your predictions will count from your first saved pick.",
    cta: "Join the Leaderboard — Free",
    accent: "#00D4FF",
  },
  share: {
    icon: <Share2 size={28} />,
    headline: "Share your picks.",
    sub: "Sign up to unlock shareable prediction cards and brag to your group about your genius calls.",
    cta: "Sign Up & Share",
    accent: "#00FF88",
  },
  returning: {
    icon: <RotateCcw size={28} />,
    headline: "Welcome back.",
    sub: "Your unsaved predictions are still here. Sign up to lock them in before they're gone.",
    cta: "Claim My Picks — Free",
    accent: "#00FF88",
  },
};

// ── Context ───────────────────────────────────────────────────────────────────

interface GuestModalCtx {
  open: (trigger: SignupTrigger, groupName?: string) => void;
  close: () => void;
  isOpen: boolean;
}

const GuestModalContext = createContext<GuestModalCtx>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function useGuestModal() {
  return useContext(GuestModalContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function GuestModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [trigger, setTrigger]     = useState<SignupTrigger>("timer");
  const [groupName, setGroupName] = useState<string | undefined>();

  const open = useCallback((t: SignupTrigger, gn?: string) => {
    setTrigger(t);
    setGroupName(gn);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <GuestModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <GuestSignupModal
        isOpen={isOpen}
        trigger={trigger}
        groupName={groupName}
        onClose={close}
      />
    </GuestModalContext.Provider>
  );
}

// ── 60-Second Auto-Trigger Hook ───────────────────────────────────────────────

/**
 * Use this hook in any page/component to fire the timer trigger after 60s.
 * Won't fire if the user has already dismissed it this session.
 */
export function useTimerTrigger(enabled = true) {
  const { open } = useGuestModal();
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled || firedRef.current) return;

    // Check session storage — don't re-show if dismissed this session
    if (typeof window !== "undefined" && sessionStorage.getItem("cc_guest_modal_dismissed")) return;

    const t = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        open("timer");
      }
    }, 60_000);

    return () => clearTimeout(t);
  }, [enabled, open]);
}

// ── Returning Guest Hook ──────────────────────────────────────────────────────

/**
 * Fires "returning" trigger if guest has saved predictions in localStorage
 * and has visited before (cookie set on first visit).
 */
export function useReturningGuestTrigger(enabled = true) {
  const { open } = useGuestModal();

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("cc_guest_modal_dismissed")) return;

    const hasGuestPicks = !!localStorage.getItem("cc_guest_predictions");
    const hasVisited    = !!localStorage.getItem("cc_guest_visited");

    if (hasGuestPicks && hasVisited) {
      // Slight delay so page renders first
      const t = setTimeout(() => open("returning"), 1500);
      return () => clearTimeout(t);
    }

    // Mark as visited for next time
    localStorage.setItem("cc_guest_visited", "1");
  }, [enabled, open]);
}

// ── Modal Component ───────────────────────────────────────────────────────────

interface GuestSignupModalProps {
  isOpen:     boolean;
  trigger:    SignupTrigger;
  groupName?: string;
  onClose:    () => void;
}

function GuestSignupModal({ isOpen, trigger, groupName, onClose }: GuestSignupModalProps) {
  const cfg = TRIGGER_CONFIG[trigger];

  // Build the signup URL — pass migrate=1 so the app knows to pull localStorage picks
  const signupUrl  = `/signup?next=/predictions&migrate=1`;
  const signinUrl  = `/signin?next=/predictions&migrate=1`;

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cc_guest_modal_dismissed", "1");
    }
    onClose();
  };

  // Override headline if we have a group name
  const headline = groupName && trigger === "join_group"
    ? `Join ${groupName}.`
    : cfg.headline;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 32 }}
              transition={{ type: "spring", damping: 22, stiffness: 320 }}
              className="w-full max-w-sm pointer-events-auto rounded-3xl overflow-hidden relative"
              style={{
                background: "rgba(18,14,38,0.32)",
                backdropFilter: "blur(40px) saturate(180%)",
                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                border: `2px solid ${cfg.accent}44`,
                boxShadow: `0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18), 0 24px 80px ${cfg.accent}22`,
                borderRadius: 28,
              }}
            >
              {/* Top gradient bar */}
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${cfg.accent}, #00D4FF)` }} />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "#94a3b8", background: "transparent" }}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="p-7 pt-6">
                {/* Icon */}
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: `${cfg.accent}12`,
                    border: `1px solid ${cfg.accent}30`,
                    color: cfg.accent,
                  }}
                >
                  {cfg.icon}
                </div>

                {/* Headline */}
                <h2
                  className="font-display text-2xl uppercase font-black mb-2 leading-tight"
                  style={{ color: "white" }}
                >
                  {headline}
                </h2>

                {/* Sub-headline */}
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {cfg.sub}
                </p>

                {/* Primary CTA */}
                <Link href={signupUrl} className="block w-full mb-3">
                  <button
                    className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${cfg.accent}, #00D4FF)`,
                      color: "#0B141B",
                      boxShadow: `0 8px 24px ${cfg.accent}30`,
                    }}
                  >
                    {cfg.cta} <ArrowRight size={15} />
                  </button>
                </Link>

                {/* Sign in link */}
                <Link href={signinUrl} className="block w-full mb-5">
                  <button
                    className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
                    style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF", background: "transparent" }}
                  >
                    Already have an account? Sign in
                  </button>
                </Link>

                {/* Privacy + Terms consent copy */}
                <p className="text-[10px] text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.5)" }} target="_blank">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.5)" }} target="_blank">
                    Privacy Policy
                  </Link>
                  . We collect your email and prediction data to run your group. No spam, ever.{" "}
                  <Link href="/privacy#data" className="underline hover:opacity-70" style={{ color: "rgba(255,255,255,0.5)" }} target="_blank">
                    What data we store →
                  </Link>
                </p>

                {/* Dismiss link */}
                <button
                  onClick={handleDismiss}
                  className="w-full text-center text-[11px] mt-3 transition-opacity hover:opacity-60"
                  style={{ color: "#94a3b8" }}
                >
                  Continue exploring without an account
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Guest Prediction Store ────────────────────────────────────────────────────

const GUEST_KEY = "cc_guest_predictions";

export interface GuestPrediction {
  matchId:  string;
  homeGoals: number;
  awayGoals: number;
  savedAt:  string;
}

export const GuestStore = {
  get(): GuestPrediction[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
    } catch {
      return [];
    }
  },
  set(predictions: GuestPrediction[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_KEY, JSON.stringify(predictions));
  },
  upsert(prediction: GuestPrediction) {
    const existing = GuestStore.get();
    const idx = existing.findIndex(p => p.matchId === prediction.matchId);
    if (idx >= 0) existing[idx] = prediction;
    else existing.push(prediction);
    GuestStore.set(existing);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(GUEST_KEY);
  },
  count(): number {
    return GuestStore.get().length;
  },
};
