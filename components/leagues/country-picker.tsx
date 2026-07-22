"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { FollowButton } from "@/components/leagues/follow-button";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import type { CountryRow } from "@/lib/services/countries";

interface SuggestedLeague {
  id: string;
  name: string;
}

interface CountryPickerProps {
  countries: CountryRow[];
  userId: string | null;
  followedCountryIds: Set<string>;
  // Country name -> that country's tracked domestic league, for the
  // "Also follow [country]'s major league?" one-tap suggestion. Only
  // countries with a currently-tracked league appear as keys.
  countryLeagues: Record<string, SuggestedLeague>;
  followedCompetitionIds: Set<string>;
}

export function CountryPicker({
  countries, userId, followedCountryIds, countryLeagues, followedCompetitionIds,
}: CountryPickerProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [suggestForId, setSuggestForId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [followedLeagueIds, setFollowedLeagueIds] = useState<Set<string>>(followedCompetitionIds);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, query]);

  return (
    <div className="space-y-4">
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
          placeholder={t("cf_search_placeholder")}
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

      {filtered.length === 0 && (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--mt)" }}>
          {interpolate(t("cf_no_match"), { query })}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => {
          const league = countryLeagues[c.name];
          const showSuggestion =
            suggestForId === c.id && !!league && !followedLeagueIds.has(league.id) && !dismissedIds.has(c.id);

          return (
            <div key={c.id} className="space-y-2">
              <div
                className="flex items-center justify-between gap-3 p-4"
                style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FlagBadge code={c.flag} size="md" label={c.name} />
                  <div
                    className="font-bold truncate"
                    style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--tx)" }}
                  >
                    {c.name}
                  </div>
                </div>
                <FollowButton
                  type="country"
                  id={c.id}
                  userId={userId}
                  initialFollowing={followedCountryIds.has(c.id)}
                  compact
                  onFollowChange={(following) => {
                    if (following && league) setSuggestForId(c.id);
                    else if (suggestForId === c.id) setSuggestForId(null);
                  }}
                />
              </div>

              {showSuggestion && league && (
                <div
                  className="flex items-center justify-between gap-3 p-3"
                  style={{ background: "var(--ip)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}
                >
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--tx)" }}>
                    {interpolate(t("cf_suggest_prompt"), { league: league.name, country: c.name })}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <FollowButton
                      type="competition"
                      id={league.id}
                      userId={userId}
                      initialFollowing={followedLeagueIds.has(league.id)}
                      compact
                      onFollowChange={(following) => {
                        if (following) {
                          setFollowedLeagueIds((prev) => new Set(prev).add(league.id));
                          setSuggestForId(null);
                        }
                      }}
                    />
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
                      }}
                    >
                      {t("cf_suggest_dismiss")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
