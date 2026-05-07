"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check, AlertCircle } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { CountrySelector } from "@/components/auth/country-selector";
import { useTheme } from "@/components/theme-provider";
import type { CountryCode } from "@/lib/types";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const inputCls = "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-slate-200 placeholder:text-slate-400 text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all";

type Step = 1 | 2 | 3;

export default function SignUpPage() {
  const router = useRouter();
  const { setCountry } = useTheme();

  const [step,     setStep]     = useState<Step>(1);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [country,  setCountryLocal] = useState<CountryCode | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleStep1 = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(null);
    setStep(2);
  };

  const handleStep2 = async () => {
    setLoading(true); setError(null);

    const sb = getClient();
    const { data, error: signUpError } = await sb.auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    // If email confirmation is OFF in Supabase, user is immediately logged in
    // If email confirmation is ON, session will be null until they confirm
    const isLoggedIn = !!data.session;

    if (data.user && country) {
      await sb.from("profiles").upsert({
        id: data.user.id,
        name,
        country,
        avatar_url: null,
      } as Record<string, unknown>);
      setCountry(country);
    }

    setLoading(false);

    // If already logged in (email confirm OFF) — go straight to dashboard
    if (isLoggedIn) {
      window.location.replace("/dashboard");
      return;
    }

    // Otherwise show "check your email" step
    setStep(3);
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(0,212,255,0.15)",
    boxShadow: "0 4px 24px rgba(0,212,255,0.06)",
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm" style={{ color: "#64748b" }}>
          {step === 1 && "Create your account"}
          {step === 2 && "Pick your team"}
          {step === 3 && "You're in!"}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={step >= s ? {
                background: "linear-gradient(135deg, #00D4FF, #00FF88)",
                color: "#0B141B",
              } : {
                background: "#f1f5f9",
                color: "#94a3b8",
                border: "1px solid #e2e8f0",
              }}>
              {step > s ? <Check size={12} /> : s}
            </div>
            {s < 3 && <div className="w-8 h-px" style={{ background: step > s ? "#00D4FF" : "#e2e8f0" }} />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6 sm:p-8" style={cardStyle}>

        {/* Step 1 — Account details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase mb-0.5" style={{ color: "#0F172A" }}>Your details</h2>
              <p className="text-sm" style={{ color: "#64748b" }}>Quick — takes 30 seconds.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#64748b" }}>Display name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                <input type="text" placeholder="How your friends will see you" value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleStep1()}
                  className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#64748b" }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#64748b" }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                <input type={showPass ? "text" : "password"} placeholder="Min 8 characters" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleStep1()}
                  className={inputCls} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#94a3b8" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button onClick={handleStep1} disabled={!name || !email || password.length < 8}
              size="md" className="w-full" rightIcon={<ArrowRight size={16} />}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2 — Country */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase mb-0.5" style={{ color: "#0F172A" }}>Pick your team</h2>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Your team colors become the app&apos;s theme. You can change this later.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            <CountrySelector value={country} onChange={setCountryLocal} />

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setStep(1)} variant="outline" size="md" className="flex-1">Back</Button>
              <Button onClick={handleStep2} loading={loading} size="md" className="flex-1"
                rightIcon={<ArrowRight size={16} />}>
                {country ? "Create account" : "Skip for now"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Check email */}
        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <Mail size={28} style={{ color: "#0891B2" }} />
            </div>
            <h2 className="font-display text-3xl uppercase" style={{ color: "#0F172A" }}>
              Check your email!
            </h2>
            <p className="text-sm" style={{ color: "#64748b" }}>
              We sent a confirmation link to <strong style={{ color: "#0F172A" }}>{email}</strong>.
              Click it to verify your account and you&apos;ll be taken straight to your dashboard.
            </p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Already confirmed?{" "}
              <a href="/signin" style={{ color: "#0891B2", fontWeight: "bold" }}>Sign in here</a>
            </p>
          </div>
        )}
      </div>

      {step === 1 && (
        <p className="text-center text-sm mt-5" style={{ color: "#64748b" }}>
          Already have an account?{" "}
          <Link href="/signin" className="font-bold transition-colors" style={{ color: "#0891B2" }}>
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}