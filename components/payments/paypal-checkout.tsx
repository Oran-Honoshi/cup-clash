"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, RefreshCw } from "lucide-react";

interface PayPalCheckoutProps {
  groupId:    string;
  groupName:  string;
  amount:     number;
  capacity?:  number; // for corporate: 50 or 100
  containerId?: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: object) => { render: (selector: string) => Promise<void> };
    };
  }
}

export function PayPalCheckout({
  groupId, groupName, amount,
  capacity,
  containerId = "paypal-btn-container",
  onSuccess,
}: PayPalCheckoutProps) {
  const [status,  setStatus]  = useState<"loading" | "ready" | "success" | "error">("loading");
  const [error,   setError]   = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const mounted   = useRef(false);
  const router    = useRouter();
  const MAX       = 4;

  const mountButtons = useCallback(() => {
    if (!window.paypal) return false;

    const container = document.getElementById(containerId);
    if (!container) return false;
    container.innerHTML = ""; // clear before re-render

    setStatus("ready");
    setError(null);

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
          const endpoint = onSuccess ? "/api/paypal/capture-corporate" : "/api/paypal/capture-order";
          const res = await fetch(endpoint, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ orderID: data.orderID, groupId, capacity }),
          });
          const result = await res.json() as { success: boolean; error?: string };
          if (result.success) {
            setStatus("success");
            if (onSuccess) setTimeout(onSuccess, 1500);
            else setTimeout(() => router.push("/groups"), 1800);
          } else {
            setError(result.error ?? "Payment capture failed. Please contact support.");
            setStatus("error");
          }
        } catch {
          setError("Network error during capture. Check your email before retrying.");
          setStatus("error");
        }
      },

      onError:  () => { setError("Payment failed. Please try again."); setStatus("ready"); },
      onCancel: () => { setError(null); setStatus("ready"); },

    }).render(`#${containerId}`).catch((err: unknown) => {
      console.error("PayPal render error:", err);
    });

    return true;
  }, [groupId, amount, containerId, router, onSuccess]);

  const tryMount = useCallback((n: number) => {
    if (window.paypal) {
      mountButtons();
      return;
    }

    // SDK not ready yet — poll every 400ms, up to MAX attempts
    if (n >= MAX) {
      setError("PayPal could not load. Please check your connection and try again.");
      setStatus("error");
      return;
    }

    setTimeout(() => {
      setAttempt(n + 1);
      tryMount(n + 1);
    }, 400 * (n + 1));
  }, [mountButtons]);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    tryMount(0);
  }, [tryMount]);

  const handleRetry = () => {
    mounted.current = false;
    setStatus("loading");
    setError(null);
    setAttempt(0);
    tryMount(0);
  };

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
          <span className="text-sm">
            {attempt > 0 ? `Connecting to PayPal... (${attempt}/${MAX})` : "Loading payment..."}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 space-y-2"
          style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
          <p className="text-sm" style={{ color: "#dc2626" }}>{error}</p>
          <button onClick={handleRetry}
            className="flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "#0891B2" }}>
            <RefreshCw size={11} /> Try again
          </button>
        </div>
      )}

      <div id={containerId} />

      <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
        Secured by PayPal · No account required · Pay with card or PayPal
      </p>
      <p className="text-center text-xs">
        <a href="/contact" className="font-bold transition-colors hover:opacity-70"
          style={{ color: "#0891B2" }}>
          Need a hand getting set up? We&apos;re happy to help →
        </a>
      </p>
    </div>
  );
}