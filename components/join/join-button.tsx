"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";

interface JoinButtonProps {
  groupId:       string;
  groupName:     string;
  enrollmentFee: number; // dollars e.g. 2
  demoMode:      boolean;
}

export function JoinButton({ groupId, groupName, enrollmentFee, demoMode }: JoinButtonProps) {
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);

  const handleFreeJoin = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/join-free", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ groupId }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        window.location.replace("/groups");
      } else {
        setError(data.error ?? "Failed to join. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // PayPal upgrade overlay
  if (showPayPal) {
    return (
      <div className="space-y-3">
        <button onClick={() => setShowPayPal(false)}
          className="text-xs font-bold flex items-center gap-1"
          style={{ color: "#64748b" }}>
          ← Back
        </button>
        <div className="rounded-2xl p-4" style={{ background: "rgba(18,14,38,0.32)", backdropFilter: "blur(40px) saturate(180%)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 22 }}>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
            <Sparkles size={12} /> Remove ads for the whole tournament
          </div>
          <PayPalCheckout groupId={groupId} groupName={groupName} amount={enrollmentFee} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Primary CTA — always free */}
      <button
        onClick={handleFreeJoin}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
        {loading ? <><Loader2 size={15} className="animate-spin" /> Joining...</> : <>Join Free <ArrowRight size={15} /></>}
      </button>

      {error && <p className="text-xs text-center rounded-xl px-3 py-2" style={{ color: "#dc2626", background: "rgba(220,38,38,0.06)" }}>{error}</p>}

      {/* Secondary upgrade — only for non-demo, non-zero fee */}
      {!demoMode && enrollmentFee > 0 && (
        <button
          onClick={() => setShowPayPal(true)}
          className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
          style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.18)", color: "rgba(0,212,255,0.7)" }}>
          <Sparkles size={11} /> Remove ads — ${enrollmentFee.toFixed(0)} one-time
        </button>
      )}

      <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
        {demoMode ? "Free beta · No payment required" : "Free to join · Predict all 104 matches"}
      </p>
    </div>
  );
}
