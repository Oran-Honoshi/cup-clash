"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Search, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { BallLoader } from "@/components/ui/BallLoader";

// "Matchday MVP" community vote — see lib/services/community-vote.ts for the
// candidate-selection/close-timing logic. Candidates are the two squads'
// full rosters (no per-match lineup data exists in this app — see the
// "Lineups not available" tab above), so this is deliberately framed as
// "vote for who deserves it", not "confirm who played".

interface VoteOption {
  optionId: string;
  playerId: string;
  fullName: string;
  photo: string | null;
  country: string;
}

interface VoteResult {
  optionId: string;
  votes: number;
  pct: number;
}

interface VoteResponse {
  open: boolean;
  voteId?: string;
  closesAt?: string;
  closed?: boolean;
  options?: VoteOption[];
  userOptionId?: string | null;
  totalVotes?: number;
  results?: VoteResult[] | null;
}

export function MvpVotePanel({ matchId, home, away }: { matchId: string; home: string; away: string }) {
  const { t } = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<VoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [casting, setCasting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!cancelled) setUserId(user?.id ?? null);

      const res = await fetch(`/api/community-vote/${matchId}`);
      const data = (await res.json()) as VoteResponse;
      if (!cancelled) {
        setState(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [matchId]);

  const handleVote = useCallback(async (optionId: string) => {
    if (!state?.voteId || casting) return;
    setCasting(optionId);
    setError(null);
    try {
      const res = await fetch(`/api/community-vote/${matchId}/cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteId: state.voteId, optionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === "already_voted" ? t("mvp_vote_error_already") : t("mvp_vote_error_closed"));
        return;
      }
      setState(data as VoteResponse);
    } finally {
      setCasting(null);
    }
  }, [matchId, state, casting, t]);

  const resultsByOption = useMemo(() => {
    const map = new Map<string, VoteResult>();
    for (const r of state?.results ?? []) map.set(r.optionId, r);
    return map;
  }, [state?.results]);

  const totalVotes = state?.totalVotes ?? 0;
  const votedOption = state?.options?.find(o => o.optionId === state.userOptionId) ?? null;

  // Only switch to results-bar styling once voting has genuinely closed, or
  // there's at least one real vote to show a meaningful percentage for —
  // otherwise an open, zero-vote poll reads as a broken/abandoned one.
  const hasResults = !!state?.closed || totalVotes > 0;
  // Whether a click can still cast a vote — independent of hasResults, so
  // one early vote revealing live percentages doesn't lock everyone else out.
  const couldVote = !state?.closed && !votedOption;
  const canVote = couldVote && !!userId;

  const q = search.trim().toLowerCase();
  const visibleOptions = useMemo(() => {
    const opts = state?.options ?? [];
    const filtered = q ? opts.filter(o => o.fullName.toLowerCase().includes(q)) : opts;
    if (!hasResults) return filtered;
    return [...filtered].sort((a, b) => (resultsByOption.get(b.optionId)?.pct ?? 0) - (resultsByOption.get(a.optionId)?.pct ?? 0));
  }, [state?.options, q, hasResults, resultsByOption]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <BallLoader size="sm" />
      </div>
    );
  }

  if (!state?.open) {
    return (
      <div className="py-8 text-center text-sm" style={{ color: "var(--mt)" }}>
        {t("mvp_vote_not_open")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-black" style={{ color: "var(--tx)" }}>{t("mvp_vote_heading")}</div>
        <p className="text-xs mt-0.5" style={{ color: "var(--mt)" }}>{t("mvp_vote_tagline")}</p>
      </div>

      {state.closed && (
        <div className="text-xs font-bold px-3 py-1.5 rounded-full inline-block" style={{ background: "var(--ip)", color: "var(--mt)" }}>
          {t("mvp_vote_closed")}
        </div>
      )}

      {votedOption && (
        <div className="text-xs font-bold" style={{ color: "var(--ac)" }}>
          {interpolate(t("mvp_vote_you_voted"), { name: votedOption.fullName })}
        </div>
      )}

      {error && (
        <div className="text-xs font-bold" style={{ color: "#f87171" }}>{error}</div>
      )}

      {couldVote && (
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--mt)" }} />
          <input
            type="text"
            placeholder={t("mvp_vote_search")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
          />
        </div>
      )}

      {!userId && couldVote && (
        <div className="text-xs" style={{ color: "var(--mt)" }}>{t("mvp_vote_signin_prompt")}</div>
      )}

      <div className="rounded-2xl overflow-hidden max-h-96 overflow-y-auto" style={{ background: "var(--sf)", border: "1px solid var(--br)" }}>
        {visibleOptions.map(option => {
          const result = resultsByOption.get(option.optionId);
          const isMine = option.optionId === state.userOptionId;
          const isHomeTeam = option.country === home;
          return (
            <button
              key={option.optionId}
              type="button"
              disabled={!canVote || casting !== null}
              onClick={() => handleVote(option.optionId)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b last:border-0 text-left transition-colors disabled:cursor-default"
              style={{ borderColor: "var(--br)", background: isMine ? "rgba(0,212,255,0.08)" : "transparent" }}
            >
              {option.photo ? (
                <img src={option.photo} alt={option.fullName} className="w-8 h-8 rounded-full object-cover shrink-0" style={{ background: "var(--ip)" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--ip)" }}>
                  <User size={14} style={{ color: "var(--mt)" }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{option.fullName}</span>
                  {isMine && <Check size={12} style={{ color: "#00D4FF" }} className="shrink-0" />}
                </div>
                <span className="text-[10px]" style={{ color: "var(--mt)" }}>{isHomeTeam ? home : away}</span>
                {hasResults && result && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--ip)", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.max(result.pct > 0 ? 4 : 0, result.pct)}%`, height: "100%", borderRadius: 3,
                        background: "linear-gradient(90deg, #00D4FF, #00FF88)", transition: "width 0.5s",
                      }} />
                    </div>
                    <span className="text-[10px] font-bold shrink-0" style={{ color: "var(--mt)", width: 28, textAlign: "right" }}>
                      {result.pct}%
                    </span>
                  </div>
                )}
              </div>
              {casting === option.optionId && <BallLoader size="sm" />}
            </button>
          );
        })}
        {visibleOptions.length === 0 && (
          <div className="text-xs text-center py-4" style={{ color: "var(--mt)" }}>—</div>
        )}
      </div>

      {hasResults && (
        <div className="text-[11px]" style={{ color: "var(--mt)" }}>
          {interpolate(t("mvp_vote_total_votes"), { count: totalVotes })}
        </div>
      )}
    </div>
  );
}
