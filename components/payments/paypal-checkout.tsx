"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PayPalCheckoutProps {
  groupId:   string;
  groupName: string;
  amount:    number; // in dollars e.g. 2
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: object) => { render: (selector: string) => void };
    };
  }
}

export function PayPalCheckout({ groupId, groupName, amount }: PayPalCheckoutProps) {
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) { setError("PayPal not configured"); setLoading(false); return; }

    // Load PayPal SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => {
      setLoading(false);
      if (!window.paypal || !containerRef.current) return;

      window.paypal.Buttons({
        style: {
          layout:  "vertical",
          color:   "gold",
          shape:   "rect",
          label:   "pay",
          height:  48,
        },
        createOrder: async () => {
          const res = await fetch("/api/paypal/create-order", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ groupId, amount }),
          });
          const data = await res.json() as { id: string };
          return data.id;
        },
        onApprove: async (data: { orderID: string }) => {
          setLoading(true);
          const res = await fetch("/api/paypal/capture-order", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ orderID: data.orderID, groupId }),
          });
          const result = await res.json() as { success: boolean; error?: string };
          if (result.success) {
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 1500);
          } else {
            setError(result.error ?? "Payment failed");
            setLoading(false);
          }
        },
        onError: (err: unknown) => {
          console.error("PayPal error:", err);
          setError("Payment failed. Please try again.");
          setLoading(false);
        },
        onCancel: () => {
          setError("Payment cancelled.");
        },
      }).render("#paypal-button-container");
    };
    script.onerror = () => {
      setError("Failed to load PayPal. Check your connection.");
      setLoading(false);
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [groupId, amount, router]);

  if (success) {
    return (
      <div className="text-center py-6 space-y-2">
        <div className="text-4xl">🎉</div>
        <div className="font-bold text-lg" style={{ color: "#0F172A" }}>Payment successful!</div>
        <div className="text-sm" style={{ color: "#64748b" }}>Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center text-sm font-bold mb-2" style={{ color: "#64748b" }}>
        Join {groupName} · $2 one-time
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2" style={{ color: "#94a3b8" }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading PayPal...</span>
        </div>
      )}

      {error && (
        <div className="text-center text-sm rounded-xl px-4 py-3"
          style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}>
          {error}
        </div>
      )}

      <div id="paypal-button-container" ref={containerRef} />

      <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
        Secured by PayPal · No account required · Pay with card or PayPal
      </p>
    </div>
  );
}