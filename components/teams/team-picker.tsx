"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { FollowButton } from "@/components/leagues/follow-button";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import type { CompetitionTeams, TeamRow } from "@/lib/services/teams";

interface TeamPickerProps {
  groups: CompetitionTeams[];
  userId: string | null;
  followedTeamIds: Set<string>;
}

// Cap how many sibling teams show at once — a World Cup group or a full
// league table has far more teams than fit in a glanceable suggestion.
const MAX_SUGGESTIONS = 4;

export function TeamPicker({ groups, userId, followedTeamIds }: TeamPickerProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [followedIds, setFollowedIds] = useState<Set<string>>(followedTeamIds);
  const [suggestForId, setSuggestForId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const teamToGroup = useMemo(() => {
    const map = new Map<string, CompetitionTeams>();
    for (const g of groups) for (const team of g.teams) map.set(team.id, g);
    return map;
  }, [groups]);

  const siblingsFor = (teamId: string): TeamRow[] => {
    const group = teamToGroup.get(teamId);
    if (!group) return [];
    return group.teams.filter((s) => s.id !== teamId && !followedIds.has(s.id)).slice(0, MAX_SUGGESTIONS);
  };

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
            {g.teams.map((team) => {
              const siblings = siblingsFor(team.id);
              const showSuggestion = suggestForId === team.id && siblings.length > 0 && !dismissedIds.has(team.id);

              return (
                <div key={team.id} className="space-y-2">
                  <div
                    className="flex items-center justify-between gap-3 p-4"
                    style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FlagBadge code={team.badgeUrl} size="md" label={team.name} />
                      <div className="min-w-0">
                        <div
                          className="font-bold truncate"
                          style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--tx)" }}
                        >
                          {team.name}
                        </div>
                      </div>
                    </div>
                    <FollowButton
                      type="team"
                      id={team.id}
                      userId={userId}
                      initialFollowing={followedIds.has(team.id)}
                      compact
                      onFollowChange={(following) => {
                        if (following) {
                          setFollowedIds((prev) => new Set(prev).add(team.id));
                          if (siblings.length > 0) setSuggestForId(team.id);
                        } else if (suggestForId === team.id) {
                          setSuggestForId(null);
                        }
                      }}
                    />
                  </div>

                  {showSuggestion && (
                    <div
                      className="space-y-2 p-3"
                      style={{ background: "var(--ip)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--tx)" }}>
                          {interpolate(t("tps_suggest_header"), { competition: g.competition.name })}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDismissedIds((prev) => new Set(prev).add(team.id))}
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--mt)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {t("cf_suggest_dismiss")}
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {siblings.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-3">
                            <div
                              className="truncate"
                              style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--tx)" }}
                            >
                              {s.name}
                            </div>
                            <FollowButton
                              type="team"
                              id={s.id}
                              userId={userId}
                              initialFollowing={followedIds.has(s.id)}
                              compact
                              onFollowChange={(following) => {
                                if (following) setFollowedIds((prev) => new Set(prev).add(s.id));
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
