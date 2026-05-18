"use client";

import { useState } from "react";
import { EnterpriseModal } from "@/components/landing/enterprise-modal";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#F8FAFC" }}>
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-5xl">👋</div>
        <h1 className="font-display text-3xl uppercase font-black" style={{ color: "#0F172A" }}>
          We&apos;re here to help
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Whether you&apos;re setting up for your office, need a custom plan, or just have a question — drop us a message and we&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider"
          style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
          Send us a message
        </button>
        <div>
          <Link href="/" className="text-xs font-bold flex items-center justify-center gap-1.5"
            style={{ color: "#94a3b8" }}>
            <ArrowLeft size={12} /> Back to Cup Clash
          </Link>
        </div>
      </div>

      <EnterpriseModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}