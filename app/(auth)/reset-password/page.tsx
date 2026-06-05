"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Check, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NeonBar } from "@/components/ui/neon-bar";

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

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true); setError(null);
    const sb = createClient();
    const { error: resetError } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://cupclash.live/auth/callback?next=/update-password',
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  };

  return (
    <>
      {/* Logo block */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
        <img src="/icons/icon-192.png" width={52} height={52} alt="CupClash"
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
          {sent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }} className="space-y-4">
              <div style={{
                height: 64, width: 64, borderRadius: "50%", margin: "0 auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)",
              }}>
                <Check size={28} style={{ color: "#00FF88" }} />
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "white", textTransform: "uppercase", margin: 0 }}>
                Check your email
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", margin: 0 }}>
                We sent a reset link to{" "}
                <strong style={{ color: "white" }}>{email}</strong>. It expires in 1 hour.
              </p>
              <Link href="/signin">
                <button style={{
                  width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.7)", fontWeight: 700, fontFamily: "var(--font-ui)",
                  borderRadius: 12, padding: "13px", cursor: "pointer", fontSize: 14, marginTop: 8,
                }}>
                  Back to sign in
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "white", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Forgot password?
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)", margin: 0 }}>
                  Enter your email and we&apos;ll send a reset link.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: 6 }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.35)" }} />
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,255,136,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.1)"; }}
                    onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                    className="placeholder:text-[rgba(255,255,255,0.3)]"
                    style={{ ...inputStyle, padding: "12px 16px 12px 40px" }} />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!email || loading}
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B", fontWeight: 700, fontFamily: "var(--font-ui)",
                  borderRadius: 12, padding: "13px", width: "100%", border: "none",
                  boxShadow: "0 0 20px rgba(0,255,136,0.25)",
                  opacity: (!email || loading) ? 0.45 : 1,
                  cursor: (!email || loading) ? "not-allowed" : "pointer",
                  fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, transition: "all 0.15s",
                }}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  : <><span>Send reset link</span><ArrowRight size={16} /></>}
              </button>
            </>
          )}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)", margin: 0 }}>
        Remember it?{" "}
        <Link href="/signin" style={{ color: "#00FF88", fontWeight: 700 }}>Sign in</Link>
      </p>
    </>
  );
}
