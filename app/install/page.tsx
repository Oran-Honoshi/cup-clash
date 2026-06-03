import Link from "next/link";
import { Smartphone, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Install Cup Clash | Add to Home Screen",
  description: "Install Cup Clash as an app on your iPhone or Android phone for the best prediction experience.",
};

const steps = {
  ios: [
    "Open cupclash.live in Safari (must be Safari, not Chrome)",
    "Tap the Share button (box with arrow ↑) at the bottom of the screen",
    'Scroll down and tap "Add to Home Screen"',
    'Tap "Add" — Cup Clash appears on your home screen',
  ],
  android: [
    "Open cupclash.live in Chrome",
    "Tap the three-dot menu (⋮) at the top right",
    'Tap "Add to Home Screen" or "Install App"',
    'Tap "Install" — Cup Clash appears on your home screen',
  ],
};

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3 mt-4">
      {items.map((step, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black"
            style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function InstallPage() {
  return (
    <div className="min-h-screen px-5 py-16"
      style={{ background: "linear-gradient(160deg, #050810 0%, #0a0e1a 50%, #050810 100%)" }}>
      <div className="max-w-lg mx-auto">

        <Link href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-10 transition-opacity hover:opacity-70"
          style={{ color: "#00D4FF" }}>
          <ArrowLeft size={13} /> Back to Cup Clash
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)" }}>
            <Smartphone size={20} style={{ color: "#0B141B" }} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#00D4FF" }}>
            Install the App
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl uppercase font-black text-white leading-none mb-3">
          Add to Home Screen
        </h1>
        <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
          Cup Clash works as a full app on your phone — no app store needed.
          Faster, full-screen, and it works offline.
        </p>

        {/* iOS */}
        <div className="rounded-2xl p-6 mb-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg"></span>
            <span className="font-display text-xl uppercase font-black text-white">iPhone & iPad</span>
          </div>
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Requires Safari — Chrome on iOS cannot install PWAs
          </p>
          <StepList items={steps.ios} />
        </div>

        {/* Android */}
        <div className="rounded-2xl p-6 mb-10"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🤖</span>
            <span className="font-display text-xl uppercase font-black text-white">Android</span>
          </div>
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Works best in Chrome
          </p>
          <StepList items={steps.android} />
        </div>

        <Link href="/dashboard"
          className="block w-full py-4 rounded-2xl text-center font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B", boxShadow: "0 8px 24px rgba(0,212,255,0.3)" }}>
          Go to Dashboard
        </Link>

      </div>
    </div>
  );
}
