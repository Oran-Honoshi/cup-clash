"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { CountrySelector } from "@/components/auth/country-selector";
import { useTheme } from "@/components/theme-provider";
import { NeonBar } from "@/components/ui/neon-bar";
import type { CountryCode } from "@/lib/types";

function getClient() {
  return createSupabaseClient();
}

const inputStyle = {
  width: "100%",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#ffffff",
  fontSize: 14,
  fontFamily: "var(--font-ui)",
  outline: "none",
  transition: "all 0.15s",
} as const;

const labelStyle = {
  display: "block",
  fontSize: 10,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.5)",
  fontFamily: "var(--font-ui)",
  fontWeight: 700,
  marginBottom: 6,
};

type Step = 1 | 2 | 3;

export default function SignUpPage() {
  const router = useRouter();
  const { setCountry } = useTheme();

  const [step,         setStep]        = useState<Step>(1);
  const [name,         setName]        = useState("");
  const [email,        setEmail]       = useState("");
  const [password,     setPassword]    = useState("");
  const [showPass,     setShowPass]    = useState(false);
  const [country,      setCountryLocal] = useState<CountryCode | null>(null);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState<string | null>(null);

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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(new URLSearchParams(window.location.search).get("next") ?? "/dashboard")}`,
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
      const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      window.location.replace(next);
      return;
    }

    // Otherwise show "check your email" step
    setStep(3);
  };

  return (
    <>
      {/* Logo block */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
        <img src="/icon-192.png" width={52} height={52} alt="CupClash"
          style={{ borderRadius: 16, boxShadow: "0 0 24px rgba(0,255,136,0.3)", display: "block" }} />
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "white", lineHeight: 1 }}>
          Cup<span style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Clash</span>
        </div>
        <div style={{ fontSize: 10, color: "#00D4FF", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-ui)" }}>
          World Cup 2026
        </div>
      </div>

      {/* Glass card */}
      <div style={{
        background: "rgba(18,14,38,0.72)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
        borderRadius: 28,
        overflow: "hidden",
      }}>
        <NeonBar />
        <div className="space-y-4" style={{ padding: "32px 28px" }}>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  height: 28, width: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "var(--font-ui)",
                  transition: "all 0.2s",
                  ...(step > s ? {
                    background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                    color: "#0B141B",
                  } : step === s ? {
                    background: "rgba(0,212,255,0.1)",
                    border: "2px solid #00D4FF",
                    color: "white",
                  } : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.3)",
                  }),
                }}>
                  {step > s ? <Check size={12} /> : s}
                </div>
                {s < 3 && (
                  <div style={{
                    width: 32, height: 1,
                    background: step > s ? "#00D4FF" : "rgba(255,255,255,0.12)",
                    transition: "all 0.2s",
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1 — Account details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "white", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Create Account
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)", margin: 0 }}>
                  Quick — takes 30 seconds.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
                </div>
              )}

              <div>
                <label style={labelStyle}>Display name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.35)" }} />
                  <input type="text" placeholder="How your friends will see you" value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleStep1()}
                    onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,255,136,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.1)"; }}
                    onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                    className="placeholder:text-[rgba(255,255,255,0.3)]"
                    style={{ ...inputStyle, padding: "12px 16px 12px 40px" }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.35)" }} />
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,255,136,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.1)"; }}
                    onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                    className="placeholder:text-[rgba(255,255,255,0.3)]"
                    style={{ ...inputStyle, padding: "12px 16px 12px 40px" }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.35)" }} />
                  <input type={showPass ? "text" : "password"} placeholder="Min 8 characters" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleStep1()}
                    onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,255,136,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.1)"; }}
                    onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                    className="placeholder:text-[rgba(255,255,255,0.3)]"
                    style={{ ...inputStyle, padding: "12px 44px 12px 40px" }} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleStep1}
                disabled={!name || !email || password.length < 8}
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B",
                  fontWeight: 700,
                  fontFamily: "var(--font-ui)",
                  borderRadius: 12,
                  padding: "13px",
                  width: "100%",
                  border: "none",
                  boxShadow: "0 0 20px rgba(0,255,136,0.25)",
                  opacity: (!name || !email || password.length < 8) ? 0.45 : 1,
                  cursor: (!name || !email || password.length < 8) ? "not-allowed" : "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s",
                }}
              >
                <span>Continue</span><ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2 — Country */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "white", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Pick your team
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)", margin: 0 }}>
                  Your team colors become the app&apos;s theme. You can change this later.
                </p>
              </div>

              {/* Feature pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["⚽ Free to start", "🏆 104 matches", "👥 Private groups"].map(pill => (
                  <span key={pill} style={{
                    fontSize: 11, fontFamily: "var(--font-ui)", fontWeight: 700,
                    padding: "4px 10px", borderRadius: 100,
                    background: "rgba(0,255,136,0.08)",
                    color: "#00FF88",
                    border: "1px solid rgba(0,255,136,0.2)",
                  }}>{pill}</span>
                ))}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
                </div>
              )}

              <CountrySelector value={country} onChange={setCountryLocal} />

              <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 700,
                    fontFamily: "var(--font-ui)",
                    borderRadius: 12,
                    padding: "13px",
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "all 0.15s",
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleStep2}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                    color: "#0B141B",
                    fontWeight: 700,
                    fontFamily: "var(--font-ui)",
                    borderRadius: 12,
                    padding: "13px",
                    border: "none",
                    boxShadow: "0 0 20px rgba(0,255,136,0.25)",
                    opacity: loading ? 0.45 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.15s",
                  }}
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Creating...</>
                    : <><span>{country ? "Create account" : "Skip for now"}</span><ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Check email */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "16px 0" }} className="space-y-4">
              <div style={{
                height: 64, width: 64, borderRadius: "50%", margin: "0 auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)",
              }}>
                <Mail size={28} style={{ color: "#00D4FF" }} />
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "white", textTransform: "uppercase", margin: 0 }}>
                Check your email!
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", margin: 0 }}>
                We sent a confirmation link to{" "}
                <strong style={{ color: "white" }}>{email}</strong>.{" "}
                Click it to verify your account and you&apos;ll be taken straight to your dashboard.
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)", margin: 0 }}>
                Already confirmed?{" "}
                <a href="/signin" style={{ color: "#00FF88", fontWeight: 700 }}>Sign in here</a>
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Footer — step 1 only */}
      {step === 1 && (
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)", margin: 0 }}>
          Already have an account?{" "}
          <Link href="/signin" style={{ color: "#00FF88", fontWeight: 700 }}>Sign in</Link>
        </p>
      )}
    </>
  );
}
