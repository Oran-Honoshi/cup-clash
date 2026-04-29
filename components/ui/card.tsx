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
  // All cards use glassmorphism on light bg
  const variantStyle: Record<string, React.CSSProperties> = {
    "glass": {
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(0,212,255,0.15)",
      boxShadow: "0 4px 24px rgba(0,212,255,0.07), 0 1px 0 rgba(255,255,255,0.9) inset",
    },
    "glass-strong": {
      background: "rgba(255,255,255,0.90)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(0,212,255,0.20)",
      boxShadow: "0 8px 32px rgba(0,212,255,0.10), 0 1px 0 rgba(255,255,255,1) inset",
    },
    "glass-accent": {
      background: "rgba(255,255,255,0.80)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(0,255,136,0.25)",
      boxShadow: "0 4px 24px rgba(0,255,136,0.12), 0 1px 0 rgba(255,255,255,0.9) inset",
    },
    "solid": {
      background: "#ffffff",
      border: "1px solid rgba(0,212,255,0.12)",
      boxShadow: "0 2px 12px rgba(0,212,255,0.06)",
    },
  };

  return (
    <div
      ref={ref}
      className={cn("relative rounded-2xl transition-all duration-200", className)}
      style={{
        ...variantStyle[variant],
        ...(interactive ? { cursor: "pointer" } : {}),
      }}
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
  const tones: Record<string, React.CSSProperties> = {
    neutral: { background: "rgba(15,23,42,0.06)", color: "#475569", border: "1px solid rgba(15,23,42,0.1)" },
    success: { background: "rgba(5,150,105,0.1)", color: "#059669",  border: "1px solid rgba(5,150,105,0.2)" },
    warning: { background: "rgba(217,119,6,0.1)",  color: "#d97706",  border: "1px solid rgba(217,119,6,0.2)"  },
    danger:  { background: "rgba(220,38,38,0.1)",  color: "#dc2626",  border: "1px solid rgba(220,38,38,0.2)"  },
    accent:  { background: "rgba(0,212,255,0.1)",  color: "#00D4FF",  border: "1px solid rgba(0,212,255,0.3)"  },
    live:    { background: "rgba(220,38,38,0.1)",  color: "#dc2626",  border: "1px solid rgba(220,38,38,0.3)"  },
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest", className)}
      style={tones[tone]}
      {...rest}
    >
      {children}
    </span>
  );
}

interface IconBoxProps {
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "accent" | "brand" | "neutral" | "success" | "warning" | "mint";
  className?: string;
}

export function IconBox({ icon, size = "md", tone = "accent", className }: IconBoxProps) {
  const sizes = { sm: "h-9 w-9 rounded-xl", md: "h-11 w-11 rounded-[14px]", lg: "h-14 w-14 rounded-2xl" };
  const tones: Record<string, React.CSSProperties> = {
    accent:  { background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" },
    mint:    { background: "rgba(0,255,136,0.1)", color: "#00c46a", border: "1px solid rgba(0,255,136,0.25)" },
    brand:   { background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)"  },
    neutral: { background: "rgba(15,23,42,0.06)", color: "#475569", border: "1px solid rgba(15,23,42,0.1)"  },
    success: { background: "rgba(5,150,105,0.1)", color: "#059669", border: "1px solid rgba(5,150,105,0.2)" },
    warning: { background: "rgba(217,119,6,0.1)", color: "#d97706", border: "1px solid rgba(217,119,6,0.2)" },
  };

  return (
    <div className={cn("flex items-center justify-center shrink-0", sizes[size], className)}
      style={tones[tone]}>
      {icon}
    </div>
  );
}
