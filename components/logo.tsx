import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ size = "md", className, showWordmark = true }: LogoProps) {
  const dims = {
    sm: { px: 28, text: "text-base"  },
    md: { px: 36, text: "text-xl"    },
    lg: { px: 48, text: "text-3xl"   },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative rounded-xl overflow-hidden shrink-0"
        style={{ width: dims.px, height: dims.px }}>
        <Image
          src="/favicon-32x32.png"
          alt="Cup Clash"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {showWordmark && (
        <span className={cn("font-display font-bold uppercase tracking-tight", dims.text)}
          style={{ color: "#0F172A" }}>
          Cup<span style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Clash</span>
        </span>
      )}
    </div>
  );
}