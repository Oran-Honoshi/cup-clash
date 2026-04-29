"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Check, AlertCircle } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const inputCls = "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-slate-200 placeholder:text-slate-400 text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all";

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true); setError(null);
    const sb = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { error: resetError } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm" style={{ color: "#64748b" }}>Reset your password</p>
      </div>

      <div className="rounded-2xl p-6 sm:p-8"
        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,212,255,0.15)", boxShadow: "0 4px 24px rgba(0,212,255,0.06)" }}>
        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center"
              style={{ background: "rgba(5,150,105,0.1)" }}>
              <Check size={28} style={{ color: "#059669" }} />
            </div>
            <h2 className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>Check your email</h2>
            <p className="text-sm" style={{ color: "#64748b" }}>
              We sent a reset link to <strong style={{ color: "#0F172A" }}>{email}</strong>. It expires in 1 hour.
            </p>
            <Link href="/signin">
              <Button variant="outline" size="md" className="w-full mt-2">Back to sign in</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase mb-0.5" style={{ color: "#0F172A" }}>Forgot password?</h2>
              <p className="text-sm" style={{ color: "#64748b" }}>Enter your email and we&apos;ll send a reset link.</p>
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
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className={inputCls} />
              </div>
            </div>
            <Button onClick={handleSubmit} loading={loading} disabled={!email}
              size="md" className="w-full" rightIcon={<ArrowRight size={16} />}>
              Send reset link
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-sm mt-5" style={{ color: "#64748b" }}>
        Remember it?{" "}
        <Link href="/signin" className="font-bold transition-colors" style={{ color: "#0891B2" }}>Sign in</Link>
      </p>
    </div>
  );
}