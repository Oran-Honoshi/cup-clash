import { Compass } from "lucide-react";

export default function NotFound() {
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
        <Compass
          size={44}
          style={{ color: "#00D4FF", margin: "0 auto 20px" }}
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
          Page not found
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.55,
            margin: "0 0 28px",
          }}
        >
          This page doesn&apos;t exist or may have moved. Head back to your
          dashboard to keep predicting.
        </p>

        <a
          href="/dashboard"
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
            textDecoration: "none",
          }}
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
