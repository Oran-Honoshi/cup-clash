"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Shield, MessageCircle, Users, ArrowRight, ArrowLeft, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BallLoader } from "@/components/ui/BallLoader";
import {
  mapFantasyPlayerRow, tallyByPosition, budgetRemaining,
  SQUAD_BUDGET_CREDITS, SQUAD_SIZE, POSITION_ORDER,
  type FantasyPlayerRow, type FantasyPosition,
} from "@/lib/services/fantasy";
import { GameweekPicksPanel } from "@/components/fantasy/gameweek-picks-panel";

// League home view: squad summary + chat, mirroring the pattern established
// by group-detail-client.tsx's tab bar (predictions/leaderboard/.../chat) —
// a much lighter version since Fantasy League v1 has just these two facets.
const GroupChat = dynamic(() => import("@/components/chat/group-chat").then(m => m.GroupChat), {
  loading: () => <div className="flex justify-center py-12"><BallLoader size="md" /></div>,
});

const POS_COLOR: Record<FantasyPosition, string> = {
  GK: "#f59e0b", DEF: "#60a5fa", MID: "#4ade80", FWD: "#f87171",
};

const glassCard = {
  background: "rgba(18,14,38,0.32)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
};

interface LeagueInfo { id: string; name: string; competitionId: string; memberCount: number; }

export default function FantasyLeagueHomePage() {
  const params = useParams();
  const leagueId = params.leagueId as string;

  const [tab, setTab] = useState<"squad" | "gameweek" | "chat">("squad");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [league, setLeague] = useState<LeagueInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [squadId, setSquadId] = useState<string | null>(null);
  const [players, setPlayers] = useState<FantasyPlayerRow[] | null>(null); // null = no squad saved yet

  useEffect(() => {
    if (!leagueId) return;
    const sb = createClient();

    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoadError("You must be signed in"); setLoading(false); return; }
      setUserId(user.id);

      const { data: profile } = await sb.from("profiles").select("name").eq("id", user.id).single();
      setUserName((profile as { name: string } | null)?.name ?? "");

      const { data: leagueRow, error: leagueErr } = await sb
        .from("fantasy_leagues")
        .select("id, name, competition_id")
        .eq("id", leagueId)
        .single();
      if (leagueErr || !leagueRow) { setLoadError("Fantasy league not found"); setLoading(false); return; }
      const l = leagueRow as { id: string; name: string; competition_id: string };

      const { count: memberCount } = await sb
        .from("fantasy_league_members")
        .select("id", { count: "exact", head: true })
        .eq("fantasy_league_id", leagueId);

      setLeague({ id: l.id, name: l.name, competitionId: l.competition_id, memberCount: memberCount ?? 0 });

      const { data: squadRow } = await sb
        .from("fantasy_squads")
        .select("id")
        .eq("fantasy_league_id", leagueId)
        .eq("user_id", user.id)
        .maybeSingle();
      const sq = squadRow as { id: string } | null;

      if (sq) {
        setSquadId(sq.id);
        const { data: squadPlayerRows } = await sb
          .from("fantasy_squad_players")
          .select("fantasy_players ( id, competition_id, api_player_id, api_team_id, full_name, team_name, position, photo, credit_cost )")
          .eq("fantasy_squad_id", sq.id)
          .is("removed_at", null);
        const mapped = ((squadPlayerRows ?? []) as unknown as Array<{ fantasy_players: Parameters<typeof mapFantasyPlayerRow>[0] }>)
          .map(row => mapFantasyPlayerRow(row.fantasy_players));
        setPlayers(mapped);
      }

      setLoading(false);
    })();
  }, [leagueId]);

  if (loading) {
    return <div className="py-16 flex justify-center"><BallLoader label="Loading league…" /></div>;
  }
  if (loadError || !league || !userId) {
    return (
      <div className="max-w-[480px] mx-auto py-16 text-center" style={{ color: "var(--t2)" }}>
        {loadError ?? "Fantasy league not found"}
      </div>
    );
  }

  const tally = players ? tallyByPosition(players) : null;
  const remaining = players ? budgetRemaining(players) : SQUAD_BUDGET_CREDITS;

  return (
    <div className="max-w-[480px] mx-auto space-y-4 pb-32">
      <div>
        <Link href="/groups" className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "#00D4FF" }}>
          <ArrowLeft size={12} /> Back
        </Link>
        <h1 className="font-display text-3xl uppercase" style={{ color: "var(--tx)" }}>{league.name}</h1>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
          <Users size={12} /> {league.memberCount} member{league.memberCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { id: "squad"    as const, label: "Squad",    icon: Shield },
          { id: "gameweek" as const, label: "Gameweek", icon: Crown  },
          { id: "chat"     as const, label: "Chat",      icon: MessageCircle },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0"
              style={active
                ? { background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.35)", color: "#00D4FF" }
                : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              <t.icon size={15} style={{ color: active ? "#00D4FF" : "rgba(255,255,255,0.3)" }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "squad" && (
        <div className="space-y-4">
          {!players ? (
            <div style={{ ...glassCard, padding: 24, textAlign: "center" }} className="space-y-3">
              <Shield size={28} className="mx-auto" style={{ color: "#00D4FF" }} />
              <p className="text-sm" style={{ color: "var(--t2)" }}>You haven&apos;t built your squad yet.</p>
              <Link href={`/fantasy/${leagueId}/squad`}
                className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{
                  padding: "12px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #00FF88, #00D4FF)",
                  color: "#0B141B", fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: 14, textTransform: "uppercase", cursor: "pointer",
                }}>
                Build Your Squad <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <>
              <div style={{ ...glassCard, padding: 16 }} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span style={{ color: "var(--t2)" }}>Budget</span>
                  <span style={{ color: remaining < 0 ? "#f87171" : "#00D4FF", fontFamily: "var(--font-mono)" }}>
                    {remaining.toFixed(1)} / {SQUAD_BUDGET_CREDITS} remaining
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {POSITION_ORDER.map(pos => (
                    <span key={pos} className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: `${POS_COLOR[pos]}18`, color: POS_COLOR[pos] }}>
                      {pos} {tally![pos]}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "var(--ip)", color: "var(--t2)" }}>
                    {players.length}/{SQUAD_SIZE} players
                  </span>
                </div>
              </div>
              <Link href={`/fantasy/${leagueId}/squad`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF" }}>
                Manage Transfers <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      )}

      {tab === "gameweek" && (
        <GameweekPicksPanel competitionId={league.competitionId} squadId={squadId} players={players} />
      )}

      {tab === "chat" && (
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <GroupChat fantasyLeagueId={leagueId} groupId={undefined} currentUserId={userId} currentUserName={userName} isPaid inline />
        </div>
      )}
    </div>
  );
}
