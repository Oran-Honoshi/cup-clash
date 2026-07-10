import Link from "next/link";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { sortMembersForRanking } from "@/lib/leaderboard-sort";
import type { Member } from "@/lib/types";

interface MiniLeaderboardProps {
  members:        Member[];
  groupId:        string;
  currentUserId?: string;
}

const RANK_COLORS = ["var(--ac)", "var(--t2)", "var(--t2)", "var(--mt)", "var(--mt)"];

export function MiniLeaderboard({ members, groupId, currentUserId }: MiniLeaderboardProps) {
  const top5        = sortMembersForRanking(members).slice(0, 5);
  const totalExact  = members.reduce((s, m) => s + (m.exactScores        ?? 0), 0);
  const totalCorrect = members.reduce((s, m) => s + (m.correctPredictions ?? 0), 0);
  if (!top5.length) return null;

  return (
    <div
      className="w-full max-w-full cc-elevated"
      style={{
        borderRadius: 18,
        background: "var(--sf)",
        border: "1px solid var(--br)",
        boxShadow: `0 8px 32px var(--shad)`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "13px 18px",
          borderBottom: "1px solid var(--dv)",
        }}
      >
        <Trophy size={15} strokeWidth={1.5} style={{ color: "var(--ac)", flexShrink: 0 }} />
        <span
          className="font-display text-lg uppercase tracking-wide"
          style={{ color: "var(--tx)" }}
        >
          Top Players
        </span>
      </div>

      {/* Stat chips */}
      {(totalExact > 0 || totalCorrect > 0) && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 18px",
            borderBottom: "1px solid var(--dv)",
            background: "color-mix(in srgb, var(--tx) 2%, transparent)",
            flexWrap: "wrap",
          }}
        >
          {totalExact > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                borderRadius: 999,
                padding: "3px 10px",
                background: "var(--ip)",
                border: "1px solid var(--br)",
              }}
            >
              <Target size={10} style={{ color: "var(--t2)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)" }}>
                {totalExact} exact
              </span>
            </div>
          )}
          {totalCorrect > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                borderRadius: 999,
                padding: "3px 10px",
                background: "color-mix(in srgb, var(--ac) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--ac) 20%, transparent)",
              }}
            >
              <TrendingUp size={10} style={{ color: "var(--ac)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)" }}>
                {totalCorrect} correct
              </span>
            </div>
          )}
        </div>
      )}

      {/* Rows */}
      {top5.map((member, i) => {
        const isMe = member.id === currentUserId;
        return (
          <div
            key={member.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 18px",
              borderBottom: i < top5.length - 1 ? "1px solid var(--dv)" : "none",
              background: isMe ? "color-mix(in srgb, var(--ac) 6%, transparent)" : "transparent",
            }}
          >
            {/* Rank */}
            <span
              style={{
                width: 18,
                flexShrink: 0,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 12,
                color: RANK_COLORS[i],
                textAlign: "center",
              }}
            >
              {i + 1}
            </span>

            {/* Avatar */}
            <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" ring={isMe} />

            {/* Name + chips */}
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <span
                className="ta-body"
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 13,
                  color: isMe ? "var(--ac)" : "var(--tx)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {member.name}
              </span>
              {(member.gsPts || member.knockoutPts || member.bestThirdPts || member.bonusPts) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
                  {[
                    { emoji: "⚽", label: "GS",    value: member.gsPts        ?? 0 },
                    { emoji: "🏆", label: "KO",    value: member.knockoutPts  ?? 0 },
                    { emoji: "🥉", label: "3rd",   value: member.bestThirdPts ?? 0 },
                    { emoji: "🌟", label: "Bonus", value: member.bonusPts     ?? 0 },
                  ].map(({ emoji, label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: 999,
                        padding: "1px 5px",
                        background: "var(--dv)",
                        border: "1px solid var(--br)",
                      }}
                    >
                      <span style={{ fontSize: 8 }}>{emoji}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "var(--ft)" }}>{label}:</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: value > 0 ? "var(--t2)" : "var(--ft)", fontFamily: "var(--font-mono)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Points */}
            <span
              className="ta-lb-points"
              style={{
                color: isMe ? "var(--ac)" : "var(--tx)",
                flexShrink: 0,
              }}
            >
              {member.points}
            </span>
          </div>
        );
      })}

      {/* Footer link */}
      <Link
        href={`/leaderboard?group=${groupId}`}
        style={{
          display: "block",
          padding: "11px 18px",
          textAlign: "center",
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--ac)",
          borderTop: "1px solid var(--dv)",
          background: "color-mix(in srgb, var(--ac) 3%, transparent)",
        }}
      >
        View full leaderboard →
      </Link>
    </div>
  );
}
