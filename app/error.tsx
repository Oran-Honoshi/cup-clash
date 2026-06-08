"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050810",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-ui, sans-serif)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
        <AlertCircle
          size={44}
          style={{ color: "#f87171", margin: "0 auto 20px" }}
        />

        <h1
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: 26,
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#ffffff",
            letterSpacing: "-0.01em",
            margin: "0 0 10px",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.55,
            margin: "0 0 28px",
          }}
        >
          An unexpected error occurred. Please try again, or head back to the
          home page.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={reset}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px 20px",
              borderRadius: 12,
              background: "#00FF88",
              color: "#050810",
              fontFamily: "var(--font-ui, sans-serif)",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} />
            Try again
          </button>

          <a
            href="/"
            style={{
              display: "block",
              width: "100%",
              padding: "12px 20px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-ui, sans-serif)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
