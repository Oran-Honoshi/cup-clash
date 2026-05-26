import { TrendingUp, Star, Target } from "lucide-react";

interface StatCardsProps {
  rank:               number;
  points:             number;
  totalPlayers:       number;
  correctPredictions: number;
  exactScores:        number;
}

export function StatCards({ rank, points, totalPlayers, exactScores }: StatCardsProps) {
  const stats = [
    {
      Icon: TrendingUp,
      label: "Your Rank",
      value: rank ? `#${rank}` : "-",
      sub: rank ? `of ${totalPlayers}` : "",
      color: "#00FF88",
    },
    {
      Icon: Star,
      label: "Points",
      value: String(points),
      sub: "total",
      color: "#00D4FF",
    },
    {
      Icon: Target,
      label: "Exact Scores",
      value: String(exactScores),
      sub: "+25 pts each",
      color: "#fbbf24",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: "rgba(18,14,38,0.32)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 18,
            padding: 14,
            textAlign: "center",
          }}
        >
          {/* Icon: 20px, above value */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <stat.Icon size={20} style={{ color: stat.color }} strokeWidth={2} />
          </div>

          {/* Value */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 900,
              fontSize: 22,
              color: stat.color,
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            {stat.value}
          </div>

          {/* Label */}
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "var(--font-ui)",
              marginTop: 6,
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
