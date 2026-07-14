"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, DollarSign, Target, Lock, Shield, ArrowRight, MessageCircle, Info, Trash2, Gift, CheckCircle, Clock, GraduationCap, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { GroupChat } from "@/components/chat/group-chat";
import { GroupStreakCard } from "@/components/daily-challenge/group-streak-card";
import { RivalScoreboardCard } from "@/components/groups/rival-scoreboard-card";
import { PointsRaceChart } from "@/components/groups/points-race-chart";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { MatchResultsTable } from "@/components/groups/match-results-table";
import { LeaderboardList } from "@/components/dashboard/leaderboard-list";
import { PredictionsClient } from "@/components/predictions/predictions-client";
import { RulesSummary } from "@/components/groups/rules-summary";
import { AdminGroupSector } from "@/components/admin/admin-group-sector";
import { GroupSwitcherControl } from "@/components/groups/group-switcher-control";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";
import { compareMembersForRanking } from "@/lib/leaderboard-sort";
import type { Group as AdminGroup, Member as LeaderboardMember } from "@/lib/types";
import type { ScheduleMatch } from "@/lib/schedule";

export type SubSector = "predictions" | "leaderboard" | "chat" | "rules" | "admin" | "info";

interface GroupDetailClientProps {
  group: { id: string; name: string; passkey: string; admin_id: string; buy_in_amount: number; payout_first: number; payout_second: number; payout_third: number; max_members: number; is_corporate_paid?: boolean; corporate_prize?: string | null; currency_symbol?: string | null; payment_link?: string | null; enable_group_stage_prize?: boolean | null; group_stage_prize_amount?: number | null; group_stage_prize_label?: string | null; show_prize_split?: boolean | null; show_entry_fee?: boolean | null; show_prize_pot?: boolean | null; show_buy_in_tracker?: boolean | null; show_payment_link?: boolean | null; group_mode?: string | null; winner_message?: string | null };
  rules: Record<string, number | boolean> | null;
  members: Array<{ user_id: string; payment_status: string; can_predict: boolean; paid: boolean; is_ad_free: boolean; profiles: { name: string; country: string | null; avatar_url: string | null } | null }>;
  leaderboardMembers: LeaderboardMember[];
  allMatches: ScheduleMatch[];
  allGroups: Array<{ id: string; name: string; passkey: string }>;
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
  isMember: boolean;
  isAdFree: boolean;
  isCorporate: boolean;
  adminData: { group: AdminGroup; members: LeaderboardMember[]; isOwner: boolean; finalLocked: boolean } | null;
  initialTab?: SubSector;
}

const glass = { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.06)" } as const;

export function GroupDetailClient({
  group, rules, members, leaderboardMembers, allMatches, allGroups,
  currentUserId, currentUserName, isAdmin, isMember, isAdFree, isCorporate, adminData,
  initialTab = "predictions",
}: GroupDetailClientProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<SubSector>(initialTab);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settledOpen, setSettledOpen] = useState(false);
  const paidCount = members.filter(m => m.paid || m.payment_status === "paid").length;

  const TABS = [
    { id: "predictions" as const, label: t("nav_predictions"), icon: Target       },
    { id: "leaderboard" as const, label: t("nav_leaderboard"), icon: Trophy       },
    { id: "chat"        as const, label: t("nav_chat"),        icon: MessageCircle },
    { id: "rules"       as const, label: t("grp_rules"),       icon: ClipboardList },
    ...(isAdmin ? [{ id: "admin" as const, label: t("common_admin"), icon: Shield }] : []),
    { id: "info"        as const, label: t("grp_info"),        icon: Info         },
  ];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.push("/groups");
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const totalPot  = (group.buy_in_amount ?? 0) * paidCount;
  const showPrizeSplit    = group.show_prize_split    ?? true;
  const showEntryFee      = group.show_entry_fee      ?? true;
  const showPrizePot      = group.show_prize_pot      ?? true;
  const showBuyInTracker  = group.show_buy_in_tracker ?? true;
  const showPaymentLink   = group.show_payment_link   ?? true;
  const isFriendly        = group.group_mode === "friendly";

  const sortedLeaderboard = [...leaderboardMembers].sort(compareMembersForRanking);
  const myRank = sortedLeaderboard.findIndex(m => m.id === currentUserId) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-5 overflow-x-clip pb-32">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/groups" className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "#00D4FF" }}>{t("grp_back")}</Link>
          <h1 className="font-display text-2xl sm:text-4xl uppercase font-black text-white break-words">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isAdmin  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>{t("common_admin")}</span>}
            {isMember && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88",  border: "1px solid rgba(0,255,136,0.2)"  }}>{t("common_member")}</span>}
            <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>
              {members.length} {t("grp_members")}{myRank > 0 ? ` · #${myRank}` : ""}
            </span>
          </div>
        </div>
        <GroupSwitcherControl currentGroupId={group.id} allGroups={allGroups} activeTab={tab} />
      </div>

      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {TABS.map(tab_ => {
          const active = tab === tab_.id;
          return (
            <button key={tab_.id} onClick={() => setTab(tab_.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0"
              style={active ? { background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.35)", color: "#00D4FF" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              <tab_.icon size={15} style={{ color: active ? "#00D4FF" : "rgba(255,255,255,0.3)" }} />
              {tab_.label}
              {tab_.id === "chat" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,212,255,0.15)", color: "#00D4FF" }}>{paidCount}</span>}
            </button>
          );
        })}
      </div>

      {tab === "predictions" && (
        <div className="space-y-4">
          <div className="-mx-4 sm:-mx-6">
            <PredictionsClient
              groupId={group.id}
              groupName={group.name}
              allGroups={allGroups}
              userId={currentUserId}
              isPaid={true}
              isAdFree={isAdFree}
              isCorporate={isCorporate}
              allMatches={allMatches}
            />
          </div>

          <div className="rounded-2xl overflow-hidden" style={glass}>
            <button
              onClick={() => setSettledOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Recently Settled</span>
              {settledOpen ? <ChevronUp size={14} style={{ color: "rgba(255,255,255,0.4)" }} /> : <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />}
            </button>
            {settledOpen && (
              <div className="px-1 pb-1">
                <MatchResultsTable groupId={group.id} members={members} />
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="space-y-4">
          <LeaderboardList
            members={leaderboardMembers}
            currentUserId={currentUserId}
            groupId={group.id}
            groupName={group.name}
            variant="full"
            isAdFree={isAdFree}
            isCorporate={isCorporate}
          />
          <PointsRaceChart groupId={group.id} />
          <RivalScoreboardCard groupId={group.id} />
        </div>
      )}

      {tab === "chat" && (
        <div className="rounded-2xl overflow-hidden" style={glass}>
          <GroupChat groupId={group.id} currentUserId={currentUserId} currentUserName={currentUserName} isPaid={isMember} inline />
        </div>
      )}

      {tab === "rules" && (
        <RulesSummary rules={rules} />
      )}

      {tab === "admin" && isAdmin && adminData && (
        <AdminGroupSector
          group={adminData.group}
          members={adminData.members}
          isOwner={adminData.isOwner}
          currentUserId={currentUserId}
          adminName={currentUserName}
          finalLocked={adminData.finalLocked}
          groupId={group.id}
        />
      )}

      {tab === "info" && (
        <div className="space-y-4">
          {isFriendly && (
            <>
              {group.winner_message && (
                <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
                  style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)" }}>
                  <Trophy size={20} style={{ color: "#fbbf24", flexShrink: 0 }} />
                  <span className="font-display text-lg uppercase font-black" style={{ color: "#fbbf24" }}>
                    {group.winner_message}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
                <GraduationCap size={14} style={{ color: "#00D4FF" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00D4FF" }}>
                  Family &amp; School Group
                </span>
              </div>
            </>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Users,      label: t("grp_members"),   value: `${members.length}`,           accent: "#00D4FF", show: true },
              { icon: DollarSign, label: t("grp_entry"),     value: `${group.currency_symbol ?? "$"}${group.buy_in_amount ?? 0}`, accent: "#00FF88", show: showEntryFee },
              { icon: Trophy,     label: t("grp_prize_pot"), value: `${group.currency_symbol ?? "$"}${totalPot}`,                 accent: "#fbbf24", show: showPrizePot },
            ].filter(c => c.show).map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="rounded-2xl p-3 text-center overflow-hidden w-full" style={glass}>
                <Icon size={16} className="mx-auto mb-1.5" style={{ color: accent }} />
                <div className="font-display text-lg sm:text-2xl font-black text-white truncate">{value}</div>
                <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
              </div>
            ))}
          </div>

          <GroupStreakCard groupId={group.id} />

          <div className="space-y-3">
            {group.is_corporate_paid && (
              <div className="rounded-2xl px-4 py-3 text-sm text-center" style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)", color: "rgba(255,255,255,0.75)" }}>
                🏢 Sponsored Group — Free access, no ads, courtesy of your organization
              </div>
            )}
            <div className="rounded-2xl p-5 text-center" style={glass}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>{t("grp_passkey")}</div>
              <div className="font-mono font-black text-3xl sm:text-4xl tracking-[0.1em] sm:tracking-[0.2em] mb-1 text-white overflow-hidden">{group.passkey}</div>
              <div className="text-xs overflow-hidden" style={{ color: "rgba(255,255,255,0.3)", wordBreak: "break-all" }}>cupclash.live/join/{group.passkey}</div>
            </div>
            {showPaymentLink && group.payment_link && (
              <a href={group.payment_link} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF" }}>
                💳 Send Entry
              </a>
            )}
          </div>

          {showPrizeSplit && (
            <div className="rounded-2xl p-5" style={glass}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>{t("grp_prize_split")}</div>
              <div className="space-y-3">
                {[
                  { label: "🥇 1st", pct: group.payout_first  ?? 60, color: "#fbbf24" },
                  { label: "🥈 2nd", pct: group.payout_second ?? 30, color: "#94a3b8" },
                  { label: "🥉 3rd", pct: group.payout_third  ?? 10, color: "#f97316" },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-2 w-full">
                    <span className="text-sm w-10 shrink-0" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                    <div className="flex-1 min-w-0 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.8 }} />
                    </div>
                    <span className="text-sm font-black w-9 text-right shrink-0" style={{ color }}>{pct}%</span>
                    {totalPot > 0 && <span className="text-xs w-10 text-right shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{group.currency_symbol ?? "$"}{Math.round(totalPot * pct / 100)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {group.corporate_prize && (
            <div className="rounded-2xl p-5" style={glass}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} style={{ color: "#fbbf24" }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Prizes</span>
              </div>
              <div className="space-y-2">
                {group.corporate_prize.split("|").map(r => r.trim()).filter(Boolean).map(reward => (
                  <div key={reward} className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{reward}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {group.enable_group_stage_prize && (group.group_stage_prize_amount || group.group_stage_prize_label) && (
            <div className="rounded-2xl p-5" style={glass}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift size={16} style={{ color: "#a78bfa" }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Group Stage Winner Prize</span>
                </div>
                {(group.group_stage_prize_amount || group.group_stage_prize_label) && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                    {group.group_stage_prize_label ?? `${group.currency_symbol ?? "$"}${group.group_stage_prize_amount}`}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Awarded to the top scorer at the end of the group stage (approx. July 2).
              </p>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden" style={glass}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Members ({members.length})</span>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {members.map(m => (
                <div key={m.user_id} className="flex items-center gap-3 px-5 py-3">
                  <MemberAvatar name={m.profiles?.name ?? "?"} avatarUrl={m.profiles?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate text-white">
                      {m.profiles?.name ?? "Unknown"}
                      {m.user_id === currentUserId && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88" }}>{t("common_you")}</span>}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{m.profiles?.country ?? ""}</div>
                  </div>
                  {showBuyInTracker && (group.buy_in_amount ?? 0) > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={(m.paid || m.payment_status === "paid")
                        ? { background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }
                        : { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                      {(m.paid || m.payment_status === "paid")
                        ? <><CheckCircle size={10} /> Paid</>
                        : <><Clock size={10} /> Pending</>}
                    </span>
                  ) : (
                    !showBuyInTracker ? null : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={m.is_ad_free ? { background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" } : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {m.is_ad_free ? t("grp_adfree") : "Free"}
                      </span>
                    )
                  )}
                </div>
              ))}
              {!members.length && <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>{t("grp_no_members")}</div>}
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <button className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                {t("common_dashboard")} <ArrowRight size={15} />
              </button>
            </Link>
            {isAdmin && (
              <button onClick={() => setTab("admin")} className="px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
                {t("common_admin_panel")}
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              <Trash2 size={14} /> {t("grp_delete")}
            </button>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "rgba(18,14,38,0.98)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>
                <Trash2 size={18} style={{ color: "#f87171" }} />
              </div>
              <div>
                <div className="font-display text-lg uppercase font-black text-white">{t("grp_del_title")}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t("grp_del_undo")}</div>
              </div>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {interpolate(t("grp_del_body"), { name: group.name })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                {t("common_cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>
                {deleting ? t("grp_deleting") : t("common_delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
