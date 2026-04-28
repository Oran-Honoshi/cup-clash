"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Check, AlertCircle } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);

    const sb = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
        <p className="mt-2 text-sm text-pitch-400">Reset your password</p>
      </div>

      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center bg-success/20">
              <Check size={28} className="text-success" />
            </div>
            <h2 className="font-display text-2xl uppercase text-white">Check your email</h2>
            <p className="text-pitch-400 text-sm">
              We sent a password reset link to <strong className="text-white">{email}</strong>.
              It expires in 1 hour.
            </p>
            <Link href="/signin">
              <Button variant="outline" size="md" className="w-full mt-2">Back to sign in</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase text-white mb-0.5">Forgot password?</h2>
              <p className="text-sm text-pitch-400">Enter your email and we&apos;ll send a reset link.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white",
                    "bg-white/[0.06] border border-white/[0.12] placeholder:text-pitch-500",
                    "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  )} />
              </div>
            </div>

            <Button onClick={handleSubmit} loading={loading} disabled={!email} size="md"
              className="w-full" rightIcon={<ArrowRight size={16} />}>
              Send reset link
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-pitch-500 mt-5">
        Remember it?{" "}
        <Link href="/signin" className="font-bold text-pitch-300 hover:text-white transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
