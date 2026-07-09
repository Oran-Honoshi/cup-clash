import { FlagBadge } from "@/components/ui/FlagBadge";

export interface ScoreMatch {
  id: string;
  home: string;
  away: string;
  homeFlagCode: string | null;
  awayFlagCode: string | null;
  kickoffAt: string | null;
  status: string; // "upcoming" | "live" | "finished"
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  stage: string | null;
}

function StatusBadge({ match }: { match: ScoreMatch }) {
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#ef4444" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
        {match.minute != null ? `${match.minute}'` : "LIVE"}
      </span>
    );
  }
  if (match.status === "finished") {
    return <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--mt)" }}>FT</span>;
  }
  if (!match.kickoffAt) return <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ft)" }}>TBD</span>;
  return (
    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--mt)" }}>
      {new Date(match.kickoffAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

function dateKey(iso: string | null): string {
  if (!iso) return "Date TBD";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function MatchList({ matches }: { matches: ScoreMatch[] }) {
  const groups = new Map<string, ScoreMatch[]>();
  for (const m of matches) {
    const key = dateKey(m.kickoffAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([date, rows]) => (
        <div key={date}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mt)", marginBottom: 8 }}>
            {date}
          </div>
          <div style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)", overflow: "hidden" }}>
            {rows.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: i > 0 ? "1px solid var(--dv)" : undefined }}>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="truncate" style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, color: "var(--tx)" }}>{m.home}</span>
                  <FlagBadge code={m.homeFlagCode} size="sm" label={m.home} />
                </div>
                <div className="flex flex-col items-center shrink-0" style={{ width: 64 }}>
                  {m.status === "upcoming" ? (
                    <StatusBadge match={m} />
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
                      {m.homeScore ?? 0}–{m.awayScore ?? 0}
                    </span>
                  )}
                  {m.status !== "upcoming" && <StatusBadge match={m} />}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FlagBadge code={m.awayFlagCode} size="sm" label={m.away} />
                  <span className="truncate" style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, color: "var(--tx)" }}>{m.away}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
