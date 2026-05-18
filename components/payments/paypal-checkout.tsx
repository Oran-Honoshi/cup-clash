"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, RefreshCw } from "lucide-react";

interface PayPalCheckoutProps {
  groupId:   string;
  groupName: string;
  amount:    number;
  onSuccess?: () => void; // optional callback instead of router push
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: object) => { render: (selector: string) => Promise<void> };
    };
  }
}

const PAYPAL_CONTAINER_ID = "paypal-button-container";

export function PayPalCheckout({ groupId, groupName, amount, onSuccess }: PayPalCheckoutProps) {
  const [status,   setStatus]   = useState<"loading" | "ready" | "success" | "error">("loading");
  const [error,    setError]    = useState<string | null>(null);
  const [retries,  setRetries]  = useState(0);
  const rendered   = useRef(false);
  const scriptRef  = useRef<HTMLScriptElement | null>(null);
  const router     = useRouter();

  const MAX_RETRIES = 3;

  const mountButtons = useCallback(() => {
    if (!window.paypal) {
      setError("PayPal failed to initialize.");
      setStatus("error");
      return;
    }

    // Clear container before re-rendering
    const container = document.getElementById(PAYPAL_CONTAINER_ID);
    if (container) container.innerHTML = "";

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
            if (onSuccess) {
              setTimeout(onSuccess, 1500);
            } else {
              setTimeout(() => router.push("/groups"), 1800);
            }
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

    }).render(`#${PAYPAL_CONTAINER_ID}`).catch(() => {
      setError("PayPal buttons failed to render.");
      setStatus("error");
    });
  }, [groupId, amount, router, onSuccess]);

  const loadPayPal = useCallback((attempt: number) => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) { setError("PayPal not configured."); setStatus("error"); return; }

    // If already loaded in window, just mount buttons
    if (window.paypal) { mountButtons(); return; }

    // Remove any stale script
    if (scriptRef.current) {
      document.body.removeChild(scriptRef.current);
      scriptRef.current = null;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
    script.async = true;

    script.onload = () => {
      mountButtons();
    };

    script.onerror = () => {
      if (attempt < MAX_RETRIES) {
        // Auto-retry with exponential backoff
        const delay = 1500 * (attempt + 1);
        setError(`Connection issue — retrying in ${delay / 1000}s... (${attempt + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          setRetries(attempt + 1);
          loadPayPal(attempt + 1);
        }, delay);
      } else {
        setError("Failed to load PayPal after multiple attempts. Please check your connection and refresh the page.");
        setStatus("error");
      }
    };

    scriptRef.current = script;
    document.body.appendChild(script);
  }, [mountButtons]);

  useEffect(() => {
    if (rendered.current) return;
    rendered.current = true;
    loadPayPal(0);

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [loadPayPal]);

  const handleRetry = () => {
    rendered.current = false;
    setStatus("loading");
    setError(null);
    setRetries(0);
    loadPayPal(0);
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
            {retries > 0 ? `Retrying... (${retries}/${MAX_RETRIES})` : "Loading payment..."}
          </span>
        </div>
      )}

      {error && (
        <div className="text-sm rounded-xl px-4 py-3 space-y-2"
          style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}>
          <div>{error}</div>
          {status === "error" && retries >= MAX_RETRIES && (
            <button onClick={handleRetry}
              className="flex items-center gap-1.5 text-xs font-bold underline">
              <RefreshCw size={11} /> Try again
            </button>
          )}
        </div>
      )}

      <div id={PAYPAL_CONTAINER_ID} />

      <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
        Secured by PayPal · No account required · Pay with card or PayPal
      </p>
      <p className="text-center text-xs mt-1">
        <a href="/contact" className="font-bold transition-colors hover:opacity-70"
          style={{ color: "#0891B2" }}>
          Need a hand getting set up? We&apos;re happy to help →
        </a>
      </p>
    </div>
  );
}