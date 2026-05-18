// components/payments/paypal-script-loader.tsx
// Global PayPal script preloader — add to app layout
// This ensures PayPal SDK is available before any checkout component mounts

"use client";

import { useEffect } from "react";

export function PayPalScriptLoader() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) return;
    if (window.paypal) return; // already loaded
    if (document.querySelector("script[src*='paypal']")) return; // already injecting

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.defer = true;
    script.id = "paypal-sdk";
    document.head.appendChild(script);
  }, []);

  return null;
}