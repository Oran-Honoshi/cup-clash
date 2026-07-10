import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { getTeamColor } from "@/lib/countries";
import type { TeamRow } from "@/lib/services/teams";
import type { TeamRecentResult } from "@/lib/services/matches";

export interface MyTeamEntry {
  team: TeamRow;
  results: TeamRecentResult[];
}

interface MyTeamsSectionProps {
  teams: MyTeamEntry[];
  /** Viewer's own "Your Team" country selection — tints the empty-state accent when set. */
  teamCountry?: string | null;
}

const OUTCOME_COLOR: Record<TeamRecentResult["outcome"], string> = {
  W: "#5aaa6a",
  D: "var(--mt)",
  L: "#cc4444",
};

function ResultDot({ outcome }: { outcome: TeamRecentResult["outcome"] }) {
  return (
    <span
      title={outcome === "W" ? "Win" : outcome === "L" ? "Loss" : "Draw"}
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: OUTCOME_COLOR[outcome],
      }}
    />
  );
}

export function MyTeamsSection({ teams, teamCountry }: MyTeamsSectionProps) {
  const teamColor = getTeamColor(teamCountry);
  return (
    <div
      className="-mx-4 sm:-mx-6 px-4 sm:px-6"
      style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 12, borderBottom: "1px solid var(--br)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="ta-section-label">My Teams</div>
        {teams.length > 0 && (
          <Link
            href="/leagues?tab=teams"
            style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, color: "var(--ac)", textDecoration: "none" }}
          >
            Edit
          </Link>
        )}
      </div>

      {teams.length === 0 ? (
        <Link
          href="/leagues?tab=teams"
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "var(--sf)", border: "1px solid var(--br)", textDecoration: "none" }}
        >
          <div
            className="flex items-center justify-center shrink-0 rounded-xl"
            style={teamColor
              ? { width: 36, height: 36, background: `rgb(${teamColor.accent} / 0.14)`, color: `rgb(${teamColor.accent})` }
              : { width: 36, height: 36, background: "var(--ip)", color: "var(--ac)" }}
          >
            <Shield size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold" style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--tx)" }}>
              Pick your teams
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--mt)" }}>
              Follow teams to see their results here
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--mt)" }} />
        </Link>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {teams.map(({ team, results }) => (
            <Link
              key={team.id}
              href={`/news?team=${team.id}`}
              className="shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{ width: 92, background: "var(--sf)", border: "1px solid var(--br)", textDecoration: "none" }}
            >
              <FlagBadge code={team.badgeUrl} label={team.name} size="md" />
              <div
                className="truncate w-full text-center font-bold"
                style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--tx)" }}
              >
                {team.name}
              </div>
              <div className="flex items-center gap-1">
                {results.length === 0 ? (
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--mt)" }}>No results yet</span>
                ) : (
                  results.slice().reverse().map((r) => <ResultDot key={r.matchId} outcome={r.outcome} />)
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
