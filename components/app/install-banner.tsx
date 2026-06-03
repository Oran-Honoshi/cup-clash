"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function AppInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("cupclash_install_banner_dismissed")) return;
    const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isMobile && !isStandalone) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("cupclash_install_banner_dismissed", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
      style={{ background: "rgba(0,212,255,0.08)", borderBottom: "1px solid rgba(0,212,255,0.15)" }}>
      <span className="min-w-0 overflow-hidden" style={{ color: "rgba(255,255,255,0.7)" }}>
        📱 Install Cup Clash for the best experience →{" "}
        <Link href="/install" className="font-bold underline" style={{ color: "#00D4FF" }}>
          How to install
        </Link>
      </span>
      <button onClick={dismiss} className="shrink-0 transition-opacity hover:opacity-70"
        style={{ color: "rgba(255,255,255,0.4)" }} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
