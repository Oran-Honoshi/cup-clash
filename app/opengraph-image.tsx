import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "60px 80px",
        background: "linear-gradient(135deg, #0B141B 0%, #0B1F14 60%, #0B141B 100%)",
        position: "relative",
        fontFamily: "sans-serif",
      }}>

        {/* Glows */}
        <div style={{
          position: "absolute", top: -100, left: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.18), transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -100, right: 100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,136,0.14), transparent 70%)",
        }} />

        {/* Left content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, zIndex: 1 }}>
          <div style={{
            fontSize: 14, fontWeight: 900, letterSpacing: 4,
            textTransform: "uppercase", color: "#00D4FF", marginBottom: 16,
          }}>
            ⚽ FIFA World Cup 2026
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontSize: 108, fontWeight: 900, lineHeight: 0.85,
              textTransform: "uppercase", color: "white",
            }}>CUP</span>
            <span style={{
              fontSize: 108, fontWeight: 900, lineHeight: 0.85,
              textTransform: "uppercase", color: "#00FF88",
            }}>CLASH</span>
          </div>

          <div style={{
            fontSize: 22, color: "rgba(255,255,255,0.55)",
            lineHeight: 1.4, marginTop: 28, marginBottom: 32,
            maxWidth: 520,
          }}>
            104 matches, 3 countries, and your football IQ against friends.
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "✓ Free beta launch", green: true  },
              { label: "Live leaderboard",   green: false },
              { label: "104 matches",        green: false },
            ].map(({ label, green }) => (
              <div key={label} style={{
                padding: "8px 18px", borderRadius: 50,
                fontSize: 13, fontWeight: 700,
                color:      green ? "#00FF88" : "#00D4FF",
                background: green ? "rgba(0,255,136,0.1)" : "rgba(0,212,255,0.08)",
                border:     `1px solid ${green ? "rgba(0,255,136,0.3)" : "rgba(0,212,255,0.3)"}`,
              }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right — actual logo */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", zIndex: 1, marginLeft: 60,
        }}>
          <div style={{
            width: 220, height: 220, borderRadius: 40,
            background: "rgba(0,0,0,0.3)",
            border: "2px solid rgba(0,212,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            marginBottom: 20,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cupclash.live/icon-512.png"
              width={180}
              height={180}
              style={{ objectFit: "contain" }}
              alt="Cup Clash Logo"
            />
          </div>
          <div style={{
            fontSize: 18, color: "rgba(255,255,255,0.35)",
            letterSpacing: 2,
          }}>
            cupclash.live
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 5,
          background: "linear-gradient(90deg, #00D4FF, #00FF88)",
        }} />
      </div>
    ),
    { ...size }
  );
}