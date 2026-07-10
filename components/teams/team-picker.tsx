"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { FollowButton } from "@/components/leagues/follow-button";
import type { CompetitionTeams } from "@/lib/services/teams";

interface TeamPickerProps {
  groups: CompetitionTeams[];
  userId: string | null;
  followedTeamIds: Set<string>;
}

export function TeamPicker({ groups, userId, followedTeamIds }: TeamPickerProps) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, teams: g.teams.filter((t) => t.name.toLowerCase().includes(q)) }))
      .filter((g) => g.teams.length > 0);
  }, [groups, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--mt)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams…"
          style={{
            width: "100%",
            fontFamily: "var(--font-ui)",
            fontSize: 14,
            padding: "10px 14px 10px 38px",
            borderRadius: 12,
            background: "var(--sf)",
            border: "1px solid var(--br)",
            color: "var(--tx)",
            outline: "none",
          }}
        />
      </div>

      {filteredGroups.length === 0 && (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--mt)" }}>
          No teams match &quot;{query}&quot;.
        </p>
      )}

      {filteredGroups.map((g) => (
        <div key={g.competition.id} className="space-y-3">
          <div
            className="uppercase tracking-widest"
            style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, color: "var(--mt)" }}
          >
            {g.competition.name}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {g.teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-4"
                style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FlagBadge code={t.badgeUrl} size="md" label={t.name} />
                  <div className="min-w-0">
                    <div
                      className="font-bold truncate"
                      style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--tx)" }}
                    >
                      {t.name}
                    </div>
                  </div>
                </div>
                <FollowButton
                  type="team"
                  id={t.id}
                  userId={userId}
                  initialFollowing={followedTeamIds.has(t.id)}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
