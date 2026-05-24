import { Target, Star, TrendingUp, Users } from "lucide-react";

interface StatCardsProps {
  rank:               number;
  points:             number;
  totalPlayers:       number;
  correctPredictions: number;
  exactScores:        number;
}

export function StatCards({ rank, points, totalPlayers, correctPredictions, exactScores }: StatCardsProps) {
  const stats = [
    {
      icon: TrendingUp, label: "Your rank",
      value: `#${rank}`, sub: `of ${totalPlayers}`,
      accent: "#00D4FF",
      bg: "rgba(0,212,255,0.1)",
      border: "rgba(0,212,255,0.2)",
      glow: "rgba(0,212,255,0.12)",
    },
    {
      icon: Star, label: "Points",
      value: points, sub: "total",
      accent: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.2)",
      glow: "rgba(251,191,36,0.1)",
    },
    {
      icon: Target, label: "Correct",
      value: correctPredictions, sub: "outcomes",
      accent: "#00FF88",
      bg: "rgba(0,255,136,0.1)",
      border: "rgba(0,255,136,0.2)",
      glow: "rgba(0,255,136,0.1)",
    },
    {
      icon: Users, label: "Exact scores",
      value: exactScores, sub: "+25 pts each",
      accent: "#a78bfa",
      bg: "rgba(167,139,250,0.1)",
      border: "rgba(167,139,250,0.2)",
      glow: "rgba(167,139,250,0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label}
          className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: "rgba(12, 18, 32, 0.75)",
            border: `1px solid ${stat.border}`,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: `0 4px 20px ${stat.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Icon */}
          <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
            <stat.icon size={18} style={{ color: stat.accent }} />
          </div>

          {/* Value */}
          <div className="font-display text-3xl leading-none font-black" style={{ color: stat.accent }}>
            {stat.value}
          </div>

          {/* Label */}
          <div className="mt-1.5 text-xs font-bold text-white">{stat.label}</div>

          {/* Sub */}
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
}