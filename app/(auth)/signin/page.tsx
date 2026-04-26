"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export default function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: wire to Supabase auth
    await new Promise((r) => setTimeout(r, 1000));
    window.location.href = "/dashboard";
  };

  return (
    <div>
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm text-pitch-400">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl uppercase text-white mb-0.5">
              Welcome back
            </h2>
            <p className="text-sm text-pitch-400">
              Sign in to see your predictions
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400">
                Password
              </label>
              <a
                href="#"
                className="text-[11px] text-pitch-500 hover:text-pitch-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className={cn(inputCls, "pr-10")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pitch-500 hover:text-pitch-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!form.email || !form.password}
            size="md"
            className="w-full mt-2"
            rightIcon={<ArrowRight size={16} />}
          >
            Sign in
          </Button>
        </div>
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-pitch-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-bold text-pitch-300 hover:text-white transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}

const inputCls = cn(
  "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white",
  "bg-white/[0.06] border border-white/[0.12]",
  "placeholder:text-pitch-500",
  "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
  "transition-all duration-150"
);
