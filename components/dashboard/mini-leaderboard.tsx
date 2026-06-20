import Link from "next/link";
import { Trophy } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import type { Member } from "@/lib/types";

interface MiniLeaderboardProps {
  members:        Member[];
  groupId:        string;
  currentUserId?: string;
}

const RANK_COLORS = ["#fbbf24", "#94a3b8", "#f97316", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.3)"];

export function MiniLeaderboard({ members, groupId, currentUserId }: MiniLeaderboardProps) {
  const top5 = members.slice(0, 5);
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

            {/* Name */}
            <span
              style={{
                flex: 1,
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
