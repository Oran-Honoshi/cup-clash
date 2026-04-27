"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/auth/country-selector";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CountryCode } from "@/lib/types";

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1, label: "Account"   },
  { n: 2, label: "Your team" },
  { n: 3, label: "Done"      },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country: null as CountryCode | null,
  });

  const update = (key: keyof typeof form, val: string | CountryCode | null) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleStep1 = () => {
    setError(null);
    if (form.name && form.email && form.password.length >= 8) {
      setStep(2);
    }
  };

  const handleStep2 = async () => {
    if (!form.country) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          country: form.country,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(3);
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-sm text-pitch-400">Create your account</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const done = step > s.n;
          const active = step === s.n;
          return (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                    done  ? "bg-success border-success text-white" : "",
                    active ? "text-white border-accent" : "",
                    !done && !active ? "border-white/20 text-pitch-500" : ""
                  )}
                  style={active ? { backgroundColor: "rgb(var(--accent)/0.2)", borderColor: "rgb(var(--accent))" } : undefined}
                >
                  {done ? <Check size={14} /> : s.n}
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-white" : "text-pitch-500")}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-16 h-px mx-2 mb-5 transition-all"
                  style={{ backgroundColor: step > s.n ? "rgb(var(--accent)/0.6)" : "rgba(255,255,255,0.1)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase text-white mb-0.5">Create account</h2>
              <p className="text-sm text-pitch-400">Set up your Cup Clash profile</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">Display name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
                <input type="text" placeholder="How your friends will see you" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-pitch-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-500" />
                <input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} className={cn(inputCls, "pr-10")} />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pitch-500 hover:text-pitch-300">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && form.password.length < 8 && (
                <p className="text-[11px] text-danger mt-1.5">At least 8 characters required</p>
              )}
            </div>

            <Button onClick={handleStep1} disabled={!form.name || !form.email || form.password.length < 8} size="md" className="w-full mt-2" rightIcon={<ArrowRight size={16} />}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl uppercase text-white mb-0.5">Pick your team</h2>
              <p className="text-sm text-pitch-400">Your app theme changes to match your country</p>
            </div>

            <CountrySelector value={form.country} onChange={(code) => update("country", code)} />

            <div className="flex gap-3 pt-2">
              <Button onClick={() => setStep(1)} variant="outline" size="md" className="flex-1">Back</Button>
              <Button onClick={handleStep2} disabled={!form.country} loading={loading} size="md" className="flex-1" rightIcon={<ArrowRight size={16} />}>
                Create account
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="text-center space-y-5 py-4">
            <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))", boxShadow: "0 0 40px rgb(var(--brand)/0.4)" }}>
              <Check size={36} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-3xl uppercase text-white">You&apos;re in!</h2>
              <p className="text-pitch-400 text-sm mt-1">Welcome to Cup Clash, {form.name}.</p>
            </div>
            <div className="glass rounded-xl p-4 text-sm text-pitch-300">
              Check your email to confirm your account, then create or join a group.
            </div>
            <Button onClick={handleFinish} size="lg" className="w-full" rightIcon={<ArrowRight size={18} />}>
              Go to dashboard
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-pitch-500 mt-5">
        Already have an account?{" "}
        <Link href="/signin" className="font-bold text-pitch-300 hover:text-white transition-colors">Sign in</Link>
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
