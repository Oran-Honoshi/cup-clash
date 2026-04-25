import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** "lg" 20px (large), "md" 16px (list), "sm" 14px (compact). Default lg. */
  size?: "sm" | "md" | "lg";
  /** Adds a 4px left border in the accent color */
  accent?: boolean;
  /** Hover lift and deeper shadow */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { size = "lg", accent = false, interactive = false, className, children, ...rest },
  ref
) {
  const radius = size === "lg" ? "rounded-[20px]" : size === "md" ? "rounded-2xl" : "rounded-[14px]";

  return (
    <div
      ref={ref}
      className={cn(
        "relative bg-white border border-ink-100 shadow-card transition-all duration-200",
        radius,
        accent && "border-l-4 border-l-accent",
        interactive && "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger" | "accent" | "brand";
}

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-100 text-ink-700 border-ink-200",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger:  "bg-danger/10 text-danger border-danger/20",
    accent:  "bg-accent/10 text-accent border-accent/25",
    brand:   "[background-color:rgb(var(--brand)/0.1)] [color:rgb(var(--brand))] [border-color:rgb(var(--brand)/0.25)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
        "text-[11px] font-bold tracking-wide",
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

interface IconBoxProps {
  icon: React.ReactNode;
  /** "sm" 36px, "md" 44px (default), "lg" 52px */
  size?: "sm" | "md" | "lg";
  /** "accent" uses --accent var, "brand" uses --brand var, "ink" neutral */
  tone?: "accent" | "brand" | "ink" | "success" | "warning";
  className?: string;
}

export function IconBox({ icon, size = "md", tone = "brand", className }: IconBoxProps) {
  const sizes = {
    sm: "h-9 w-9 rounded-xl",
    md: "h-11 w-11 rounded-[14px]",
    lg: "h-[52px] w-[52px] rounded-[14px]",
  };

  const tones: Record<string, string> = {
    accent: "bg-accent/15 text-accent",
    brand:  "[background-color:rgb(var(--brand)/0.12)] [color:rgb(var(--brand))]",
    ink:    "bg-ink-100 text-ink-700",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0",
        sizes[size],
        tones[tone],
        className
      )}
    >
      {icon}
    </div>
  );
}
