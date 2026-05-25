"use client";

const PALETTE: [string, string][] = [
  ["#00FF88", "rgba(0,255,136,0.18)"],
  ["#00D4FF", "rgba(0,212,255,0.18)"],
  ["#8B5CF6", "rgba(139,92,246,0.18)"],
  ["#fbbf24", "rgba(251,191,36,0.18)"],
  ["#f87171", "rgba(248,113,113,0.18)"],
  ["#34d399", "rgba(52,211,153,0.18)"],
];

function hash(name: string): number {
  let h = 0;
  for (const c of name || "?") {
    h = (h + c.charCodeAt(0)) % 6;
  }
  return h;
}

interface AvatarCCProps {
  name: string;
  size?: number;
  ring?: string;
  you?: boolean;
}

export function AvatarCC({ name, size = 36, ring, you = false }: AvatarCCProps) {
  const [fg, bg] = PALETTE[hash(name)];

  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const borderColor = ring ?? (you ? "#00FF88" : "rgba(255,255,255,0.15)");
  const boxShadow =
    ring || you ? `0 0 14px ${ring ?? "#00FF88"}55` : "none";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: Math.round(size * 0.38),
        color: fg,
        border: `2.5px solid ${borderColor}`,
        boxShadow,
        flexShrink: 0,
        fontFamily: "var(--font-ui)",
        letterSpacing: "-0.005em",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}
