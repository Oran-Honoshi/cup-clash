"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

function getClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

const inputCls = "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white border border-slate-200 placeholder:text-slate-400 text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      const sb = getClient();
      const { data: { session } } = await sb.auth.getSession();
      setValidSession(!!session);
    }
    check();
  }, []);

  const handleUpdate = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true); setError(null);
    const sb = getClient();
    const { error: updateError } = await sb.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  };

  if (validSession === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Logo size="lg" />
        <p className="text-sm" style={{ color: "#64748b" }}>Verifying reset link...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div>
        <div className="flex flex-col items-center mb-8"><Logo size="lg" /></div>
        <div className="rounded-2xl p-8 text-center space-y-4"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <AlertCircle size={36} className="mx-auto" style={{ color: "#dc2626" }} />
          <h2 className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>Link expired</h2>
          <p className="text-sm" style={{ color: "#64748b" }}>This password reset link has expired or already been used.</p>
          <Button onClick={() => router.push("/reset-password")} size="md" className="w-full">Request new link</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm" style={{ color: "#64748b" }}>Set a new password</p>
      </div>

      <div className="rounded-2xl p-6 sm:p-8"
        style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,212,255,0.15)", boxShadow: "0 4px 24px rgba(0,212,255,0.06)" }}>
        {done ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center"
              style={{ background: "rgba(5,150,105,0.1)" }}>
              <Check size={28} style={{ color: "#059669" }} />
            </div>
            <h2 className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>Password updated!</h2>
            <p className="text-sm" style={{ color: "#64748b" }}>Taking you to the dashboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase mb-0.5" style={{ color: "#0F172A" }}>New password</h2>
              <p className="text-sm" style={{ color: "#64748b" }}>Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#64748b" }}>New password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                <input type={showPass ? "text" : "password"} placeholder="Min 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#64748b" }}>Confirm password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                <input type={showPass ? "text" : "password"} placeholder="Same password again"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleUpdate()}
                  className={inputCls} />
              </div>
            </div>

            <Button onClick={handleUpdate} loading={loading}
              disabled={password.length < 8 || password !== confirm}
              size="md" className="w-full" rightIcon={<ArrowRight size={16} />}>
              Update password
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}