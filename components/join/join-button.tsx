"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PayPalCheckout } from "@/components/payments/paypal-checkout";

interface JoinButtonProps {
  groupId:       string;
  groupName:     string;
  enrollmentFee: number;
  demoMode:      boolean;
}

export function JoinButton({ groupId, groupName, enrollmentFee, demoMode }: JoinButtonProps) {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const router = useRouter();

  const handleDemoJoin = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/join-free", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ groupId }),
      });
      if (!res.ok) { setError(`Error: ${await res.text()}`); setLoading(false); return; }
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) { window.location.replace("/dashboard"); }
      else { setError(data.error ?? "Failed to join"); setLoading(false); }
    } catch {
      setError("Unexpected error — please try again");
      setLoading(false);
    }
  };

  // Demo / free beta mode
  if (demoMode) {
    return (
      <div className="space-y-2">
        <button onClick={handleDemoJoin} disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
          {loading ? "Joining..." : <>Join Free <ArrowRight size={15} /></>}
        </button>
        {error && (
          <p className="text-xs text-center rounded-lg px-3 py-2"
            style={{ color: "#dc2626", background: "rgba(220,38,38,0.06)" }}>
            {error}
          </p>
        )}
        <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
          Free beta · No payment required
        </p>
      </div>
    );
  }

  // PayPal payment mode
  if (showPayPal) {
    return (
      <div className="rounded-2xl p-4"
        style={{ background: "white", border: "1px solid rgba(0,212,255,0.15)" }}>
        <PayPalCheckout
          groupId={groupId}
          groupName={groupName}
          amount={enrollmentFee / 100}
        />
      </div>
    );
  }

  // Show pay button first, then PayPal on click
  return (
    <div className="space-y-2">
      <button onClick={() => setShowPayPal(true)}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
        Join for ${(enrollmentFee / 100).toFixed(0)} <ArrowRight size={15} />
      </button>
      <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
        One-time payment · Secured by PayPal
      </p>
    </div>
  );
}