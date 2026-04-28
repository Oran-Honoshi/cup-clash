"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword]         = useState("");
  const [confirm,  setConfirm]          = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [loading,  setLoading]          = useState(false);
  const [done,     setDone]             = useState(false);
  const [error,    setError]            = useState<string | null>(null);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  // Supabase sends an access_token in the URL hash after clicking the reset link
  useEffect(() => {
    async function checkSession() {
      const sb = getClient();
      const { data: { session } } = await sb.auth.getSession();
      setValidSession(!!session);
    }
    checkSession();
  }, []);

  const handleUpdate = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError(null);

    const sb = getClient();
    const { error: updateError } = await sb.auth.updateUser({ password });
    setLoading(false);

    if (updateError) { setError(updateError.message); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  };

  const inputCls = cn(
    "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white",
    "bg-white/[0.06] border border-white/[0.12] placeholder:text-pitch-500",
    "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
  );

  if (validSession === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Logo size="lg" />
        <p className="text-pitch-400 text-sm">Verifying reset link...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div>
        <div className="flex flex-col items-center mb-8"><Logo size="lg" /></div>
        <div className="glass-strong rounded-2xl p-8 text-center space-y-4">
          <AlertCircle size={36} className="text-danger mx-auto" />
          <h2 className="font-display text-2xl uppercase text-white">Link expired</h2>
          <p className="text-pitch-400 text-sm">
            This password reset link has expired or already been used.
            Request a new one below.
          </p>
          <Button onClick={() => router.push("/reset-password")} size="md" className="w-full">
            Request new link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm text-pitch-400">Set a new password</p>
      </div>

      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        {done ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center bg-success/20">
              <Check size={28} className="text-success" />
            </div>
            <h2 className="font-display text-2xl uppercase text-white">Password updated!</h2>
            <p className="text-pitch-400 text-sm">Taking you to the dashboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase text-white mb-0.5">New password</h2>
              <p className="text-sm text-pitch-400">Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">
                New password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
                <input type={showPass ? "text" : "password"} placeholder="Min 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pitch-500 hover:text-pitch-300">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-[11px] text-danger mt-1.5">At least 8 characters required</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
                <input type={showPass ? "text" : "password"} placeholder="Same password again"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleUpdate()}
                  className={inputCls} />
              </div>
              {confirm.length > 0 && confirm !== password && (
                <p className="text-[11px] text-danger mt-1.5">Passwords don&apos;t match</p>
              )}
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
