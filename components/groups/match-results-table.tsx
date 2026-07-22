"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trophy, Check, X } from "lucide-react";
import { flagUrl } from "@/lib/countries";
import { getSessionCached, setSessionCached } from "@/lib/session-cache";

interface FinishedMatch {
  id: string;
  home: string;
  away: string;
  home_score: number;
  away_score: number;
  home_score_et: number | null;
  away_score_et: number | null;
  home_flag: string | null;
  away_flag: string | null;
  kickoff_at: string;
  stage: string;
  group_letter: string | null;
  status: string;
}

interface MemberPrediction {
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  points_earned: number;
  is_exact: boolean;
}

interface Member {
  user_id: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

interface Props {
  groupId: string;
  members: Member[];
}

const glass = {
  background: "var(--sf)",
  border: "1px solid var(--br)",
  borderRadius: 18,
  overflow: "hidden",
} as const;

interface ResultsResponse {
  matches: FinishedMatch[];
  predictions: MemberPrediction[];
  totals: Record<string, number>;
}

export function MatchResultsTable({ groupId, members }: Props) {
  const [matches, setMatches] = useState<FinishedMatch[]>([]);
  const [predictions, setPredictions] = useState<MemberPrediction[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `match-results:${groupId}`;
    const cached = getSessionCached<ResultsResponse>(cacheKey);
    if (cached !== undefined) {
      setMatches(cached.matches ?? []);
      setPredictions(cached.predictions ?? []);
      setTotals(cached.totals ?? {});
      setLoading(false);
      return;
    }

    fetch(`/api/groups/${groupId}/results`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: ResultsResponse) => {
        setMatches(data.matches ?? []);
        setPredictions(data.predictions ?? []);
        setTotals(data.totals ?? {});
        setSessionCached(cacheKey, data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [groupId]);

  const predMap: Record<string, Record<string, MemberPrediction>> = {};
  predictions.forEach(p => {
    if (!predMap[p.match_id]) predMap[p.match_id] = {};
    predMap[p.match_id][p.user_id] = p;
  });

  if (loading) {
    return (
      <div className="rounded-2xl p-8 text-center" style={glass}>
        <div className="text-sm animate-pulse" style={{ color: "var(--mt)" }}>Loading results…</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center space-y-2" style={glass}>
        <div className="text-3xl">⏳</div>
        <div className="text-sm font-bold" style={{ color: "var(--t2)" }}>No matches yet</div>
        <div className="text-xs" style={{ color: "var(--ft)" }}>Matches appear here once the schedule is confirmed</div>
      </div>
    );
  }

  const minWidth = Math.max(520, 160 + members.length * 108);

  return (
    <div style={glass}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--br)" }}>
              <th
                className="text-left px-4 py-3 sticky left-0 z-10"
                style={{ background: "var(--sf)", minWidth: 160 }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ft)" }}>
                  Match
                </span>
              </th>
              {members.map(m => (
                <th
                  key={m.user_id}
                  className="px-2 py-3 text-center"
                  style={{ minWidth: 100 }}
                >
                  <span
                    className="text-[11px] font-bold block truncate mx-auto"
                    style={{ color: "var(--t2)", maxWidth: 88 }}
                    title={m.profiles?.name ?? "?"}
                  >
                    {m.profiles?.name ?? "?"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map((match, i) => {
              const rowBg = i % 2 === 0 ? "var(--sf)" : "var(--ip)";
              return (
                <tr key={match.id} style={{ borderBottom: "1px solid var(--dv)" }}>
                  <td
                    className="px-4 py-3 sticky left-0 z-10"
                    style={{ background: rowBg, minWidth: 160 }}
                  >
                    <MatchCell match={match} />
                  </td>
                  {members.map(m => {
                    const pred = predMap[match.id]?.[m.user_id];
                    return (
                      <td key={m.user_id} className="px-2 py-3 text-center">
                        <PredCell pred={pred} matchStatus={match.status} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid rgba(0,212,255,0.2)", background: "rgba(0,212,255,0.04)" }}>
              <td
                className="px-4 py-3 sticky left-0 z-10"
                style={{ background: "var(--sf)" }}
              >
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#00D4FF" }}>
                  Total
                </span>
              </td>
              {members.map(m => (
                <td key={m.user_id} className="px-2 py-3 text-center">
                  <span className="text-sm font-black font-mono" style={{ color: "#00D4FF" }}>
                    {totals[m.user_id] ?? 0}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchCell({ match }: { match: FinishedMatch }) {
  const date = new Date(match.kickoff_at);
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";
  const hideScore = isLive || isUpcoming;
  const wentToET = match.home_score_et != null && match.away_score_et != null;

  return (
    <div className="space-y-1">
      {isLive && (
        <div className="flex items-center gap-1 mb-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#f87171" }}>Live</span>
        </div>
      )}
      {isUpcoming && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--ft)" }}>Upcoming</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        {match.home_flag && (
          <div className="relative h-3.5 w-5 rounded-sm overflow-hidden shrink-0">
            <Image
              src={flagUrl(match.home_flag, 20)}
              alt={match.home}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <span
          className="text-xs font-bold truncate flex-1"
          style={{ color: "var(--tx)", maxWidth: 88 }}
        >
          {match.home}
        </span>
        <span className="text-xs font-black tabular-nums" style={{ color: isLive ? "#f87171" : "var(--tx)" }}>
          {hideScore ? "–" : (match.home_score_et ?? match.home_score)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {match.away_flag && (
          <div className="relative h-3.5 w-5 rounded-sm overflow-hidden shrink-0">
            <Image
              src={flagUrl(match.away_flag, 20)}
              alt={match.away}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <span
          className="text-xs font-bold truncate flex-1"
          style={{ color: "var(--tx)", maxWidth: 88 }}
        >
          {match.away}
        </span>
        <span className="text-xs font-black tabular-nums" style={{ color: isLive ? "#f87171" : "var(--tx)" }}>
          {hideScore ? "–" : (match.away_score_et ?? match.away_score)}
        </span>
      </div>
      {wentToET && !hideScore && (
        <div className="text-[9px] font-bold" style={{ color: "var(--mt)" }}>
          {match.home_score}–{match.away_score} (90&apos;) · AET
        </div>
      )}
      <div className="text-[10px]" style={{ color: "var(--ft)" }}>
        {dateStr}
        {match.group_letter && (
          <span className="ml-1.5 font-bold" style={{ color: "var(--ft)" }}>
            Grp {match.group_letter}
          </span>
        )}
      </div>
    </div>
  );
}

function PredCell({ pred, matchStatus }: { pred: MemberPrediction | undefined; matchStatus: string }) {
  if (!pred) {
    return (
      <span className="text-lg" style={{ color: "var(--ft)" }}>—</span>
    );
  }

  // Upcoming match: don't reveal the actual pick pre-kickoff (matches the
  // convention elsewhere in the app — other members' scores only reveal
  // once a match goes live), just show that a pick has been locked in.
  if (matchStatus === "upcoming") {
    return (
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--mt)" }} title="Prediction locked in" />
    );
  }

  const predStr = `${pred.home_score}-${pred.away_score}`;

  // Live match: show prediction without result badge (points not awarded yet)
  if (matchStatus === "live") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-mono text-xs font-bold" style={{ color: "var(--t2)" }}>
          {predStr}
        </span>
      </div>
    );
  }

  const pts = pred.points_earned ?? 0;

  if (pred.is_exact) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ background: "color-mix(in srgb, var(--sc) 18%, transparent)", border: "1px solid color-mix(in srgb, var(--sc) 40%, transparent)" }}
        >
          <Trophy size={10} style={{ color: "var(--sc)", flexShrink: 0 }} />
          <span className="text-xs font-bold tabular-nums" style={{ color: "var(--sc)" }}>{predStr}</span>
        </div>
        <span className="text-[10px] font-black" style={{ color: "var(--sc)" }}>+{pts}</span>
      </div>
    );
  }

  if (pts > 0) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ background: "color-mix(in srgb, var(--ac) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 28%, transparent)" }}
        >
          <Check size={10} style={{ color: "var(--ac)", flexShrink: 0 }} />
          <span className="text-xs font-bold tabular-nums" style={{ color: "var(--ac)" }}>{predStr}</span>
        </div>
        <span className="text-[10px] font-black" style={{ color: "var(--ac)" }}>+{pts}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)" }}
      >
        <X size={10} style={{ color: "#f87171", flexShrink: 0 }} />
        <span className="text-xs font-bold tabular-nums" style={{ color: "var(--mt)" }}>{predStr}</span>
      </div>
      <span className="text-[10px]" style={{ color: "var(--ft)" }}>+0</span>
    </div>
  );
}
