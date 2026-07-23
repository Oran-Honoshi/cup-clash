"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import type { CompetitionRow } from "@/lib/services/competitions";
import { WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { FollowButton } from "@/components/leagues/follow-button";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";

interface CompetitionPickerProps {
  competitions: CompetitionRow[];
  activeSlug: string;
  basePath: string;
  userId: string | null;
  followedCompetitionIds: Set<string>;
  variant?: "chips" | "cards";
}

// Cap how many sibling competitions show at once (England currently has 3
// tracked: league + 2 cups) so the suggestion panel stays glanceable.
const MAX_SUGGESTIONS = 4;

export function CompetitionPicker({
  competitions, activeSlug, basePath, userId, followedCompetitionIds, variant = "chips",
}: CompetitionPickerProps) {
  const { t } = useLocale();
  const [followedIds, setFollowedIds] = useState<Set<string>>(followedCompetitionIds);
  const [suggestForId, setSuggestForId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {competitions.map((c) => {
          // Sibling competitions from the same country (e.g. Premier League
          // -> FA Cup, League Cup). competitions.confederation is unpopulated
          // app-wide today, so country is the only real signal here.
          const siblings = c.country
            ? competitions
                .filter((o) => o.id !== c.id && o.country === c.country && !followedIds.has(o.id))
                .slice(0, MAX_SUGGESTIONS)
            : [];
          const showSuggestion = suggestForId === c.id && siblings.length > 0 && !dismissedIds.has(c.id);

          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3 p-4"
                style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center shrink-0 rounded-xl"
                    style={{ width: 40, height: 40, background: "var(--ip)", color: "var(--ac)" }}>
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate" style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--tx)" }}>
                      {c.name}
                    </div>
                    <div className="uppercase tracking-widest" style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, color: "var(--mt)" }}>
                      {c.slug === WORLD_CUP_SLUG ? "Tournament" : c.type}
                    </div>
                  </div>
                </div>
                <FollowButton
                  type="competition"
                  id={c.id}
                  userId={userId}
                  initialFollowing={followedIds.has(c.id)}
                  compact
                  onFollowChange={(following) => {
                    if (following) {
                      setFollowedIds((prev) => new Set(prev).add(c.id));
                      if (siblings.length > 0) setSuggestForId(c.id);
                    } else if (suggestForId === c.id) {
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
                      {interpolate(t("cf_suggest_prompt"), { country: c.country ?? "" })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDismissedIds((prev) => new Set(prev).add(c.id))}
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
                          type="competition"
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
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {competitions.map((c) => {
        const active = c.slug === activeSlug;
        return (
          <Link
            key={c.id}
            href={`${basePath}?competition=${c.slug}`}
            className="inline-flex items-center gap-1.5 transition-all"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 100,
              background: active ? "var(--ac)" : "var(--sf)",
              color: active ? "var(--at)" : "var(--t2)",
              border: active ? "1px solid var(--ac)" : "1px solid var(--br)",
              textDecoration: "none",
            }}
          >
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
