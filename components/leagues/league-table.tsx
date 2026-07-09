import { NeonBar } from "@/components/ui/neon-bar";
import { FlagBadge } from "@/components/ui/FlagBadge";
import type { StandingsRow } from "@/lib/services/standings";

// Domestic-league / UCL table renderer for the standings snapshots fetched
// from API-Football (lib/services/league-football.ts). Deliberately separate
// from components/dashboard/group-standings.tsx, which is World-Cup-specific
// (hardcoded groups, recomputes from match results) — untouched by this file.

function Table({ groupLabel, rows }: { groupLabel: string | null; rows: StandingsRow[] }) {
  return (
    <div
      style={{
        background: "rgba(18,14,38,0.32)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 22,
        overflow: "hidden",
      }}
    >
      <NeonBar />

      {groupLabel && (
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
        >
          <span className="font-display text-lg font-black uppercase" style={{ color: "white" }}>
            {groupLabel}
          </span>
        </div>
      )}

      <div
        className="grid text-[10px] font-bold uppercase tracking-widest px-4 py-2"
        style={{ gridTemplateColumns: "1fr 28px 28px 28px 28px 28px 36px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)" }}
      >
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GD</span>
        <span className="text-center">Pts</span>
      </div>

      {rows.map((row) => (
        <div
          key={row.teamId}
          className="grid items-center px-4 py-2.5 border-t"
          style={{
            gridTemplateColumns: "1fr 28px 28px 28px 28px 28px 36px",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
              {row.position}
            </span>
            <FlagBadge code={row.badgeUrl} size="sm" label={row.team} shape="circle" />
            <span className="text-sm font-bold truncate" style={{ color: "white" }}>
              {row.team}
            </span>
          </div>
          <span className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>{row.played}</span>
          <span className="text-xs text-center" style={{ color: "#00FF88" }}>{row.won}</span>
          <span className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>{row.drawn}</span>
          <span className="text-xs text-center" style={{ color: "#f87171" }}>{row.lost}</span>
          <span
            className="text-xs text-center"
            style={{ color: row.goalDifference > 0 ? "#00FF88" : row.goalDifference < 0 ? "#f87171" : "rgba(255,255,255,0.4)" }}
          >
            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
          </span>
          <span className="text-sm font-mono font-black text-center" style={{ color: "#00D4FF" }}>{row.points}</span>
        </div>
      ))}
    </div>
  );
}

export function LeagueTable({ rows }: { rows: StandingsRow[] }) {
  const groups = new Map<string | null, StandingsRow[]>();
  for (const row of rows) {
    const key = row.groupLabel;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  return (
    <div className="space-y-5">
      {Array.from(groups.entries()).map(([groupLabel, groupRows]) => (
        <Table key={groupLabel ?? "__single__"} groupLabel={groupLabel} rows={groupRows} />
      ))}
    </div>
  );
}
