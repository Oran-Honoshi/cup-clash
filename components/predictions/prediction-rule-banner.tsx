export type KnockoutPolicy = 'regular_90' | 'inc_extra_time' | 'to_qualify';

interface PredictionRuleBannerProps {
  policy?: KnockoutPolicy | null;
}

const POLICY_CONFIG: Record<KnockoutPolicy, { icon: string; message: string }> = {
  regular_90: {
    icon: "⚠️",
    message: "Score predictions are based on the 90-minute result only. Extra time and penalties do not count.",
  },
  inc_extra_time: {
    icon: "⚽",
    message: "Score predictions are based on the result after Extra Time (120 minutes). Penalties do not count.",
  },
  to_qualify: {
    icon: "🏆",
    message: "Predict which team advances. The exact score does not affect your points for this match.",
  },
};

export function PredictionRuleBanner({ policy }: PredictionRuleBannerProps) {
  const resolved: KnockoutPolicy = policy ?? 'regular_90';
  const { icon, message } = POLICY_CONFIG[resolved];

  return (
    <div
      className="flex items-start gap-2 rounded-lg px-3 py-2.5 mt-2"
      style={{
        background: "rgba(251,191,36,0.08)",
        borderLeft: "3px solid rgba(251,191,36,0.5)",
      }}
    >
      <span className="text-xs shrink-0 mt-px">{icon}</span>
      <p className="text-[11px] leading-relaxed" style={{ color: "rgb(251,191,36)" }}>
        {message}
      </p>
    </div>
  );
}
