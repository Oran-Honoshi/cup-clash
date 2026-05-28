interface StatCardsProps {
  rank:               number;
  points:             number;
  totalPlayers:       number;
  correctPredictions: number;
  exactScores:        number;
}

export function StatCards({ rank, points, totalPlayers, exactScores }: StatCardsProps) {
  const sep = <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>;

  return (
    <div className="flex items-baseline gap-3 px-1" style={{ fontFamily: "var(--font-mono)" }}>
      <span className="text-2xl font-black" style={{ color: "#00FF88" }}>
        {rank ? `#${rank}` : "--"}
      </span>
      {rank && totalPlayers > 0 && (
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          of {totalPlayers}
        </span>
      )}
      {sep}
      <span className="text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
        <span className="font-black text-white">{points}</span> pts
      </span>
      {sep}
      <span className="text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
        <span className="font-black" style={{ color: "#fbbf24" }}>{exactScores}</span> exact
      </span>
    </div>
  );
}
