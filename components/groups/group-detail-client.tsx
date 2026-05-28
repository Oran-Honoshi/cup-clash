"use client";

import { useState } from "react";
import { Trophy, Users, DollarSign, Target, Lock, Shield, ArrowRight, MessageCircle, Info } from "lucide-react";
import Link from "next/link";
import { GroupChat } from "@/components/chat/group-chat";
import { CorporateUnlockOverlay } from "@/components/groups/corporate-unlock-overlay";
import { MemberAvatar } from "@/components/ui/member-avatar";

interface GroupDetailClientProps {
  group: { id: string; name: string; passkey: string; admin_id: string; buy_in_amount: number; payout_first: number; payout_second: number; payout_third: number; max_members: number; is_corporate_paid?: boolean };
  rules: Record<string, number | boolean> | null;
  members: Array<{ user_id: string; payment_status: string; can_predict: boolean; profiles: { name: string; country: string | null; avatar_url: string | null } | null }>;
  currentUserId: string;
  isAdmin: boolean;
  isMember: boolean;
}

const TABS = [
  { id: "overview", label: "Overview",   icon: Info          },
  { id: "chat",     label: "Group Chat", icon: MessageCircle },
];

const SCORING_LABELS: Record<string, string> = {
  correct_outcome: "Correct outcome", exact_score: "Exact score", ko_advancement: "KO advancement",
  tournament_winner: "Tournament winner", top_scorer: "Top scorer", top_assister: "Top assister",
  golden_ball: "Golden Ball", best_defence: "Best defence", best_young_player: "Best young player", best_third: "Best 3rd-place (each)",
};

const ENABLE_KEYS: Record<string, string> = {
  correct_outcome: "enable_outcome", exact_score: "enable_exact", ko_advancement: "enable_ko_advancement",
  tournament_winner: "enable_winner", top_scorer: "enable_scorer", top_assister: "enable_assister",
  golden_ball: "enable_golden_ball", best_defence: "enable_best_defence", best_young_player: "enable_best_young_player", best_third: "enable_best_third",
};

const glass = { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.06)" } as const;

export function GroupDetailClient({ group, rules, members, currentUserId, isAdmin, isMember }: GroupDetailClientProps) {
  const [tab, setTab] = useState<"overview" | "chat">("overview");
  const paidCount = members.filter(m => m.payment_status === "paid").length;
  const totalPot  = (group.buy_in_amount ?? 0) * paidCount;
  const scoringRows = Object.entries(SCORING_LABELS).filter(([key]) => { const ek = ENABLE_KEYS[key]; return !ek || rules?.[ek] !== false; });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/groups" className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "#00D4FF" }}>← My Groups</Link>
          <h1 className="font-display text-4xl uppercase font-black text-white truncate">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isAdmin  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>Admin</span>}
            {isMember && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88",  border: "1px solid rgba(0,255,136,0.2)"  }}>Member</span>}
          </div>
        </div>
        {isAdmin && (
          <Link href={`/admin/${group.id}`}>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
              <Shield size={15} /> Manage
            </button>
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as "overview" | "chat")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={active ? { background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.35)", color: "#00D4FF" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              <t.icon size={15} style={{ color: active ? "#00D4FF" : "rgba(255,255,255,0.3)" }} />
              {t.label}
              {t.id === "chat" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,212,255,0.15)", color: "#00D4FF" }}>{paidCount}</span>}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users,      label: "Members",   value: `${paidCount}`,                accent: "#00D4FF" },
              { icon: DollarSign, label: "Buy-in",    value: `$${group.buy_in_amount ?? 0}`, accent: "#00FF88" },
              { icon: Trophy,     label: "Prize pot", value: `$${totalPot}`,                accent: "#fbbf24" },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="rounded-2xl p-4 text-center" style={glass}>
                <Icon size={18} className="mx-auto mb-2" style={{ color: accent }} />
                <div className="font-display text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
              </div>
            ))}
          </div>

          {isAdmin && !group.is_corporate_paid ? (
            <CorporateUnlockOverlay groupId={group.id} groupName={group.name} passkey={group.passkey} />
          ) : (
            <div className="rounded-2xl p-5 text-center" style={glass}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>Entry Passkey</div>
              <div className="font-mono font-black text-4xl tracking-[0.2em] mb-1 text-white">{group.passkey}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>cupclash.live/join/{group.passkey}</div>
            </div>
          )}

          <div className="rounded-2xl p-5" style={glass}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Prize Split</div>
            <div className="space-y-3">
              {[
                { label: "🥇 1st", pct: group.payout_first  ?? 60, color: "#fbbf24" },
                { label: "🥈 2nd", pct: group.payout_second ?? 30, color: "#94a3b8" },
                { label: "🥉 3rd", pct: group.payout_third  ?? 10, color: "#f97316" },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm w-12" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.8 }} />
                  </div>
                  <span className="text-sm font-black w-10 text-right" style={{ color }}>{pct}%</span>
                  {totalPot > 0 && <span className="text-xs w-12 text-right" style={{ color: "rgba(255,255,255,0.3)" }}>${Math.round(totalPot * pct / 100)}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={glass}>
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} style={{ color: "#00D4FF" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Scoring Rules</span>
              <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}><Lock size={10} /> Locks June 11</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scoringRows.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
                  <span className="text-sm font-black" style={{ color: "#00D4FF" }}>+{rules?.[key] as number ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={glass}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Members ({paidCount} paid)</span>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {members.map(m => (
                <div key={m.user_id} className="flex items-center gap-3 px-5 py-3">
                  <MemberAvatar name={m.profiles?.name ?? "?"} avatarUrl={m.profiles?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate text-white">
                      {m.profiles?.name ?? "Unknown"}
                      {m.user_id === currentUserId && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88" }}>You</span>}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{m.profiles?.country ?? ""}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={m.payment_status === "paid" ? { background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" } : { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                    {m.payment_status === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </div>
              ))}
              {!members.length && <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No members yet.</div>}
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                Dashboard <ArrowRight size={15} />
              </button>
            </Link>
            {isAdmin && (
              <Link href={`/admin/${group.id}`}>
                <button className="px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
                  Admin Panel
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {tab === "chat" && (
        <div className="rounded-2xl overflow-hidden" style={glass}>
          <GroupChat groupId={group.id} currentUserId={currentUserId} currentUserName="" isPaid={isMember} />
        </div>
      )}
    </div>
  );
}