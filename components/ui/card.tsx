import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "glass-strong" | "glass-accent" | "solid";
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "glass", interactive = false, className, children, ...rest },
  ref
) {
  const variants = {
    glass: "glass",
    "glass-strong": "glass-strong",
    "glass-accent": "glass-accent",
    solid: "bg-pitch-900 border border-white/10",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl transition-all duration-200",
        variants[variant],
        interactive && "hover:-translate-y-1 hover:shadow-card-hover cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger" | "accent" | "live";
}

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-pitch-200 border-white/10",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    danger:  "bg-danger/10 text-danger border-danger/30",
    accent:  "[background-color:rgb(var(--accent)/0.12)] [color:rgb(var(--accent-glow))] [border-color:rgb(var(--accent)/0.4)]",
    live:    "bg-danger/15 text-danger border-danger/40",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[10px] font-bold uppercase tracking-widest",
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
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "accent" | "brand" | "neutral" | "success" | "warning";
  className?: string;
}

export function IconBox({ icon, size = "md", tone = "accent", className }: IconBoxProps) {
  const sizes = {
    sm: "h-9 w-9 rounded-xl",
    md: "h-11 w-11 rounded-[14px]",
    lg: "h-14 w-14 rounded-2xl",
  };

  const tones: Record<string, string> = {
    accent: "[background-color:rgb(var(--accent)/0.15)] [color:rgb(var(--accent-glow))] [border:1px_solid_rgb(var(--accent)/0.3)]",
    brand:  "[background-color:rgb(var(--brand)/0.15)] [color:rgb(var(--brand))] [border:1px_solid_rgb(var(--brand)/0.3)]",
    neutral: "bg-white/5 text-pitch-200 border border-white/10",
    success: "bg-success/15 text-success border border-success/30",
    warning: "bg-warning/15 text-warning border border-warning/30",
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
