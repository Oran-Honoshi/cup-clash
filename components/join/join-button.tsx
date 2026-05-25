"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";

interface JoinButtonProps {
  groupId:       string;
  groupName:     string;
  enrollmentFee: number; // already in dollars e.g. 2
  demoMode:      boolean;
}

export function JoinButton({ groupId, groupName, enrollmentFee, demoMode }: JoinButtonProps) {
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [showPayPal,  setShowPayPal]  = useState(false);

  // Demo/free mode
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

  if (demoMode) {
    return (
      <div className="space-y-2">
        <button onClick={handleFreeJoin} disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Joining...</> : <>Join Free <ArrowRight size={15} /></>}
        </button>
        {error && <p className="text-xs text-center rounded-xl px-3 py-2" style={{ color: "#dc2626", background: "rgba(220,38,38,0.06)" }}>{error}</p>}
        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Free beta · No payment required</p>
      </div>
    );
  }

  // PayPal mode — show button first, expand PayPal on click
  if (showPayPal) {
    return (
      <div className="rounded-2xl p-4" style={{ background: "rgba(18,14,38,0.32)", backdropFilter: "blur(40px) saturate(180%)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 22 }}>
        <PayPalCheckout groupId={groupId} groupName={groupName} amount={enrollmentFee} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowPayPal(true)}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
        Join for ${enrollmentFee.toFixed(0)} <ArrowRight size={15} />
      </button>
      <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        One-time · Secured by PayPal · No account required
      </p>
    </div>
  );
}