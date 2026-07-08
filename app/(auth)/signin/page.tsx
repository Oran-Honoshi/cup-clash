"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NeonBar } from "@/components/ui/neon-bar";
import { BallLoader } from "@/components/ui/BallLoader";
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
  const [email,          setEmail]         = useState("");
  const [password,       setPassword]      = useState("");
  const [showPass,       setShowPass]      = useState(false);
  const [loading,        setLoading]       = useState(false);
  const [error,          setError]         = useState<string | null>(null);
  const [wrongProvider,     setWrongProvider]     = useState(false);
  const [googleConflict,    setGoogleConflict]    = useState(false);
  const [oauthFailed,       setOauthFailed]       = useState(false);
  const [accountDeactivated, setAccountDeactivated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "google_conflict") setGoogleConflict(true);
    else if (err === "oauth_failed") setOauthFailed(true);
    else if (err === "account_deactivated") setAccountDeactivated(true);
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true); setError(null); setWrongProvider(false);
    const sb = createClient();
    const { data, error: signInError } = await sb.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      if (signInError.message.toLowerCase().includes("invalid login credentials")) {
        setWrongProvider(true);
      } else {
        setError(signInError.message);
      }
      return;
    }
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

      {/* Prominent sign-up banner */}
      <Link href="/signup" style={{ textDecoration: "none" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,212,255,0.12))",
          border: "1px solid rgba(0,255,136,0.35)",
          borderRadius: 16,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={18} style={{ color: "#00FF88", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "white" }}>
                New to Cup Clash?
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                Create your free account — takes 30 seconds
              </div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 12, color: "#00FF88", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
            Sign up free <ArrowRight size={13} />
          </div>
        </div>
      </Link>

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

          {accountDeactivated && (
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>This account has been deactivated. Contact <a href="mailto:hello@cupclash.live" style={{ color: "#fca5a5", fontWeight: 700 }}>hello@cupclash.live</a> for support.</span>
            </div>
          )}

          {googleConflict && (
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>An account with this email already exists. Please sign in with your email and password instead.</span>
            </div>
          )}

          {oauthFailed && (
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>Google sign-in failed. Please try again or sign in with email below.</span>
            </div>
          )}

          {wrongProvider && (
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="shrink-0" />
                <span style={{ fontWeight: 700 }}>Can&apos;t sign in? Try these options:</span>
              </div>
              <ul className="space-y-1" style={{ paddingLeft: 22, listStyleType: "disc" }}>
                <li>Signed up with Google? Use <strong style={{ color: "#fde68a" }}>Continue with Google</strong> above</li>
                <li>Forgot your password? <a href="https://cupclash.live/reset-password" style={{ color: "#fde68a", fontWeight: 700, textDecoration: "underline" }}>Click here to reset it</a></li>
                <li>No account yet? <a href="https://cupclash.live/signup" style={{ color: "#fde68a", fontWeight: 700, textDecoration: "underline" }}>Sign up free</a></li>
              </ul>
            </div>
          )}

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
              <a href="https://cupclash.live/reset-password" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t("auth_forgot")}</a>
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
              ? <><BallLoader size="inline" label={null} /> {t("auth_signing_in")}</>
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
