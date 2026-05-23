// components/auth/signup-glass-skin.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Glassmorphic SKIN for Sign Up / Create Account (slide 12 in mockups).
// Matches the "Cup Clash — Create Account" glass card with flag selector.
// Wrap your existing SignUp form children inside.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { ReactNode } from "react";
import { GlassCard, GlassInput, PrimaryGlowButton, GhostButton } from "@/components/ui/glass-primitives";
import { StadiumLayoutCentred } from "@/components/layout/stadium-layout";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function SignUpGlassSkin({ children }: { children: ReactNode }) {
  return (
    <StadiumLayoutCentred>
      <GlassCard accent="green" className="p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
            <Logo />
          </div>
          <div className="text-center">
            <h1 className="font-display font-black uppercase text-2xl tracking-tight text-white">
              Create Account
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Join the 2026 World Cup prediction game</p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-2 flex-wrap">
          {["⚽ Free to start", "🏆 104 matches", "👥 Private groups"].map((f) => (
            <span key={f} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/8 text-emerald-400 border border-emerald-500/20">
              {f}
            </span>
          ))}
        </div>

        {/* Your form goes here — all state/handlers unchanged */}
        {children}

        {/* Sign in link */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-emerald-400 font-semibold hover:underline">
            Sign in →
          </Link>
        </p>

        {/* Privacy consent */}
        <p className="text-center text-[10px] text-slate-600 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-400">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-slate-400">Privacy Policy</Link>.
          We store only what&apos;s needed. No ads, ever.
        </p>
      </GlassCard>
    </StadiumLayoutCentred>
  );
}

export { GlassInput, PrimaryGlowButton, GhostButton };