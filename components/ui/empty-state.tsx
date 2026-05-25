import { type ReactNode } from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

export function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 22,
        padding: "40px 24px",
      }}
    >
      <div
        className="flex items-center justify-center mb-5"
        style={{ width: 48, height: 48 }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 800,
          color: "#ffffff",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
          margin: "0 0 24px",
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>

      {cta && (
        <Link
          href={cta.href}
          className="px-6 py-3 rounded-xl font-bold"
          style={{
            background: "linear-gradient(135deg,#00FF88,#00D4FF)",
            color: "#0B141B",
          }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
