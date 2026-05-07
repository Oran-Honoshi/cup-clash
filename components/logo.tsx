import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ size = "md", className, showWordmark = true }: LogoProps) {
  const dims = {
    sm: { px: 32,  text: "text-base" },
    md: { px: 44,  text: "text-xl"   },
    lg: { px: 56,  text: "text-3xl"  },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Use the 192px version for crisp rendering at all sizes */}
      <Image
        src="/icon-192.png"
        alt="Cup Clash"
        width={dims.px}
        height={dims.px}
        quality={100}
        className="shrink-0"
        style={{ borderRadius: 10 }}
        unoptimized
      />
      {showWordmark && (
        <span className={cn("font-display font-bold uppercase tracking-tight", dims.text)}
          style={{ color: "#0F172A" }}>
          Cup<span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Clash</span>
        </span>
      )}
    </div>
  );
}