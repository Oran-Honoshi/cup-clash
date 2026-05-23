// components/layout/stadium-layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// COSMETIC ONLY — wraps all inner app pages with the immersive stadium bg.
// Does NOT touch routing, auth, or any functional logic.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { ReactNode } from "react";

interface StadiumLayoutProps {
  children: ReactNode;
  /** Optionally centre content vertically (default: true for auth pages, false for scrollable app pages) */
  centred?: boolean;
}

export function StadiumLayout({ children, centred = false }: StadiumLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 font-sans antialiased text-white selection:bg-emerald-500 selection:text-black">

      {/* ── Layer 1: Stadium background image ── */}
      {/* Replace the CSS gradient with your actual stadium image once available:       */}
      {/* backgroundImage: "url('/assets/images/stadium-bg.jpg')"                       */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 60% at 50% 100%, #0a3d1a 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 20%, rgba(139,92,246,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 80% 40% at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 60%),
            linear-gradient(180deg, #0d0820 0%, #111827 30%, #0a2215 65%, #051a0d 100%)
          `,
        }}
      />

      {/* ── Layer 2: Floodlight cone effects ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Left floodlight */}
        <div
          className="absolute top-0 left-[15%]"
          style={{
            width: 2,
            height: "45%",
            background: "linear-gradient(180deg, rgba(255,255,220,0.7) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 left-[15%] -translate-x-1/2"
          style={{
            width: 200,
            height: "55%",
            background: "linear-gradient(180deg, rgba(255,255,220,0.05) 0%, transparent 100%)",
            clipPath: "polygon(45% 0%, 55% 0%, 90% 100%, 10% 100%)",
          }}
        />
        {/* Center floodlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 3,
            height: "40%",
            background: "linear-gradient(180deg, rgba(255,255,220,0.8) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 280,
            height: "60%",
            background: "linear-gradient(180deg, rgba(255,255,200,0.06) 0%, transparent 100%)",
            clipPath: "polygon(45% 0%, 55% 0%, 85% 100%, 15% 100%)",
          }}
        />
        {/* Right floodlight */}
        <div
          className="absolute top-0 right-[15%]"
          style={{
            width: 2,
            height: "45%",
            background: "linear-gradient(180deg, rgba(255,255,220,0.7) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 right-[15%] translate-x-1/2"
          style={{
            width: 200,
            height: "55%",
            background: "linear-gradient(180deg, rgba(255,255,220,0.05) 0%, transparent 100%)",
            clipPath: "polygon(45% 0%, 55% 0%, 90% 100%, 10% 100%)",
          }}
        />
        {/* Purple side glows (crowd atmosphere) */}
        <div
          className="absolute top-[10%] left-0 w-32 h-64"
          style={{ background: "radial-gradient(ellipse at left, rgba(139,92,246,0.2) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-[10%] right-0 w-32 h-64"
          style={{ background: "radial-gradient(ellipse at right, rgba(139,92,246,0.2) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Layer 3: Pitch (bottom) ── */}
      <div
        className="absolute bottom-0 left-[-20%] right-[-20%] z-0 pointer-events-none"
        style={{
          height: "38%",
          background: "linear-gradient(180deg, #0d3d1a 0%, #0f4a1e 40%, #114f20 70%, #0d3d18 100%)",
          borderRadius: "50% 50% 0 0 / 30% 30% 0 0",
        }}
      >
        {/* Pitch line markings */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect x="12" y="5" width="76" height="90" fill="none" stroke="white" strokeWidth="0.4"/>
          <line x1="12" y1="50" x2="88" y2="50" stroke="white" strokeWidth="0.4"/>
          <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.4"/>
          <circle cx="50" cy="50" r="0.8" fill="white"/>
          <rect x="32" y="5" width="36" height="14" fill="none" stroke="white" strokeWidth="0.4"/>
          <rect x="32" y="81" width="36" height="14" fill="none" stroke="white" strokeWidth="0.4"/>
        </svg>
      </div>

      {/* ── Layer 4: Vignette / depth overlay ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(13,8,32,0.35) 0%, transparent 35%, transparent 55%, rgba(5,15,10,0.7) 100%)",
        }}
      />

      {/* ── Main content layer ── */}
      <div
        className={[
          "relative z-10 min-h-screen",
          centred
            ? "flex flex-col items-center justify-center p-4"
            : "flex flex-col items-center p-4 pt-6",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

// ── Convenience: centred layout for auth/single-card screens ──────────────────
export function StadiumLayoutCentred({ children }: { children: ReactNode }) {
  return <StadiumLayout centred>{children}</StadiumLayout>;
}