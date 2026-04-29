"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size    = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  shape?: "pill" | "rounded";
}

const sizeStyles: Record<Size, string> = {
  xs: "h-7 px-3 text-xs gap-1.5",
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-14 px-7 text-base gap-2.5",
};

const iconSize: Record<Size, number> = { xs: 13, sm: 14, md: 16, lg: 18 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", shape, loading = false, disabled,
      leftIcon, rightIcon, className, children, ...rest },
    ref
  ) {
    const isPill   = shape === "pill" || (shape === undefined && variant === "primary");
    const radius   = isPill ? "rounded-full" : "rounded-xl";
    const isDisabled = disabled || loading;

    const base =
      "inline-flex items-center justify-center font-bold uppercase tracking-wider whitespace-nowrap " +
      "transition-all duration-150 ease-out " +
      "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

    const variants: Record<Variant, string> = {
      // Neon Mint CTA — navy text on mint, neon drop-shadow
      primary:
        "hover:-translate-y-0.5 hover:brightness-105",
      // Subtle action
      secondary:
        "bg-white text-slate-900 hover:bg-slate-50 hover:-translate-y-0.5 border border-slate-200 shadow-sm",
      // Ghost
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
      // Outline
      outline:
        "bg-white/60 border hover:bg-white text-slate-700 hover:text-slate-900 backdrop-blur-sm",
    };

    // Primary gets the neon mint style via inline to ensure it shows on light bg
    const primaryStyle = variant === "primary" ? {
      background: "linear-gradient(135deg, #00FF88, #00D4FF)",
      color: "#0B141B",
      boxShadow: "0 0 15px rgba(0,255,136,0.35), 0 4px 16px rgba(0,255,136,0.2)",
    } : undefined;

    const outlineStyle = variant === "outline" ? {
      borderColor: "rgba(0,212,255,0.3)",
    } : undefined;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(base, sizeStyles[size], radius, variants[variant], className)}
        style={{ ...primaryStyle, ...outlineStyle }}
        {...rest}
      >
        {loading ? (
          <Loader2 size={iconSize[size]} className="animate-spin opacity-70" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
