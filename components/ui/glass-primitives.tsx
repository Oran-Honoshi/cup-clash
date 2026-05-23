// components/ui/glass-primitives.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Cosmetic-only primitive components.
// Spread all existing props (onChange, value, onClick, ref, etc.) through.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// ── GlassCard ────────────────────────────────────────────────────────────────

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Neon top border colour: "green" | "purple" | "none" */
  accent?: "green" | "purple" | "none";
}

export function GlassCard({ children, className, accent = "none" }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-3xl overflow-hidden",
        "border border-white/10",
        "bg-slate-900/50",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_8px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)]",
        "transition-all duration-300",
        className
      )}
    >
      {/* Accent top bar */}
      {accent === "green" && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
      )}
      {accent === "purple" && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 to-indigo-500" />
      )}
      {children}
    </div>
  );
}

// ── GlassPanel — inner nested panel ──────────────────────────────────────────

export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/8 bg-slate-950/45 backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── GlassInput ───────────────────────────────────────────────────────────────

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, id, error, className, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-0.5"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-white/10",
            "bg-slate-950/40 backdrop-blur-sm",
            "px-4 py-3 text-sm text-white placeholder-slate-500",
            "outline-none",
            "transition-all duration-200",
            "focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-950/60",
            error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 ml-0.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
GlassInput.displayName = "GlassInput";

// ── PrimaryGlowButton ────────────────────────────────────────────────────────

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

export function PrimaryGlowButton({ children, className, loading, disabled, ...props }: GlowButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "w-full rounded-xl px-5 py-3.5",
        "bg-gradient-to-r from-emerald-500 to-teal-400",
        "text-sm font-bold tracking-wide text-slate-950",
        "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
        "transition-all duration-200",
        "hover:shadow-[0_0_28px_rgba(16,185,129,0.55)] hover:scale-[1.01]",
        "active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}

// ── SecondaryGlowButton ───────────────────────────────────────────────────────

export function SecondaryGlowButton({ children, className, loading, disabled, ...props }: GlowButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "w-full rounded-xl px-5 py-3.5",
        "bg-gradient-to-r from-indigo-600 to-violet-600",
        "text-sm font-semibold tracking-wide text-white",
        "shadow-[0_0_20px_rgba(124,58,237,0.25)]",
        "transition-all duration-200",
        "hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] hover:scale-[1.01]",
        "active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}

// ── GhostButton ───────────────────────────────────────────────────────────────

export function GhostButton({ children, className, ...props }: GlowButtonProps) {
  return (
    <button
      className={cn(
        "w-full rounded-xl px-5 py-3",
        "border border-white/10 bg-white/5",
        "text-sm font-semibold text-slate-300",
        "transition-all duration-200",
        "hover:bg-white/10 hover:border-white/20",
        "active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ── GlassBottomNavigation ─────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface GlassBottomNavigationProps {
  currentTab: string;
  setTab?: (id: string) => void;
  items?: NavItem[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "HOME",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    id: "predictions",
    label: "BETS",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    id: "leaderboard",
    label: "TABLE",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
  {
    id: "bracket",
    label: "BRACKET",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="6" height="5" rx="1"/>
        <rect x="16" y="2" width="6" height="5" rx="1"/>
        <rect x="9" y="10" width="6" height="5" rx="1"/>
        <rect x="9" y="17" width="6" height="5" rx="1"/>
        <line x1="8" y1="4.5" x2="16" y2="4.5"/>
        <line x1="12" y1="4.5" x2="12" y2="10"/>
        <line x1="8" y1="19.5" x2="9" y2="19.5"/>
        <line x1="15" y1="19.5" x2="16" y2="19.5"/>
      </svg>
    ),
  },
];

export function GlassBottomNavigation({ currentTab, setTab, items = DEFAULT_NAV_ITEMS }: GlassBottomNavigationProps) {
  return (
    <div className="w-full max-w-md mt-4 rounded-2xl border border-white/8 bg-slate-950/65 backdrop-blur-xl overflow-hidden">
      <nav className="flex justify-around items-center p-2">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab?.(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl",
                "transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-emerald-400 bg-emerald-500/8 scale-105"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              {item.icon}
              <span className="text-[9px] font-bold tracking-widest">{item.label}</span>
              {isActive && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ── ScreenHeader — shared top bar with back + title ───────────────────────────

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, action }: ScreenHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mb-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}
        <div>
          <h1 className="font-display font-black uppercase tracking-tight text-white text-xl leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── LeaderboardRow — cosmetic only, all data/handlers passed as props ─────────

interface LeaderboardRowProps {
  rank: number;
  name: string;
  points: number;
  flagCode?: string;
  isCurrentUser?: boolean;
  avatarLetter?: string;
  onClick?: () => void;
}

export function LeaderboardRow({ rank, name, points, flagCode, isCurrentUser, avatarLetter, onClick }: LeaderboardRowProps) {
  const rankColors: Record<number, string> = {
    1: "text-amber-400",
    2: "text-slate-300",
    3: "text-orange-400",
  };
  const rankColor = rankColors[rank] ?? "text-slate-500";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
        "transition-all duration-150",
        isCurrentUser
          ? "bg-emerald-500/8 border border-emerald-500/20 hover:bg-emerald-500/12"
          : "hover:bg-white/5"
      )}
    >
      {/* Rank */}
      <span className={cn("font-display font-black text-xl w-7 text-center shrink-0", rankColor)}>
        {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank}
      </span>

      {/* Flag */}
      {flagCode && (
        <span className="w-6 h-4 rounded-sm overflow-hidden shrink-0">
          <img
            src={`https://flagcdn.com/w40/${flagCode}.png`}
            alt=""
            className="w-full h-full object-cover"
          />
        </span>
      )}

      {/* Avatar */}
      <div className={cn(
        "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0",
        isCurrentUser
          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
          : "bg-slate-700/60 border border-white/10 text-slate-300"
      )}>
        {avatarLetter ?? name[0]}
      </div>

      {/* Name */}
      <span className={cn("flex-1 text-sm font-semibold text-left", isCurrentUser ? "text-emerald-300" : "text-slate-200")}>
        {name}
        {isCurrentUser && <span className="ml-2 text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full px-1.5 py-0.5">YOU</span>}
      </span>

      {/* Points */}
      <span className={cn("font-display font-bold text-lg", isCurrentUser ? "text-emerald-400" : "text-white")}>
        {points}
        <span className="text-xs font-medium text-slate-500 ml-0.5">pts</span>
      </span>
    </button>
  );
}

// ── ScoreBox — prediction score input ────────────────────────────────────────

interface ScoreBoxProps {
  value: number | string;
  onChange?: (val: number) => void;
  disabled?: boolean;
}

export function ScoreBox({ value, onChange, disabled }: ScoreBoxProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onChange?.(Math.min(9, Number(value) + 1))}
        disabled={disabled}
        className="flex items-center justify-center h-7 w-7 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-lg font-bold hover:bg-emerald-500/20 disabled:opacity-30 transition-all"
      >+</button>
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl border-2 border-emerald-500/40 bg-slate-950/50 font-display font-black text-3xl text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
        {value}
      </div>
      <button
        onClick={() => onChange?.(Math.max(0, Number(value) - 1))}
        disabled={disabled}
        className="flex items-center justify-center h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-slate-400 text-lg font-bold hover:bg-white/10 disabled:opacity-30 transition-all"
      >−</button>
    </div>
  );
}