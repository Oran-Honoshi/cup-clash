import { cn } from "@/lib/utils";

interface NeonBarProps {
  gradient?: string;
  height?: number;
  className?: string;
}

export function NeonBar({
  gradient = "linear-gradient(90deg,#00D4FF,#00FF88)",
  height = 2.5,
  className,
}: NeonBarProps) {
  return (
    <div
      className={cn(className)}
      style={{
        height,
        background: gradient,
        borderRadius: "2px 2px 0 0",
        flexShrink: 0,
      }}
    />
  );
}
