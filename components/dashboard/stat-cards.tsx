interface StatCardsProps {
  rank:               number;
  points:             number;
  totalPlayers:       number;
  correctPredictions: number;
  exactScores:        number;
}

export function StatCards({ rank, points, totalPlayers, exactScores }: StatCardsProps) {
  const sep = <span style={{ color: "var(--dv)" }}>·</span>;

  return (
    <div
      className="flex items-baseline gap-3 px-4 py-3"
      style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 14 }}
    >
      <span className="ta-stat-number" style={{ color: "var(--ac)" }}>
        {rank ? `#${rank}` : "--"}
      </span>
      {rank && totalPlayers > 0 && (
        <span className="ta-section-label">of {totalPlayers}</span>
      )}
      {sep}
      <span className="flex items-baseline gap-1.5">
        <span className="ta-stat-number" style={{ color: "var(--tx)" }}>{points}</span>
        <span className="ta-section-label">pts</span>
      </span>
      {sep}
      <span className="flex items-baseline gap-1.5">
        <span className="ta-stat-number" style={{ color: "var(--sc)" }}>{exactScores}</span>
        <span className="ta-section-label">exact</span>
      </span>
    </div>
  );
}
