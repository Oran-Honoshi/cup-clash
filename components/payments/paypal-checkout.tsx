"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

interface PayPalCheckoutProps {
  groupId:   string;
  groupName: string;
  amount:    number;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: object) => { render: (selector: string) => Promise<void> };
    };
  }
}

export function PayPalCheckout({ groupId, groupName, amount }: PayPalCheckoutProps) {
  const [status,  setStatus]  = useState<"loading" | "ready" | "success" | "error">("loading");
  const [error,   setError]   = useState<string | null>(null);
  const rendered  = useRef(false);
  const router    = useRouter();

  useEffect(() => {
    if (rendered.current) return;
    rendered.current = true;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) { setError("PayPal not configured"); setStatus("error"); return; }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
    script.async = true;

    script.onload = () => {
      if (!window.paypal) { setError("PayPal failed to load"); setStatus("error"); return; }
      setStatus("ready");

      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 },

        createOrder: async () => {
          const res = await fetch("/api/paypal/create-order", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ groupId, amount }),
          });
          if (!res.ok) throw new Error("Failed to create order");
          const data = await res.json() as { id: string; error?: string };
          if (data.error) throw new Error(data.error);
          return data.id;
        },

        onApprove: async (data: { orderID: string }) => {
          setStatus("loading");
          try {
            const res = await fetch("/api/paypal/capture-order", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ orderID: data.orderID, groupId }),
            });
            const result = await res.json() as { success: boolean; error?: string };
            if (result.success) {
              setStatus("success");
              setTimeout(() => router.push("/groups"), 1800);
            } else {
              setError(result.error ?? "Payment capture failed. Please contact support.");
              setStatus("error");
            }
          } catch {
            setError("Network error. Your payment may have gone through — check your email before retrying.");
            setStatus("error");
          }
        },

        onError: () => {
          setError("Payment failed. Please try again or use a different card.");
          setStatus("ready");
        },

        onCancel: () => { setError(null); setStatus("ready"); },

      }).render("#paypal-button-container").catch(() => {
        setError("PayPal failed to render. Please refresh the page.");
        setStatus("error");
      });
    };

    script.onerror = () => {
      setError("Failed to load PayPal. Check your connection and refresh.");
      setStatus("error");
    };

    document.body.appendChild(script);
  }, [groupId, amount, router]);

  if (status === "success") {
    return (
      <div className="text-center py-8 space-y-3">
        <CheckCircle size={48} className="mx-auto" style={{ color: "#059669" }} />
        <div className="font-bold text-lg" style={{ color: "#0F172A" }}>Payment successful! 🎉</div>
        <div className="text-sm" style={{ color: "#64748b" }}>Taking you to your group...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center text-sm font-bold mb-3" style={{ color: "#0F172A" }}>
        Join <span style={{ color: "#0891B2" }}>{groupName}</span> · ${amount.toFixed(0)} one-time
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center py-6 gap-2" style={{ color: "#94a3b8" }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading payment...</span>
        </div>
      )}

      {error && (
        <div className="text-sm rounded-xl px-4 py-3 mb-2"
          style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}>
          {error}
        </div>
      )}

      <div id="paypal-button-container" />

      <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
        Secured by PayPal · No account required · Pay with card or PayPal
      </p>
    </div>
  );
}