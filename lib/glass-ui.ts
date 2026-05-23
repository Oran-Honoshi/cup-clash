// lib/glass-ui.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cup Clash — Glassmorphic Design System
// All cosmetic tokens live here. Logic lives in your existing files.
// ─────────────────────────────────────────────────────────────────────────────

export const glass = {
  // Base card — every screen panel
  card: [
    "relative w-full max-w-md rounded-3xl overflow-hidden",
    "border border-white/10",
    "bg-slate-900/50",
    "backdrop-blur-xl backdrop-saturate-150",
    "shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]",
  ].join(" "),

  // Tighter inner card — nested panels within the main card
  inner: [
    "rounded-2xl border border-white/8",
    "bg-slate-950/40 backdrop-blur-md",
  ].join(" "),

  // Glowing green variant — active states, save buttons, current user row
  cardGreen: [
    "relative rounded-2xl border",
    "border-emerald-500/25",
    "bg-emerald-950/20 backdrop-blur-md",
    "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
  ].join(" "),

  // Glowing purple variant — secondary actions, bracket lines
  cardPurple: [
    "relative rounded-2xl border",
    "border-violet-500/30",
    "bg-violet-950/20 backdrop-blur-md",
    "shadow-[0_0_20px_rgba(124,58,237,0.12)]",
  ].join(" "),
};

export const btn = {
  // Primary green CTA (Save, Get Started, Lock In)
  primary: [
    "w-full rounded-xl px-5 py-3.5",
    "bg-gradient-to-r from-emerald-500 to-teal-400",
    "text-sm font-bold tracking-wide text-slate-950",
    "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    "transition-all duration-200",
    "hover:shadow-[0_0_28px_rgba(16,185,129,0.55)] hover:scale-[1.01]",
    "active:scale-[0.99]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  ].join(" "),

  // Secondary purple CTA (Notifications, Admin actions)
  secondary: [
    "w-full rounded-xl px-5 py-3.5",
    "bg-gradient-to-r from-indigo-600 to-violet-600",
    "text-sm font-semibold tracking-wide text-white",
    "shadow-[0_0_20px_rgba(124,58,237,0.25)]",
    "transition-all duration-200",
    "hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] hover:scale-[1.01]",
    "active:scale-[0.99]",
  ].join(" "),

  // Ghost / outline button
  ghost: [
    "w-full rounded-xl px-5 py-3",
    "border border-white/10 bg-white/5",
    "text-sm font-semibold text-slate-300",
    "transition-all duration-200",
    "hover:bg-white/10 hover:border-white/20",
    "active:scale-[0.99]",
  ].join(" "),

  // Icon button (small, square)
  icon: [
    "flex items-center justify-center",
    "h-9 w-9 rounded-xl",
    "border border-white/8 bg-white/5",
    "text-slate-400",
    "transition-all duration-150",
    "hover:bg-white/10 hover:text-white",
  ].join(" "),
};

export const input = {
  base: [
    "w-full rounded-xl border border-white/10",
    "bg-slate-950/40 backdrop-blur-sm",
    "px-4 py-3 text-sm text-white placeholder-slate-500",
    "outline-none",
    "transition-all duration-200",
    "focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-950/60",
  ].join(" "),

  label: "block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-0.5",
};

export const text = {
  // Display heading — Barlow Condensed uppercase
  display: "font-display font-black uppercase tracking-tight text-white",
  // Section title
  title: "font-display font-bold uppercase tracking-wide text-white",
  // Body
  body: "text-sm text-slate-300 leading-relaxed",
  // Muted label
  muted: "text-xs text-slate-500 font-medium",
  // Active green accent
  green: "text-emerald-400",
  // Purple accent
  purple: "text-violet-400",
  // Amber/gold accent (rank, trophy)
  amber: "text-amber-400",
};

export const badge = {
  green: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  purple: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/15 text-violet-400 border border-violet-500/25",
  amber: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20",
  slate: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-400 border border-white/8",
};

// Rank medal colours
export const rankColor = (rank: number) => {
  if (rank === 1) return "text-amber-400";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-orange-400";
  return "text-slate-500";
};