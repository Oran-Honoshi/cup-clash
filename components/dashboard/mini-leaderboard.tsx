import Link from "next/link";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import type { Member } from "@/lib/types";

interface MiniLeaderboardProps {
  members:        Member[];
  groupId:        string;
  currentUserId?: string;
}

const RANK_COLORS = ["#fbbf24", "#94a3b8", "#f97316", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.3)"];

export function MiniLeaderboard({ members, groupId, currentUserId }: MiniLeaderboardProps) {
  const top5        = members.slice(0, 5);
  const totalExact  = members.reduce((s, m) => s + (m.exactScores        ?? 0), 0);
  const totalCorrect = members.reduce((s, m) => s + (m.correctPredictions ?? 0), 0);
  if (!top5.length) return null;

  return (
    <div
      className="w-full max-w-full"
      style={{
        borderRadius: 18,
        background: "rgba(12, 18, 32, 0.78)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
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
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Trophy size={15} strokeWidth={1.5} style={{ color: "#fbbf24", flexShrink: 0 }} />
        <span
          className="font-display text-lg uppercase text-white tracking-wide"
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
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.02)",
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
                background: "rgba(250,204,21,0.1)",
                border: "1px solid rgba(250,204,21,0.2)",
              }}
            >
              <Target size={10} style={{ color: "#facc15" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
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
                background: "rgba(0,255,136,0.08)",
                border: "1px solid rgba(0,255,136,0.2)",
              }}
            >
              <TrendingUp size={10} style={{ color: "#00FF88" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
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
              borderBottom: i < top5.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              background: isMe ? "rgba(0,255,136,0.06)" : "transparent",
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
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 13,
                  color: isMe ? "#00FF88" : "rgba(255,255,255,0.85)",
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
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span style={{ fontSize: 8 }}>{emoji}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>{label}:</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: value > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Points */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 900,
                fontSize: 17,
                color: isMe ? "#00FF88" : "white",
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
          color: "#00D4FF",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,212,255,0.03)",
        }}
      >
        View full leaderboard →
      </Link>
    </div>
  );
}
