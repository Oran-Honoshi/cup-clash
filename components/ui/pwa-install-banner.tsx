// Add this to the existing DashboardPopups / welcome modal
// This is the PWA install banner shown after first login

"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Download } from "lucide-react";

export function PWAInstallBanner() {
  const [show,      setShow]      = useState(false);
  const [isIOS,     setIsIOS]     = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Only show if not already installed and not dismissed
    const dismissed = localStorage.getItem("cupclash_pwa_dismissed");
    if (dismissed) return;

    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const android = /Android/.test(ua);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (!isStandalone && (iOS || android)) {
      setIsIOS(iOS);
      setIsAndroid(android);
      // Show after 3 seconds so it doesn't interrupt the first experience
      setTimeout(() => setShow(true), 3000);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("cupclash_pwa_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-2xl p-4 shadow-2xl"
        style={{ background: "white", border: "1px solid rgba(0,212,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div className="h-0.5 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
            <Smartphone size={20} style={{ color: "#0B141B" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm" style={{ color: "#0F172A" }}>
              Add Cup Clash to your home screen
            </div>
            <div className="text-xs mt-1 leading-relaxed" style={{ color: "#64748b" }}>
              {isIOS
                ? "Tap the Share button (□↑) → 'Add to Home Screen' for the full app experience."
                : "Tap Menu (⋮) → 'Add to Home Screen' to install the app."}
            </div>
          </div>
          <button onClick={dismiss} className="shrink-0 mt-0.5"
            style={{ color: "#94a3b8" }}>
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}