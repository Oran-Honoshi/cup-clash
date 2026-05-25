"use client";

import { useEffect } from "react";
import { Trophy, Lock } from "lucide-react";
import {
  GuestModalProvider,
  useGuestModal,
  useTimerTrigger,
  useReturningGuestTrigger,
} from "@/components/ui/guest-signup-modal";

// ── Inner shell (must be inside GuestModalProvider) ───────────────────────────

function GuestShellInner() {
  const { open } = useGuestModal();

  // 60-second auto-trigger
  useTimerTrigger(true);

  // Returning guest trigger
  useReturningGuestTrigger(true);

  return (
    <div className="space-y-6">
      {/* Guest mode banner */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap"
        style={{
          background: "rgba(0,212,255,0.05)",
          border: "1px solid rgba(0,212,255,0.2)",
        }}
      >
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
        >
          <Trophy size={18} style={{ color: "#00D4FF" }} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm" style={{ color: "white" }}>
            You&apos;re in guest mode
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Fill in your predictions now — they&apos;ll be saved to your account the moment you sign up.
          </div>
        </div>
        <button
          onClick={() => open("save_prediction")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #00FF88, #00D4FF)",
            color: "#0B141B",
          }}
        >
          <Lock size={12} /> Sign Up to Save
        </button>
      </div>

      {/*
        Render the actual predictions UI here.
        This is a placeholder — in your codebase, import and render
        the PredictionsClient with guestMode=true so it:
          1. Shows all matches
          2. Uses GuestStore.upsert() on pick instead of API call
          3. Calls open("save_prediction") when user taps "Save Prediction"
        
        Example:
        <PredictionsClient
          groupId="00000000-0000-0000-0000-000000000001"
          groupName="My Predictions"
          allGroups={[]}
          userId="guest"
          isPaid={false}
          guestMode={true}
          onGuestSave={() => open("save_prediction")}
        />
      */}
      <div
        className="rounded-3xl p-8 text-center"
        style={{ background: "rgba(18,14,38,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <div className="text-4xl mb-3">⚽</div>
        <div className="font-display text-2xl uppercase font-black mb-2" style={{ color: "white" }}>
          Predictions Open
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          All 104 World Cup matches available to predict.
          Your picks are saved locally until you create a free account.
        </p>
      </div>
    </div>
  );
}

// ── Exported shell (provides context) ────────────────────────────────────────

export function GuestPredictionsShell() {
  return (
    <GuestModalProvider>
      <GuestShellInner />
    </GuestModalProvider>
  );
}