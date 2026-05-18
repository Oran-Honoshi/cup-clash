"use client";

import { useEffect } from "react";

// Dispatches "PayPalScriptReady" event when SDK is fully loaded
// Add this to the root layout so PayPal is available app-wide

export function PayPalScriptLoader() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) return;

    // Already loaded
    if (window.paypal) {
      window.dispatchEvent(new Event("PayPalScriptReady"));
      return;
    }

    // Already injecting
    if (document.getElementById("paypal-sdk")) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.defer = true;
    script.id = "paypal-sdk";

    script.onload = () => {
      window.dispatchEvent(new Event("PayPalScriptReady"));
    };

    script.onerror = () => {
      console.warn("PayPal SDK failed to load on initial attempt");
      // Retry once after 2s
      setTimeout(() => {
        const existing = document.getElementById("paypal-sdk");
        if (existing) existing.remove();
        const retry = document.createElement("script");
        retry.src = script.src;
        retry.async = true;
        retry.id = "paypal-sdk";
        retry.onload = () => window.dispatchEvent(new Event("PayPalScriptReady"));
        document.head.appendChild(retry);
      }, 2000);
    };

    document.head.appendChild(script);
  }, []);

  return null;
}