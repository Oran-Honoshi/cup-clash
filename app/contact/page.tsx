"use client";

import { useState } from "react";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function ContactPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleBack = () => {
    // Go back in history if possible, otherwise go to dashboard
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#F8FAFC" }}>
      <div className="text-center space-y-4 max-w-sm">
        <Logo size="lg" className="justify-center" />
        <div className="text-5xl">👋</div>
        <h1 className="font-display text-3xl uppercase font-black" style={{ color: "#0F172A" }}>
          We&apos;re here to help
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Whether you&apos;re setting up for your office, need a custom plan,
          or just have a question — drop us a message and we&apos;ll get back
          to you within 24 hours.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
          Send us a message
        </button>
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-1.5 text-xs font-bold w-full py-2 transition-colors hover:opacity-70"
          style={{ color: "#94a3b8" }}>
          <ArrowLeft size={12} /> Back
        </button>
      </div>

      <EnterpriseModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}