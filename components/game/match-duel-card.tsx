"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Swords, Check, X, Clock, Trophy, Search, Share2, ChevronLeft, Link2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BallLoader } from "@/components/ui/BallLoader";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { ScoreInputCC } from "@/components/ui/score-input-cc";
import { useLocale } from "@/components/i18n/locale-provider";
import { useWebShare } from "@/lib/hooks/use-web-share";
import { isMatchLocked } from "@/lib/isMatchLocked";
import { interpolate } from "@/lib/i18n";
import type { MatchDuelStatus, MatchDuelMatchInfo, MatchDuelSummary } from "@/lib/services/match-duels";
import { formatMatchDuelDate } from "@/lib/formatMatchDuelDate";

interface OpponentOption { id: string; name: string; avatarUrl: string | null }

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

function resultLabel(t: ReturnType<typeof useLocale>["t"], winner: MatchDuelSummary["winner"]): { text: string; color: string } {
  if (winner === "me") return { text: t("match_duel_result_win"), color: "#00c46a" };
  if (winner === "them") return { text: t("match_duel_result_lose"), color: "#f87171" };
  if (winner === "tie") return { text: t("match_duel_result_tie"), color: "var(--t2)" };
  return { text: t("match_duel_waiting_response"), color: "var(--t2)" };
}

// Match Duel — human-vs-human head-to-head score prediction on a specific
// match, keyed off match_duels (migration 066). Sibling of DuelCard (1v1
// Daily Duel, on today's word puzzle) but scoped to a chosen match instead
// of "today", and of OracleDuelInviteCard (user vs the Oracle, not vs a
// friend). Reuses DuelCard's opponent picker verbatim; adds a match-picker
// step and a share-link path DuelCard has no equivalent of, since a Match
// Duel invite can reach someone outside the app entirely.
export function MatchDuelCard({ userId }: { userId: string | null }) {
  const { t } = useLocale();
  const { share, copied } = useWebShare();

  const [duels, setDuels] = useState<MatchDuelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [step, setStep] = useState<"match" | "action" | "opponent">("match");
  const [matchQuery, setMatchQuery] = useState("");
  const [matchResults, setMatchResults] = useState<MatchDuelMatchInfo[]>([]);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchDuelMatchInfo | null>(null);
  const [sharing, setSharing] = useState(false);

  const [opponentQuery, setOpponentQuery] = useState("");
  const [groupMates, setGroupMates] = useState<OpponentOption[]>([]);
  const [searchResults, setSearchResults] = useState<OpponentOption[]>([]);
  const [searchingOpponents, setSearchingOpponents] = useState(false);
  const [challenging, setChallenging] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);

  const [scoreDraft, setScoreDraft] = useState<Record<string, { home: string; away: string }>>({});
  const [submittingScore, setSubmittingScore] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/match-duels");
      const data = (await res.json()) as { duels: MatchDuelSummary[] };
      setDuels(data.duels ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const resetPicker = useCallback(() => {
    setPickerOpen(false);
    setStep("match");
    setSelectedMatch(null);
    setMatchQuery("");
    setOpponentQuery("");
  }, []);

  useEffect(() => {
    if (!pickerOpen || step !== "match") return;
    setSearchingMatches(true);
    const handle = setTimeout(() => {
      fetch(`/api/match-duels/matches?q=${encodeURIComponent(matchQuery)}`)
        .then(r => r.json())
        .then((data: { matches: MatchDuelMatchInfo[] }) => setMatchResults(data.matches ?? []))
        .finally(() => setSearchingMatches(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [pickerOpen, step, matchQuery]);

  useEffect(() => {
    if (!pickerOpen || step !== "opponent") return;
    setSearchingOpponents(true);
    const handle = setTimeout(() => {
      fetch(`/api/match-duels/opponents?q=${encodeURIComponent(opponentQuery)}`)
        .then(r => r.json())
        .then((data: { groupMates: OpponentOption[]; searchResults: OpponentOption[] }) => {
          setGroupMates(data.groupMates ?? []);
          setSearchResults(data.searchResults ?? []);
        })
        .finally(() => setSearchingOpponents(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [pickerOpen, step, opponentQuery]);

  const shareInvite = useCallback(async (matchId: string, match: MatchDuelMatchInfo) => {
    setSharing(true);
    try {
      const res = await fetch("/api/match-duels/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { token: string };
      const url = typeof window !== "undefined" ? `${window.location.origin}/duel/${data.token}` : "";
      await share(`${interpolate(t("match_duel_share_text"), { home: match.home, away: match.away })}\n${url}`);
      resetPicker();
      await refresh();
    } finally {
      setSharing(false);
    }
  }, [share, t, resetPicker, refresh]);

  const challenge = useCallback(async (opponentId: string) => {
    if (!selectedMatch) return;
    setChallenging(opponentId);
    try {
      await fetch("/api/match-duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentId, matchId: selectedMatch.id }),
      });
      resetPicker();
      await refresh();
    } finally {
      setChallenging(null);
    }
  }, [selectedMatch, resetPicker, refresh]);

  const respond = useCallback(async (duelId: string, action: "accept" | "decline") => {
    setResponding(duelId);
    try {
      await fetch(`/api/match-duels/${duelId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await refresh();
    } finally {
      setResponding(null);
    }
  }, [refresh]);

  const submitScore = useCallback(async (duelId: string) => {
    const draft = scoreDraft[duelId];
    const home = Number(draft?.home);
    const away = Number(draft?.away);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return;
    setSubmittingScore(duelId);
    try {
      await fetch(`/api/match-duels/${duelId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore: home, awayScore: away }),
      });
      await refresh();
    } finally {
      setSubmittingScore(null);
    }
  }, [scoreDraft, refresh]);

  if (!userId) {
    return (
      <div className="p-5 cc-elevated flex items-center gap-3" style={surface}>
        <Swords size={22} style={{ color: "var(--ac)" }} />
        <div className="flex-1">
          <div className="text-sm font-black" style={{ color: "var(--tx)" }}>{t("match_duel_widget_title")}</div>
          <p className="text-xs mt-0.5" style={{ color: "var(--t2)" }}>{t("match_duel_sign_in_required")}</p>
        </div>
      </div>
    );
  }

  const seenPickerIds = new Set<string>();
  const opponentOptions: OpponentOption[] = [];
  for (const opt of [...groupMates, ...searchResults]) {
    if (!seenPickerIds.has(opt.id)) { seenPickerIds.add(opt.id); opponentOptions.push(opt); }
  }

  return (
    <div className="p-5 cc-elevated space-y-4" style={surface}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords size={18} style={{ color: "var(--ac)" }} />
          <span className="text-sm font-black uppercase tracking-wide" style={{ color: "var(--tx)" }}>{t("match_duel_widget_title")}</span>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: "var(--ac)", color: "#03110c" }}
        >
          {t("match_duel_challenge_cta")}
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>…</div>
      ) : duels.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--t2)" }}>{t("match_duel_empty")}</p>
      ) : (
        <div className="space-y-2">
          {duels.map(d => {
            const locked = isMatchLocked(d.match.kickoffAt);
            const resolved = d.pointsMe !== null;
            const draft = scoreDraft[d.id] ?? { home: "", away: "" };

            return (
              <div key={d.id} className="p-3 rounded-xl space-y-2" style={{ background: "var(--ip)" }}>
                <div className="flex items-center gap-3">
                  {d.opponent ? (
                    <UserAvatar name={d.opponent.name} avatarUrl={d.opponent.avatarUrl} size="sm" />
                  ) : (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--sf)" }}>
                      <Link2 size={14} style={{ color: "var(--mt)" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>
                      {d.opponent ? d.opponent.name : t("match_duel_waiting_claim")}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] truncate" style={{ color: "var(--t2)" }}>
                      {d.match.homeFlagCode && <FlagBadge code={d.match.homeFlagCode} label={d.match.home} size="sm" />}
                      <span className="truncate">{d.match.home} vs {d.match.away}</span>
                    </div>
                  </div>

                  {d.status === "pending" && d.direction === "received" ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" disabled={responding === d.id} onClick={() => respond(d.id, "accept")}
                        className="flex items-center justify-center h-7 w-7 rounded-lg" style={{ background: "rgba(0,196,106,0.15)" }}>
                        <Check size={14} style={{ color: "#00c46a" }} />
                      </button>
                      <button type="button" disabled={responding === d.id} onClick={() => respond(d.id, "decline")}
                        className="flex items-center justify-center h-7 w-7 rounded-lg" style={{ background: "rgba(248,113,113,0.15)" }}>
                        <X size={14} style={{ color: "#f87171" }} />
                      </button>
                    </div>
                  ) : d.status === "pending" && d.direction === "invite" && d.inviteToken ? (
                    <button
                      type="button"
                      onClick={() => shareInvite(d.match.id, d.match)}
                      className="flex items-center gap-1 shrink-0 text-[11px] font-bold px-2 py-1 rounded-lg"
                      style={{ color: "var(--ac)", background: "color-mix(in srgb, var(--ac) 12%, transparent)" }}
                    >
                      <Share2 size={12} /> {t("match_duel_share_again")}
                    </button>
                  ) : d.status === "pending" ? (
                    <Clock size={14} style={{ color: "var(--t2)" }} className="shrink-0" />
                  ) : d.status === "accepted" && resolved ? (
                    <Trophy size={16} style={{ color: resultLabel(t, d.winner).color }} className="shrink-0" />
                  ) : null}
                </div>

                {d.status === "pending" && d.direction === "received" && (
                  <div className="text-[11px]" style={{ color: "var(--t2)" }}>{t("match_duel_challenged_you")}</div>
                )}

                {d.status === "pending" && d.direction === "sent" && (
                  <div className="text-[11px]" style={{ color: "var(--t2)" }}>{t("match_duel_waiting_response")}</div>
                )}

                {d.status === "declined" && (
                  <div className="text-[11px]" style={{ color: "var(--t2)" }}>{t("match_duel_declined")}</div>
                )}

                {d.status === "accepted" && resolved && (
                  <div className="text-[11px] font-bold" style={{ color: resultLabel(t, d.winner).color }}>
                    {resultLabel(t, d.winner).text} — {d.pointsMe} : {d.pointsThem}
                  </div>
                )}

                {d.status === "accepted" && !resolved && d.myScore && (
                  <div className="text-[11px]" style={{ color: "var(--t2)" }}>
                    {interpolate(t("match_duel_your_pick"), { home: d.myScore.home, away: d.myScore.away })}
                  </div>
                )}

                {d.status === "accepted" && !resolved && !d.myScore && !locked && (
                  <div className="flex items-center gap-2">
                    <ScoreInputCC value={draft.home} onChange={v => setScoreDraft(s => ({ ...s, [d.id]: { ...draft, home: v } }))} size={36} />
                    <span style={{ color: "var(--mt)" }}>–</span>
                    <ScoreInputCC value={draft.away} onChange={v => setScoreDraft(s => ({ ...s, [d.id]: { ...draft, away: v } }))} size={36} />
                    <button
                      type="button"
                      disabled={submittingScore === d.id || draft.home === "" || draft.away === ""}
                      onClick={() => submitScore(d.id)}
                      className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                      style={{ background: "var(--ac)", color: "#03110c" }}
                    >
                      {submittingScore === d.id ? <BallLoader size="sm" /> : t("match_duel_score_submit")}
                    </button>
                  </div>
                )}

                {d.status === "accepted" && !resolved && !d.myScore && locked && (
                  <div className="text-[11px]" style={{ color: "var(--t2)" }}>{t("match_duel_locked_no_pick")}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pickerOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={resetPicker}
        >
          <div
            className="w-full sm:max-w-sm max-h-[70vh] overflow-y-auto p-5 space-y-3"
            style={{ ...surface, borderRadius: "22px 22px 0 0" }}
            onClick={e => e.stopPropagation()}
          >
            {step !== "match" && (
              <button type="button" onClick={() => setStep(step === "opponent" ? "action" : "match")}
                className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--t2)" }}>
                <ChevronLeft size={14} /> {t("match_duel_back")}
              </button>
            )}

            {step === "match" && (
              <>
                <div className="text-sm font-black" style={{ color: "var(--tx)" }}>{t("match_duel_step_pick_match_title")}</div>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--mt)" }} />
                  <input
                    type="text"
                    placeholder={t("match_duel_search_match_placeholder")}
                    value={matchQuery}
                    onChange={e => setMatchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
                  />
                </div>
                {searchingMatches ? (
                  <div className="py-6 flex justify-center"><BallLoader size="sm" /></div>
                ) : matchResults.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>{t("match_duel_no_matches_found")}</p>
                ) : (
                  <div className="space-y-1">
                    {matchResults.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setSelectedMatch(m); setStep("action"); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left"
                        style={{ background: "var(--ip)" }}
                      >
                        {m.homeFlagCode && <FlagBadge code={m.homeFlagCode} label={m.home} size="sm" />}
                        <span className="flex-1 text-xs font-bold truncate" style={{ color: "var(--tx)" }}>{m.home} vs {m.away}</span>
                        {m.awayFlagCode && <FlagBadge code={m.awayFlagCode} label={m.away} size="sm" />}
                        <span className="text-[10px] shrink-0" style={{ color: "var(--mt)" }}>{formatMatchDuelDate(m.kickoffAt)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === "action" && selectedMatch && (
              <>
                <div className="text-sm font-black" style={{ color: "var(--tx)" }}>{selectedMatch.home} vs {selectedMatch.away}</div>
                <button
                  type="button"
                  disabled={sharing}
                  onClick={() => shareInvite(selectedMatch.id, selectedMatch)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-60"
                  style={{ background: "var(--ac)", color: "#03110c" }}
                >
                  {sharing ? <BallLoader size="sm" /> : <><Share2 size={16} /> {copied ? t("match_duel_link_copied") : t("match_duel_share_link_cta")}</>}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("opponent")}
                  className="w-full py-3 rounded-xl text-sm font-bold"
                  style={{ background: "var(--ip)", color: "var(--tx)", border: "1px solid var(--br)" }}
                >
                  {t("match_duel_pick_friend_cta")}
                </button>
              </>
            )}

            {step === "opponent" && (
              <>
                <div className="text-sm font-black" style={{ color: "var(--tx)" }}>{t("match_duel_pick_friend_cta")}</div>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--mt)" }} />
                  <input
                    type="text"
                    placeholder={t("match_duel_search_friend_placeholder")}
                    value={opponentQuery}
                    onChange={e => setOpponentQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
                  />
                </div>
                {searchingOpponents ? (
                  <div className="py-6 flex justify-center"><BallLoader size="sm" /></div>
                ) : opponentOptions.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>
                    {opponentQuery.trim().length >= 2 ? t("match_duel_no_players_found") : t("match_duel_join_group_hint")}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {opponentOptions.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={challenging === opt.id}
                        onClick={() => challenge(opt.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left disabled:opacity-50"
                        style={{ background: "var(--ip)" }}
                      >
                        <UserAvatar name={opt.name} avatarUrl={opt.avatarUrl} size="sm" />
                        <span className="flex-1 text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{opt.name}</span>
                        {challenging === opt.id && <BallLoader size="sm" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
