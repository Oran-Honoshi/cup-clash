// components/auth/signin-glass-skin.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Glassmorphic SKIN for the Sign In page (slide 13 in mockups).
// Wrap your existing SignIn form JSX with these shell components.
// Every onChange, onSubmit, value, ref stays exactly as written.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { ReactNode } from "react";
import { GlassCard, GlassInput, PrimaryGlowButton, GhostButton } from "@/components/ui/glass-primitives";
import { StadiumLayoutCentred } from "@/components/layout/stadium-layout";
import { Logo } from "@/components/logo";
import Link from "next/link";

/**
 * Drop-in shell for your sign-in page.
 * Replace the outer div of your existing page with <SignInGlassSkin>
 * and keep all your form state, handlers, and submit logic inside.
 *
 * Usage:
 *   <SignInGlassSkin>
 *     {your existing form JSX, unchanged}
 *   </SignInGlassSkin>
 */
export function SignInGlassSkin({ children }: { children: ReactNode }) {
  return (
    <StadiumLayoutCentred>
      <GlassCard accent="green" className="p-8 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
            <Logo />
          </div>
          <div className="text-center">
            <h1 className="font-display font-black uppercase text-2xl tracking-tight text-white">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Cup Clash · World Cup 2026</p>
          </div>
        </div>

        {/* Your form goes here — all state/handlers unchanged */}
        {children}

        {/* Sign up link */}
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
            Create one free →
          </Link>
        </p>
      </GlassCard>
    </StadiumLayoutCentred>
  );
}

// ── Re-export primitives so sign-in page can use them directly ────────────────
export { GlassInput, PrimaryGlowButton, GhostButton };