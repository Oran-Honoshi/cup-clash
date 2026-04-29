import { Target, Star, TrendingUp, Users } from "lucide-react";

interface StatCardsProps {
  rank: number;
  points: number;
  totalPlayers: number;
  correctPredictions: number;
  exactScores: number;
}

export function StatCards({ rank, points, totalPlayers, correctPredictions, exactScores }: StatCardsProps) {
  const stats = [
    { icon: TrendingUp, label: "Your rank",    value: `#${rank}`,         sub: `of ${totalPlayers}`, accent: "#00D4FF", bg: "rgba(0,212,255,0.08)", border: "rgba(0,212,255,0.2)"  },
    { icon: Star,       label: "Points",       value: points,             sub: "total",              accent: "#d97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.2)"  },
    { icon: Target,     label: "Correct",      value: correctPredictions, sub: "outcomes",           accent: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)"  },
    { icon: Users,      label: "Exact scores", value: exactScores,        sub: "+25 pts each",       accent: "#00FF88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.25)" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: `${stat.bg}`,
            border: `1px solid ${stat.border}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            backgroundColor: "rgba(255,255,255,0.6)",
            boxShadow: `0 4px 16px ${stat.bg}`,
          }}>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
            <stat.icon size={18} style={{ color: stat.accent }} />
          </div>
          <div className="font-display text-3xl leading-none font-bold" style={{ color: stat.accent }}>
            {stat.value}
          </div>
          <div className="mt-1.5 text-xs font-bold" style={{ color: "#0B141B" }}>{stat.label}</div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
