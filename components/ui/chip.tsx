import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  color?: string;
  glow?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function Chip({
  label,
  color = "#00FF88",
  glow = false,
  icon,
  className,
}: ChipProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 whitespace-nowrap", className)}
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color,
        background: `${color}18`,
        border: `1px solid ${color}38`,
        borderRadius: 100,
        padding: "4px 10px",
        fontFamily: "var(--font-ui)",
        boxShadow: glow ? `0 0 12px ${color}45` : "none",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {icon}
      {label}
    </span>
  );
}
