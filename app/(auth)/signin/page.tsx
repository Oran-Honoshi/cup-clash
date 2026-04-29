"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SigninPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm text-pitch-400">Sign in to your account</p>
      </div>

      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl uppercase text-white mb-0.5">Welcome back</h2>
            <p className="text-sm text-pitch-400">Sign in to see your predictions</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400">Password</label>
              <Link href="/reset-password" className="text-[11px] text-pitch-500 hover:text-pitch-300 transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
              <input type={showPassword ? "text" : "password"} placeholder="Your password" value={form.password} onChange={e => update("password", e.target.value)} className={cn(inputCls, "pr-10")} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pitch-500 hover:text-pitch-300">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button onClick={handleSubmit} loading={loading} disabled={!form.email || !form.password} size="md" className="w-full mt-2" rightIcon={<ArrowRight size={16} />}>
            Sign in
          </Button>
        </div>
      </div>

      <SocialAuth className="mt-4" />

      <p className="text-center text-sm text-pitch-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-pitch-300 hover:text-white transition-colors">Create one free</Link>
      </p>
    </div>
  );
}

import { SocialAuth } from "@/components/auth/social-auth";

const inputCls = cn(
  "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white",
  "bg-white/[0.06] border border-white/[0.12]",
  "placeholder:text-pitch-500",
  "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
  "transition-all duration-150"
);
