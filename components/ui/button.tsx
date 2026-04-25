"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "xs" | "sm" | "md" | "lg";

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

const iconSize: Record<Size, number> = {
  xs: 13,
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      shape,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const isPill = shape === "pill" || (shape === undefined && variant === "primary");
    const radius = isPill ? "rounded-pill" : "rounded-xl";

    const base =
      "inline-flex items-center justify-center font-bold uppercase tracking-wider whitespace-nowrap " +
      "transition-all duration-150 ease-out " +
      "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-950";

    const variants: Record<Variant, string> = {
      // The hero CTA — country accent gradient
      primary:
        "text-white shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 " +
        "[background-image:linear-gradient(135deg,rgb(var(--accent)),rgb(var(--brand-2)))] " +
        "hover:brightness-110",
      // White-on-dark for "buy now" type calls inside dark cards
      secondary:
        "bg-white text-pitch-950 hover:bg-pitch-100 hover:-translate-y-0.5 shadow-card",
      // Subtle action — common in nav and inline rows
      ghost:
        "bg-transparent text-pitch-200 hover:bg-white/5 hover:text-white",
      // Outline — for secondary actions next to a primary
      outline:
        "bg-transparent text-pitch-100 border border-white/15 " +
        "hover:border-accent hover:bg-white/5 hover:text-white",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(base, sizeStyles[size], radius, variants[variant], className)}
        {...rest}
      >
        {loading ? (
          <Loader2 size={iconSize[size]} className="animate-spin opacity-70" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
