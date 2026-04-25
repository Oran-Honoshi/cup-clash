import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ size = "md", className, showWordmark = true }: LogoProps) {
  const dims = {
    sm: { mark: "h-7 w-7", text: "text-base" },
    md: { mark: "h-9 w-9", text: "text-xl" },
    lg: { mark: "h-12 w-12", text: "text-3xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-[10px]",
          dims.mark
        )}
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--brand-2)))",
          boxShadow:
            "0 0 0 1px rgb(var(--accent) / 0.5), 0 8px 20px rgb(var(--accent) / 0.4)",
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-1/2 w-1/2"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M16 5a7 7 0 1 0 0 14" />
          <path d="M8 5a7 7 0 1 1 0 14" />
        </svg>
      </div>
      {showWordmark && (
        <span
          className={cn(
            "font-display font-bold uppercase tracking-tight text-white",
            dims.text
          )}
        >
          Cup<span className="gradient-text">Clash</span>
        </span>
      )}
    </div>
  );
}
