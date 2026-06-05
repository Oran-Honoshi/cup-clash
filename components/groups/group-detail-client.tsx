"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, DollarSign, Target, Lock, Shield, ArrowRight, MessageCircle, Info, Trash2 } from "lucide-react";
import Link from "next/link";
import { GroupChat } from "@/components/chat/group-chat";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { useLocale } from "@/components/i18n/locale-provider";
import { interpolate } from "@/lib/i18n";

interface GroupDetailClientProps {
  group: { id: string; name: string; passkey: string; admin_id: string; buy_in_amount: number; payout_first: number; payout_second: number; payout_third: number; max_members: number; is_corporate_paid?: boolean; corporate_prize?: string | null };
  rules: Record<string, number | boolean> | null;
  members: Array<{ user_id: string; payment_status: string; can_predict: boolean; paid: boolean; is_ad_free: boolean; profiles: { name: string; country: string | null; avatar_url: string | null } | null }>;
  currentUserId: string;
  isAdmin: boolean;
  isMember: boolean;
}

const ENABLE_KEYS: Record<string, string> = {
  correct_outcome: "enable_outcome", exact_score: "enable_exact", ko_advancement: "enable_ko_advancement",
  tournament_winner: "enable_winner", top_scorer: "enable_scorer", top_assister: "enable_assister",
  golden_ball: "enable_golden_ball", best_defence: "enable_best_defence", best_young_player: "enable_best_young_player", best_third: "enable_best_third",
};

const glass = { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.06)" } as const;

export function GroupDetailClient({ group, rules, members, currentUserId, isAdmin, isMember }: GroupDetailClientProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "chat">("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const paidCount = members.filter(m => m.paid).length;  // admin buy-in toggle

  const TABS = [
    { id: "overview", label: t("grp_overview"), icon: Info          },
    { id: "chat",     label: t("nav_chat"),      icon: MessageCircle },
  ];

  const SCORING_LABELS: Record<string, string> = {
    correct_outcome:   t("sc_outcome"),
    exact_score:       t("sc_exact"),
    ko_advancement:    t("sc_ko"),
    tournament_winner: t("sc_winner"),
    top_scorer:        t("sc_scorer"),
    top_assister:      t("sc_assister"),
    golden_ball:       t("sc_golden"),
    best_defence:      t("sc_defence"),
    best_young_player: t("sc_young"),
    best_third:        t("sc_third"),
  };

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
  const scoringRows = Object.entries(SCORING_LABELS).filter(([key]) => { const ek = ENABLE_KEYS[key]; return !ek || rules?.[ek] !== false; });

  return (
    <div className="max-w-2xl mx-auto space-y-5 overflow-x-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/groups" className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "#00D4FF" }}>{t("grp_back")}</Link>
          <h1 className="font-display text-2xl sm:text-4xl uppercase font-black text-white break-words">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isAdmin  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>{t("common_admin")}</span>}
            {isMember && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.12)", color: "#00FF88",  border: "1px solid rgba(0,255,136,0.2)"  }}>{t("common_member")}</span>}
          </div>
        </div>
        {isAdmin && (
          <Link href={`/admin/${group.id}`}>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
              <Shield size={15} /> {t("grp_manage")}
            </button>
          </Link>
        )}
      </div>

      <div className="flex gap-2">
        {TABS.map(tab_ => {
          const active = tab === tab_.id;
          return (
            <button key={tab_.id} onClick={() => setTab(tab_.id as "overview" | "chat")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={active ? { background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.35)", color: "#00D4FF" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              <tab_.icon size={15} style={{ color: active ? "#00D4FF" : "rgba(255,255,255,0.3)" }} />
              {tab_.label}
              {tab_.id === "chat" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,212,255,0.15)", color: "#00D4FF" }}>{paidCount}</span>}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Users,      label: t("grp_members"),   value: `${paidCount}`,                accent: "#00D4FF" },
              { icon: DollarSign, label: t("grp_entry"),     value: `$${group.buy_in_amount ?? 0}`, accent: "#00FF88" },
              { icon: Trophy,     label: t("grp_prize_pot"), value: `$${totalPot}`,                 accent: "#fbbf24" },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="rounded-2xl p-3 text-center overflow-hidden w-full" style={glass}>
                <Icon size={16} className="mx-auto mb-1.5" style={{ color: accent }} />
                <div className="font-display text-lg sm:text-2xl font-black text-white truncate">{value}</div>
                <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {group.is_corporate_paid && !isAdmin && (
              <div className="rounded-2xl px-4 py-3 text-sm text-center" style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)", color: "rgba(255,255,255,0.75)" }}>
                ✓ This is a sponsored group — your access is fully free, courtesy of your organization.
              </div>
            )}
            <div className="rounded-2xl p-5 text-center" style={glass}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#00D4FF" }}>{t("grp_passkey")}</div>
              <div className="font-mono font-black text-3xl sm:text-4xl tracking-[0.1em] sm:tracking-[0.2em] mb-1 text-white overflow-hidden">{group.passkey}</div>
              <div className="text-xs overflow-hidden" style={{ color: "rgba(255,255,255,0.3)", wordBreak: "break-all" }}>cupclash.live/join/{group.passkey}</div>
            </div>
          </div>

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
                  {totalPot > 0 && <span className="text-xs w-10 text-right shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>${Math.round(totalPot * pct / 100)}</span>}
                </div>
              ))}
            </div>
          </div>

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

          <div className="rounded-2xl p-5" style={glass}>
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} style={{ color: "#00D4FF" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{t("grp_scoring")}</span>
              <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}><Lock size={10} /> {t("grp_locks")}</span>
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={m.is_ad_free ? { background: "rgba(0,255,136,0.12)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" } : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {m.is_ad_free ? t("grp_adfree") : "Free"}
                  </span>
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
              <Link href={`/admin/${group.id}`}>
                <button className="px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
                  {t("common_admin_panel")}
                </button>
              </Link>
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

      {tab === "chat" && (
        <div className="rounded-2xl overflow-hidden" style={glass}>
          <GroupChat groupId={group.id} currentUserId={currentUserId} currentUserName="" isPaid={isMember} inline />
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