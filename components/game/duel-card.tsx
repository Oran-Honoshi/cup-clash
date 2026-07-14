"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Swords, Check, X, Clock, Trophy, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BallLoader } from "@/components/ui/BallLoader";

type DuelStatus = "pending" | "accepted" | "declined";
type DuelWinner = "me" | "opponent" | "tie" | null;

interface DuelSummary {
  id: string;
  status: DuelStatus;
  direction: "sent" | "received";
  opponent: { id: string; name: string; avatarUrl: string | null };
  me: { attempted: boolean; solved: boolean; guessCount: number; completedAt: string | null };
  opponentResult: { attempted: boolean; solved: boolean; guessCount: number; completedAt: string | null };
  winner: DuelWinner;
}

interface OpponentOption { id: string; name: string; avatarUrl: string | null }

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

function resultLabel(winner: DuelWinner): { text: string; color: string } {
  if (winner === "me") return { text: "You won", color: "#00c46a" };
  if (winner === "opponent") return { text: "You lost", color: "#f87171" };
  if (winner === "tie") return { text: "Tied", color: "var(--t2)" };
  return { text: "In progress", color: "var(--t2)" };
}

// 1v1 Daily Duel — new for Phase 3, distinct from Rival Tracker (that's
// season-long; this is one day's Daily Challenge, head-to-head). Requires
// an account on both sides; anonymous visitors see a sign-in prompt.
export function DuelCard({ userId }: { userId: string | null }) {
  const [duels, setDuels] = useState<DuelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groupMates, setGroupMates] = useState<OpponentOption[]>([]);
  const [searchResults, setSearchResults] = useState<OpponentOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [challenging, setChallenging] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/duels");
      const data = (await res.json()) as { duels: DuelSummary[] };
      setDuels(data.duels ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!pickerOpen || !userId) return;
    setSearching(true);
    const handle = setTimeout(() => {
      fetch(`/api/duels/opponents?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then((data: { groupMates: OpponentOption[]; searchResults: OpponentOption[] }) => {
          setGroupMates(data.groupMates ?? []);
          setSearchResults(data.searchResults ?? []);
        })
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [pickerOpen, query, userId]);

  const challenge = useCallback(async (opponentId: string) => {
    setChallenging(opponentId);
    try {
      await fetch("/api/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentId }),
      });
      setPickerOpen(false);
      setQuery("");
      await refresh();
    } finally {
      setChallenging(null);
    }
  }, [refresh]);

  const respond = useCallback(async (duelId: string, action: "accept" | "decline") => {
    setResponding(duelId);
    try {
      await fetch(`/api/duels/${duelId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await refresh();
    } finally {
      setResponding(null);
    }
  }, [refresh]);

  if (!userId) {
    return (
      <div className="p-5 cc-elevated flex items-center gap-3" style={surface}>
        <Swords size={22} style={{ color: "var(--ac)" }} />
        <div className="flex-1">
          <div className="text-sm font-black" style={{ color: "var(--tx)" }}>1v1 Duel</div>
          <p className="text-xs mt-0.5" style={{ color: "var(--t2)" }}>Sign in to challenge a friend to today's puzzle.</p>
        </div>
      </div>
    );
  }

  const alreadyChallenged = new Set(duels.filter(d => d.status !== "declined").map(d => d.opponent.id));
  const seenPickerIds = new Set<string>();
  const pickerOptions: OpponentOption[] = [];
  for (const opt of [...groupMates, ...searchResults]) {
    if (!seenPickerIds.has(opt.id)) { seenPickerIds.add(opt.id); pickerOptions.push(opt); }
  }

  return (
    <div className="p-5 cc-elevated space-y-4" style={surface}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords size={18} style={{ color: "var(--ac)" }} />
          <span className="text-sm font-black uppercase tracking-wide" style={{ color: "var(--tx)" }}>1v1 Duel</span>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: "var(--ac)", color: "#03110c" }}
        >
          Challenge a friend
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>…</div>
      ) : duels.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--t2)" }}>No duels today yet — challenge a friend to today's Daily Challenge.</p>
      ) : (
        <div className="space-y-2">
          {duels.map(d => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--ip)" }}>
              <UserAvatar name={d.opponent.name} avatarUrl={d.opponent.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{d.opponent.name}</div>
                <div className="text-[11px]" style={{ color: "var(--t2)" }}>
                  {d.status === "pending" && d.direction === "received" ? "Challenged you" :
                   d.status === "pending" ? "Waiting for response" :
                   d.status === "declined" ? "Declined" :
                   resultLabel(d.winner).text}
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
              ) : d.status === "pending" ? (
                <Clock size={14} style={{ color: "var(--t2)" }} className="shrink-0" />
              ) : d.status === "accepted" && d.winner ? (
                <Trophy size={16} style={{ color: resultLabel(d.winner).color }} className="shrink-0" />
              ) : null}
            </div>
          ))}
        </div>
      )}

      {pickerOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm max-h-[70vh] overflow-y-auto p-5 space-y-3"
            style={{ ...surface, borderRadius: "22px 22px 0 0" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-sm font-black" style={{ color: "var(--tx)" }}>Challenge a friend</div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--mt)" }} />
              <input
                type="text"
                placeholder="Search by name…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ background: "var(--ip)", border: "1px solid var(--br)", color: "var(--tx)" }}
              />
            </div>

            {searching ? (
              <div className="py-6 flex justify-center"><BallLoader size="sm" /></div>
            ) : pickerOptions.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "var(--t2)" }}>
                {query.trim().length >= 2 ? "No players found." : "Join a group to see group-mates here, or search by name."}
              </p>
            ) : (
              <div className="space-y-1">
                {pickerOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={challenging === opt.id || alreadyChallenged.has(opt.id)}
                    onClick={() => challenge(opt.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left disabled:opacity-50"
                    style={{ background: "var(--ip)" }}
                  >
                    <UserAvatar name={opt.name} avatarUrl={opt.avatarUrl} size="sm" />
                    <span className="flex-1 text-sm font-bold truncate" style={{ color: "var(--tx)" }}>{opt.name}</span>
                    {challenging === opt.id ? (
                      <BallLoader size="sm" />
                    ) : alreadyChallenged.has(opt.id) ? (
                      <span className="text-[10px] font-bold" style={{ color: "var(--t2)" }}>Challenged</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
