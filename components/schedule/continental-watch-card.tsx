import { FlagBadge } from "@/components/ui/FlagBadge";
import { serverT } from "@/lib/server-locale";
import type { ContinentalTie } from "@/lib/services/matches";

interface ContinentalWatchCardProps {
  ties: ContinentalTie[];
}

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// Derived view: for any followed team with an upcoming tie in a
// confederation-wide competition (UCL/UEL/UECL/Libertadores/Sudamericana —
// see getContinentalInvolvement), surface it here. No new follow type —
// this is entirely computed from the same followedTeamIds Schedule already
// fetches for isFollowed()/the "Following" filter.
export function ContinentalWatchCard({ ties }: ContinentalWatchCardProps) {
  return (
    <div className="-mx-4 sm:-mx-6 px-4 sm:px-6" style={{ paddingTop: 4, paddingBottom: 12 }}>
      <div className="ta-section-label mb-2">{serverT("cw_title")}</div>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {ties.map((tie) => (
          <div
            key={tie.matchId}
            className="shrink-0 flex flex-col gap-1.5 p-3 rounded-xl"
            style={{ width: 200, background: "var(--sf)", border: "1px solid var(--br)" }}
          >
            <div
              style={{
                fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ac)",
              }}
            >
              {tie.competitionName}
            </div>
            <div className="flex items-center gap-2">
              <FlagBadge code={tie.teamFlag} size="sm" label={tie.teamName} />
              <div className="min-w-0">
                <div
                  className="font-bold truncate"
                  style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--tx)" }}
                >
                  {tie.teamName}
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--mt)" }}>
                  {serverT("cw_vs")} {tie.opponent}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--mt)" }}>
              {formatKickoff(tie.kickoffAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
