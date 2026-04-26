import { Target, Star, TrendingUp, Users } from "lucide-react";

interface StatCardsProps {
  rank: number;
  points: number;
  totalPlayers: number;
  correctPredictions: number;
  exactScores: number;
}

export function StatCards({
  rank,
  points,
  totalPlayers,
  correctPredictions,
  exactScores,
}: StatCardsProps) {
  const stats = [
    {
      icon: TrendingUp,
      label: "Your rank",
      value: `#${rank}`,
      sub: `of ${totalPlayers}`,
      tone: "accent" as const,
    },
    {
      icon: Star,
      label: "Points",
      value: points,
      sub: "total",
      tone: "warning" as const,
    },
    {
      icon: Target,
      label: "Correct",
      value: correctPredictions,
      sub: "outcomes",
      tone: "success" as const,
    },
    {
      icon: Users,
      label: "Exact scores",
      value: exactScores,
      sub: "+25 pts each",
      tone: "brand" as const,
    },
  ];

  const toneStyles: Record<string, { icon: string; bg: string }> = {
    accent:  { icon: "rgb(var(--accent-glow))", bg: "rgb(var(--accent) / 0.12)"  },
    warning: { icon: "#F59E0B",                 bg: "rgba(245, 158, 11, 0.12)"   },
    success: { icon: "#3CAC3B",                 bg: "rgba(60, 172, 59, 0.12)"    },
    brand:   { icon: "rgb(var(--brand-2))",     bg: "rgb(var(--brand-2) / 0.12)" },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const tone = toneStyles[stat.tone];
        return (
          <div
            key={stat.label}
            className="relative rounded-2xl p-4 border border-white/[0.08] overflow-hidden"
            style={{ backgroundColor: tone.bg }}
          >
            {/* Icon */}
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <stat.icon size={18} style={{ color: tone.icon }} />
            </div>

            {/* Value */}
            <div
              className="font-display text-3xl leading-none"
              style={{ color: tone.icon }}
            >
              {stat.value}
            </div>

            {/* Labels */}
            <div className="mt-1.5 text-xs font-bold text-white/80">
              {stat.label}
            </div>
            <div className="text-[10px] text-pitch-500 uppercase tracking-widest">
              {stat.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
