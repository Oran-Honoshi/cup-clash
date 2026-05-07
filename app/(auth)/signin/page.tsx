"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { SocialAuth } from "@/components/auth/social-auth";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const inputCls = [
  "w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none",
  "bg-white border text-slate-900 placeholder:text-slate-400",
  "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100",
  "border-slate-200",
].join(" ");

export default function SignInPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    const sb = getClient();
    const { error: signInError } = await sb.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    // Hard full-page redirect — forces browser to send cookies to server
    const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
    window.location.replace(next);
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm" style={{ color: "#64748b" }}>Sign in to your account</p>
      </div>

      <div className="rounded-2xl p-6 sm:p-8"
        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,212,255,0.15)", boxShadow: "0 4px 24px rgba(0,212,255,0.06)" }}>
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl uppercase mb-0.5" style={{ color: "#0F172A" }}>Welcome back</h2>
            <p className="text-sm" style={{ color: "#64748b" }}>Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#64748b" }}>Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                className={inputCls} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Password</label>
              <Link href="/reset-password" className="text-[11px] transition-colors hover:text-cyan-600" style={{ color: "#94a3b8" }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                className={inputCls} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "#94a3b8" }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button onClick={handleSignIn} loading={loading} disabled={!email || !password}
            size="md" className="w-full" rightIcon={<ArrowRight size={16} />}>
            Sign in
          </Button>
        </div>

        <SocialAuth className="mt-4" />
      </div>

      <p className="text-center text-sm mt-5" style={{ color: "#64748b" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold transition-colors hover:text-cyan-600" style={{ color: "#0891B2" }}>
          Create one free
        </Link>
      </p>
    </div>
  );
}