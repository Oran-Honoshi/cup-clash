"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NeonBar } from "@/components/ui/neon-bar";
import { SocialAuth } from "@/components/auth/social-auth";
import { useLocale } from "@/components/i18n/locale-provider";

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

export default function SignInPage() {
  const { t } = useLocale();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true); setError(null);
    const sb = createClient();
    const { data, error: signInError } = await sb.auth.signInWithPassword({ email, password });
    if (signInError) { setLoading(false); setError(signInError.message); return; }
    if (!data.session) { setError("Sign in succeeded but no session was created."); setLoading(false); return; }
    const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
    window.location.replace(next);
  };

  const isDisabled = !email || !password || loading;

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

          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "white", textTransform: "uppercase", margin: "0 0 4px" }}>
              {t("auth_welcome_back")}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-ui)", margin: 0 }}>
              {t("auth_signin_sub")}
            </p>
          </div>

          <SocialAuth />

          {/* Email divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-ui)", fontWeight: 600, whiteSpace: "nowrap" }}>{t("auth_continue_email")}</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
            </div>
          )}

          <div>
            <label style={labelStyle}>{t("auth_email")}</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.35)" }} />
              <input type="email" placeholder={t("auth_ph_email")} value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                onFocus={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(0,255,136,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,136,0.1)"; }}
                onBlur={(e: { target: HTMLInputElement }) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                className="placeholder:text-[rgba(255,255,255,0.3)]"
                style={{ ...inputStyle, padding: "12px 16px 12px 40px" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>{t("auth_password")}</label>
              <Link href="/reset-password" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t("auth_forgot")}</Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.35)" }} />
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
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
            onClick={handleSignIn}
            disabled={isDisabled}
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
              opacity: isDisabled ? 0.45 : 1,
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> {t("auth_signing_in")}</>
              : <><span>{t("auth_signin")}</span><ArrowRight size={16} /></>}
          </button>

        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ui)", margin: 0 }}>
        {t("auth_no_account")}{" "}
        <Link href="/signup" style={{ color: "#00FF88", fontWeight: 700 }}>{t("auth_create_free")}</Link>
      </p>
    </>
  );
}
