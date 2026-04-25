"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "dark";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** "pill" for primary CTAs, "rounded" for secondary actions. Default depends on variant. */
  shape?: "pill" | "rounded";
}

const sizeStyles: Record<Size, string> = {
  xs: "h-7 px-3 text-xs gap-1.5",
  sm: "h-[34px] px-4 text-sm gap-1.5",
  md: "h-[42px] px-5 text-sm gap-2",
  lg: "h-[52px] px-7 text-base gap-2",
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
      "inline-flex items-center justify-center font-semibold whitespace-nowrap " +
      "transition-all duration-150 ease-out " +
      "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2";

    const variants: Record<Variant, string> = {
      primary:
        "text-white shadow-cta hover:shadow-cta-hover hover:-translate-y-px " +
        "[background-image:linear-gradient(135deg,rgb(var(--brand)),rgb(var(--brand-2)))] " +
        "hover:brightness-105",
      outline:
        "bg-transparent text-ink-900 border border-ink-200 " +
        "hover:border-ink-300 hover:-translate-y-px hover:bg-ink-50",
      ghost:
        "bg-transparent text-ink-700 hover:bg-ink-100 hover:text-ink-900",
      dark:
        "bg-ink-900 text-white hover:bg-ink-700 hover:-translate-y-px shadow-card",
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
